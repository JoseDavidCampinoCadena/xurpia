import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AiConversationService, ChatMessage } from './ai-conversation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from '../AI/ai.service';

@Controller('ai-conversations')
@UseGuards(JwtAuthGuard)
export class AiConversationController {
  constructor(
    private readonly aiConversationService: AiConversationService,
    private readonly aiService: AiService
  ) {
    console.log('🚀 AiConversationController initialized');
  }

  @Get()
  async getUserConversations(@Request() req) {
    return this.aiConversationService.getUserConversations(req.user.userId);
  }

  @Get(':id')
  async getConversationById(@Param('id') id: string, @Request() req) {
    return this.aiConversationService.getConversationById(id, req.user.userId);
  }
  @Post('send-message')
  async sendMessage(
    @Request() req,
    @Body() body: { 
      conversationId?: string; 
      message: string; 
    }
  ) {
    console.log('📨 Received send-message request:', {
      userId: req.user?.userId,
      conversationId: body.conversationId,
      messageLength: body.message?.length
    });

    const { conversationId, message } = body;
    const userId = req.user.userId;

    if (!message || !message.trim()) {
      console.error('❌ Empty message received');
      throw new Error('Message cannot be empty');
    }

    try {
      console.log('👤 Processing message for user:', userId);const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      let conversation;

      if (conversationId) {
        // Add to existing conversation
        conversation = await this.aiConversationService.addMessageToConversation(
          conversationId,
          userId,
          userMessage
        );
      } else {
        // Create new conversation
        conversation = await this.aiConversationService.createConversation(userId, userMessage);
      }      // Prepare conversation context for AI
      const conversationContext = conversation.messages
        .map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`)
        .join('\n');
      
      const prompt = `Eres Xurp IA, un asistente inteligente especializado en gestión de proyectos, desarrollo de software y colaboración en equipos. 

Conversación anterior:
${conversationContext}

Responde de manera útil, profesional y concisa. Si no tienes información específica, sé honesto al respecto pero ofrece alternativas o sugerencias relacionadas.`;      // Call Hugging Face AI service with fallback to real AI APIs
      let aiResponseText;
      try {
        console.log('Attempting to call AI service with prompt length:', prompt.length);
        aiResponseText = await this.aiService.generateText(prompt);
        console.log('✅ AI service succeeded, response length:', aiResponseText.length);
        
        // Check if response is too short and try alternative APIs
        if (aiResponseText.length < 15) {
          console.log('🔄 Response too short, trying alternative AI APIs...');
          aiResponseText = await this.tryAlternativeAIAPIs(message, conversation.messages);
        }

      } catch (aiError) {
        console.warn('❌ AI service failed:', aiError.message);
        console.log('🔄 Trying alternative AI APIs...');
        aiResponseText = await this.tryAlternativeAIAPIs(message, conversation.messages);
      }      // Safety check - only use local fallback if all APIs fail
      if (!aiResponseText || aiResponseText.trim() === '' || aiResponseText === 'Not Found') {
        console.warn('⚠️ All AI APIs failed, using minimal fallback');
        aiResponseText = `Hola, soy Xurp IA. En este momento estoy experimentando problemas de conectividad con los servicios de IA. 

Por favor, intenta de nuevo en unos momentos. Mientras tanto, puedo ayudarte con información específica sobre:
• Gestión de proyectos y metodologías ágiles
• Desarrollo de software y tecnologías
• Colaboración en equipos

¿En qué área específica necesitas ayuda?`;
      }

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toISOString(),
      };

      // Add AI response to conversation
      const updatedConversation = await this.aiConversationService.addMessageToConversation(
        conversation.id,
        userId,
        aiMessage
      );

      return {
        conversation: updatedConversation,
        reply: aiMessage.content,
      };

    } catch (error) {
      console.error('Error in AI conversation:', error);
      throw new Error('Error processing AI conversation');
    }
  }

  @Delete(':id')
  async deleteConversation(@Param('id') id: string, @Request() req) {
    await this.aiConversationService.deleteConversation(id, req.user.userId);
    return { message: 'Conversation deleted successfully' };
  }

  @Post(':id/rename')
  async renameConversation(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { title: string }
  ) {
    return this.aiConversationService.updateConversationTitle(id, req.user.userId, body.title);
  }

  @Post('test-ai')
  async testAI(@Body() body: { message: string }) {
    try {
      console.log('🧪 Testing Hugging Face API with message:', body.message);
      const response = await this.aiService.generateText(body.message);
      return {
        success: true,
        response,
        message: 'Hugging Face API is working!'
      };
    } catch (error) {
      console.error('🚨 Hugging Face API test failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Hugging Face API is not working'
      };
    }
  }

  @Get('health')
  async healthCheck() {
    console.log('🏥 AI Conversation health check requested');
    return {
      status: 'ok',
      service: 'ai-conversations',
      timestamp: new Date().toISOString(),
      message: 'AI Conversation service is running'    };
  }

  private generateFallbackResponse(userMessage: string, conversationHistory: ChatMessage[]): string {
    const message = userMessage.toLowerCase();
    const isFirstMessage = conversationHistory.length <= 1;
    
    console.log('🔍 Generating fallback response for:', userMessage);
    console.log('🔍 Lowercase message:', message);

    // Specific question about whales
    if (message.includes('ballena') || message.includes('whale')) {
      if (message.includes('color')) {
        return `Las ballenas pueden tener diferentes colores dependiendo de la especie:

**Colores comunes de ballenas:**
• **Ballena azul**: Gris azulado con manchas más claras
• **Ballena jorobada**: Negro en el dorso, blanco en el vientre
• **Ballena gris**: Gris moteado con parches blancos
• **Orca**: Negro con manchas blancas distintivas
• **Ballena beluga**: Blanco puro (adultos)

En general, la mayoría de ballenas tienen tonos de gris, desde gris claro hasta casi negro, con patrones únicos de cada especie.`;
      }
      return `Las ballenas son mamíferos marinos fascinantes. Hay muchas especies diferentes, desde la ballena azul (el animal más grande del planeta) hasta las orcas. ¿Te interesa saber algo específico sobre las ballenas?`;
    }

    // General knowledge questions
    if (message.includes('capital') && message.includes('colombia')) {
      return 'La capital de Colombia es **Bogotá**. Es la ciudad más grande del país y el centro político, económico y administrativo de Colombia.';
    }

    if (message.includes('capital') && (message.includes('españa') || message.includes('spain'))) {
      return 'La capital de España es **Madrid**. Es la ciudad más poblada del país y sede del gobierno español.';
    }

    if (message.includes('capital') && (message.includes('francia') || message.includes('france'))) {
      return 'La capital de Francia es **París**. Es conocida como la "Ciudad de la Luz" y es uno de los principales centros culturales del mundo.';
    }

    if (message.includes('capital') && (message.includes('italia') || message.includes('italy'))) {
      return 'La capital de Italia es **Roma**. Es conocida como la "Ciudad Eterna" y fue el centro del Imperio Romano.';
    }

    if (message.includes('capital') && (message.includes('alemania') || message.includes('germany'))) {
      return 'La capital de Alemania es **Berlín**. Es la ciudad más poblada del país y un importante centro político y cultural europeo.';
    }

    // Basic math questions
    if (message.includes('cuánto es') || message.includes('cuanto es')) {
      if (message.includes('2+2') || message.includes('2 + 2')) {
        return '2 + 2 = **4**';
      }
      if (message.includes('5*5') || message.includes('5 * 5') || message.includes('5x5')) {
        return '5 × 5 = **25**';
      }
    }

    // Greeting responses
    if (isFirstMessage || message.includes('hola') || message.includes('hello') || message.includes('hi')) {
      return `¡Hola! Soy Xurp IA, tu asistente inteligente.

Puedo ayudarte con:
• **Preguntas generales** y conocimiento básico
• **Gestión de Proyectos**: Planificación y metodologías
• **Desarrollo de Software**: Buenas prácticas y tecnologías  
• **Colaboración en Equipos**: Comunicación y herramientas

¿En qué puedo ayudarte hoy?`;
    }

    // Project management topics
    if (message.includes('proyecto') || message.includes('planificar') || message.includes('gestión')) {
      return `Para la gestión de proyectos, te recomiendo considerar:

**Metodologías:**
• Scrum para desarrollo ágil
• Kanban para flujo continuo
• Waterfall para proyectos con requisitos fijos

**Herramientas esenciales:**
• Planificación: Gantt charts, roadmaps
• Seguimiento: Dashboards, métricas de progreso
• Colaboración: Daily standups, retrospectivas

¿Te gustaría que profundice en algún aspecto específico de la gestión de proyectos?`;
    }

    // Development topics
    if (message.includes('desarrollo') || message.includes('código') || message.includes('programar')) {
      return `En desarrollo de software, las mejores prácticas incluyen:

**Arquitectura:**
• Clean Code y principios SOLID
• Arquitectura por capas o microservicios
• Patrones de diseño apropiados

**Proceso de desarrollo:**
• Control de versiones con Git
• Testing automatizado (unit, integration, e2e)
• CI/CD para despliegue continuo
• Code reviews y pair programming

¿Hay alguna tecnología específica o problema de desarrollo que te interese?`;
    }

    // Team collaboration
    if (message.includes('equipo') || message.includes('colaborar') || message.includes('comunicación')) {
      return `Para una colaboración efectiva en equipos:

**Comunicación:**
• Reuniones regulares pero eficientes
• Canales de comunicación claros (Slack, Teams)
• Documentación accesible y actualizada

**Coordinación:**
• Roles y responsabilidades definidos
• Procesos de escalación claros
• Herramientas de gestión compartidas

**Cultura de equipo:**
• Feedback constructivo regular
• Celebración de logros
• Aprendizaje continuo

¿Qué aspecto de la colaboración te gustaría mejorar en tu equipo?`;
    }    // Basic tech questions
    if (message.includes('que es') || message.includes('qué es')) {
      if (message.includes('api')) {
        return `**API (Application Programming Interface)** es un conjunto de reglas y protocolos que permite que diferentes aplicaciones se comuniquen entre sí:

**Tipos comunes:**
• **REST API**: Usa HTTP con métodos GET, POST, PUT, DELETE
• **GraphQL**: Permite consultas flexibles de datos
• **WebSocket**: Para comunicación en tiempo real

**Ejemplo de uso:**
Una app móvil usa la API de Instagram para mostrar fotos, o una página web usa la API del clima para mostrar el pronóstico.

**Beneficios:**
• Reutilización de funcionalidades
• Separación de responsabilidades  
• Integración entre sistemas diferentes
• Escalabilidad

¿Te interesa saber sobre algún tipo específico de API?`;
      }
      
      if (message.includes('npm')) {
        return `**NPM (Node Package Manager)** es el gestor de paquetes predeterminado para Node.js:

**Funciones principales:**
• **Instalar paquetes**: \`npm install express\`
• **Gestionar dependencias**: package.json y package-lock.json
• **Publicar paquetes**: Compartir código con la comunidad
• **Scripts**: Automatizar tareas de desarrollo

**Comandos esenciales:**
• \`npm init\` - Crear nuevo proyecto
• \`npm install\` - Instalar dependencias
• \`npm run dev\` - Ejecutar script de desarrollo
• \`npm publish\` - Publicar paquete

**package.json básico:**
\`\`\`json
{
  "name": "mi-proyecto",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0"
  }
}
\`\`\`

¿Necesitas ayuda con algún comando específico de NPM?`;
      }
    }
    if (message.includes('github') || message.includes('git hub') || (message.includes('git') && message.includes('funciona'))) {
      return `**GitHub** es una plataforma de desarrollo colaborativo que utiliza Git para control de versiones:

**Características principales:**
• **Repositorios**: Almacenan tu código y historial de cambios
• **Branches**: Permiten trabajar en diferentes características sin afectar el código principal
• **Pull Requests**: Facilitan la revisión de código antes de fusionar cambios
• **Issues**: Sistema de seguimiento de bugs y características
• **Actions**: Automatización de CI/CD y workflows

**Flujo de trabajo típico:**
1. Clonar repositorio (\`git clone\`)
2. Crear nueva rama (\`git checkout -b feature-branch\`)
3. Hacer cambios y commits (\`git commit -m "mensaje"\`)
4. Subir cambios (\`git push\`)
5. Crear Pull Request para revisión
6. Fusionar a rama principal tras aprobación

**Ventajas para equipos:**
• Colaboración simultánea sin conflictos
• Historial completo de cambios
• Backup automático en la nube
• Integración con herramientas de desarrollo

¿Te gustaría saber algo específico sobre Git o GitHub?`;
    }

    if (message.includes('react') || message.includes('reactjs')) {
      return `**React** es una biblioteca de JavaScript para construir interfaces de usuario:

**Conceptos clave:**
• **Componentes**: Bloques reutilizables de UI
• **JSX**: Sintaxis que combina JavaScript y HTML
• **Props**: Datos que se pasan entre componentes
• **State**: Estado interno de los componentes
• **Hooks**: Funciones para manejar estado y efectos

**Ventajas:**
• Virtual DOM para rendimiento optimizado
• Reutilización de componentes
• Ecosistema amplio de librerías
• Respaldado por Meta (Facebook)

**Estructura básica:**
\`\`\`jsx
function MiComponente({ nombre }) {
  const [contador, setContador] = useState(0);
  
  return (
    <div>
      <h1>Hola {nombre}</h1>
      <button onClick={() => setContador(contador + 1)}>
        Clicks: {contador}
      </button>
    </div>
  );
}
\`\`\`

¿Quieres saber sobre algún aspecto específico de React?`;
    }

    if (message.includes('javascript') || message.includes('js')) {
      return `**JavaScript** es el lenguaje de programación más popular para desarrollo web:

**Usos principales:**
• **Frontend**: Interactividad en páginas web
• **Backend**: Servidores con Node.js
• **Mobile**: Apps con React Native
• **Desktop**: Aplicaciones con Electron

**Conceptos fundamentales:**
• Variables: \`let\`, \`const\`, \`var\`
• Funciones: Tradicionales y arrow functions
• Objetos y arrays
• Async/await para operaciones asíncronas
• DOM manipulation

**Frameworks populares:**
• **React**: UI components
• **Vue**: Framework progresivo
• **Angular**: Framework completo
• **Node.js**: Backend JavaScript

**Ejemplo básico:**
\`\`\`javascript
const usuarios = ['Ana', 'Carlos', 'Luis'];
usuarios.forEach(usuario => {
  console.log(\`Hola \${usuario}\`);
});
\`\`\`

¿Hay algún concepto específico de JavaScript que te interese?`;
    }

    if (message.includes('typescript') || message.includes('ts')) {
      return `**TypeScript** es JavaScript con tipos estáticos desarrollado por Microsoft:

**Beneficios principales:**
• **Type Safety**: Detecta errores en tiempo de compilación
• **IntelliSense**: Mejor autocompletado en editores
• **Refactoring**: Más seguro y eficiente
• **Documentación**: Los tipos sirven como documentación

**Características:**
• Superset de JavaScript (todo JS es TS válido)
• Compilación a JavaScript puro
• Interfaces y tipos personalizados
• Generics para código reutilizable

**Ejemplo:**
\`\`\`typescript
interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

function saludarUsuario(usuario: Usuario): string {
  return \`Hola \${usuario.nombre}\`;
}

const user: Usuario = {
  id: 1,
  nombre: "Ana",
  email: "ana@email.com"
};
\`\`\`

¿Te gustaría saber más sobre tipos específicos o configuración de TypeScript?`;
    }

    if (message.includes('python')) {
      return `**Python** es un lenguaje de programación versátil y fácil de aprender:

**Características:**
• Sintaxis clara y legible
• Tipado dinámico
• Multiparadigma (OOP, funcional, procedural)
• Gran biblioteca estándar

**Usos principales:**
• **Data Science**: pandas, numpy, matplotlib
• **Web Development**: Django, Flask, FastAPI
• **AI/ML**: TensorFlow, PyTorch, scikit-learn
• **Automation**: Scripts y automatización
• **Backend APIs**: REST y GraphQL

**Ejemplo básico:**
\`\`\`python
# Lista de números
numeros = [1, 2, 3, 4, 5]

# List comprehension
cuadrados = [x**2 for x in numeros]

# Función
def saludar(nombre):
    return f"Hola {nombre}!"

print(saludar("María"))
\`\`\`

¿Hay algún área específica de Python que te interese explorar?`;
    }    // Generic helpful response
    const fallbackResponse = `Entiendo tu pregunta: "${userMessage}"

Como asistente de Xurp, puedo ayudarte con diferentes tipos de consultas:

**Si necesitas información general:**
• Pregúntame sobre países, capitales, conceptos básicos
• Cálculos matemáticos simples
• Definiciones y explicaciones

**Para proyectos y desarrollo:**
• Metodologías de gestión (Scrum, Kanban)
• Buenas prácticas de programación
• Herramientas de colaboración

**Si tienes una pregunta específica, intenta ser más directo.** Por ejemplo:
• "¿Cuál es la capital de [país]?"
• "¿Cómo funciona [concepto]?"
• "¿Qué es mejor para [situación específica]?"

¿Puedes reformular tu pregunta de manera más específica?`;

    console.log('✅ Returning generic fallback response, length:', fallbackResponse.length);
    return fallbackResponse;  }

  // Método para probar APIs alternativas de IA cuando Hugging Face falla
  private async tryAlternativeAIAPIs(message: string, conversationHistory: any[]): Promise<string> {
    console.log('🔄 Trying alternative AI APIs for message:', message);

    // Intentar con OpenRouter/OpenAI primero
    try {
      console.log('🤖 Trying OpenRouter API...');
      const openRouterResponse = await this.tryOpenAI(message);
      if (openRouterResponse && openRouterResponse.length > 15) {
        console.log('✅ OpenRouter API succeeded');
        return openRouterResponse;
      }
    } catch (error) {
      console.warn('❌ OpenRouter API failed:', error.message);
    }

    // Intentar con Cohere
    try {
      console.log('🤖 Trying Cohere API...');
      const cohereResponse = await this.tryCohere(message);
      if (cohereResponse && cohereResponse.length > 15) {
        console.log('✅ Cohere API succeeded');
        return cohereResponse;
      }
    } catch (error) {
      console.warn('❌ Cohere API failed:', error.message);
    }

    // Si todas las APIs fallan, usar el fallback inteligente del controlador
    console.warn('⚠️ All alternative AI APIs failed, using intelligent fallback');
    return this.generateFallbackResponse(message, conversationHistory);
  }

  // Método mejorado para OpenRouter/OpenAI
  private async tryOpenAI(message: string): Promise<string> {
    const axios = require('axios');
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'anthropic/claude-3-haiku:beta', // Modelo más económico y rápido
          messages: [
            {
              role: 'system',
              content: 'Eres Xurp IA, un asistente inteligente especializado en gestión de proyectos, desarrollo de software y colaboración en equipos. Responde de manera útil, profesional y concisa en español.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Xurp IA Assistant'
          },
          timeout: 15000
        }
      );

      if (response.data.choices && response.data.choices[0]?.message?.content) {
        return response.data.choices[0].message.content.trim();
      } else {
        throw new Error('Invalid OpenRouter API response format');
      }
    } catch (error) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Método para Cohere
  private async tryCohere(message: string): Promise<string> {
    const axios = require('axios');
    const apiKey = process.env.COHERE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Cohere API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.cohere.ai/v1/generate',
        {
          model: 'command-light', // Modelo más económico
          prompt: `Como Xurp IA, un asistente especializado en gestión de proyectos y desarrollo de software, responde a: ${message}`,
          max_tokens: 300,
          temperature: 0.7,
          stop_sequences: ['\n\nHuman:', '\n\nUser:']
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data.generations && response.data.generations[0]?.text) {
        return response.data.generations[0].text.trim();
      } else {
        throw new Error('Invalid Cohere API response format');
      }
    } catch (error) {
      console.error('Cohere API error:', error.response?.data || error.message);
      throw error;
    }
  }
}
