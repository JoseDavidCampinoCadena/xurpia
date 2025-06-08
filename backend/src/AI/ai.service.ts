import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private HF_API_URL = 'https://api-inference.huggingface.co/models/gpt2'; // Cambia por tu modelo preferido
  private HF_API_KEY = process.env.HF_TOKEN || process.env.HF_API_KEY;

  async generateQuestions(tech: string) {
    // Ejemplo de prompt para generación de preguntas
    const prompt = `Genera 10 preguntas técnicas variadas y de dificultad creciente para evaluar conocimientos en ${tech}. Devuelve solo una lista JSON de strings.`;
    const response = await axios.post(
      this.HF_API_URL,
      { inputs: prompt },
      { headers: { Authorization: `Bearer ${this.HF_API_KEY}` } }
    );
    // Procesa la respuesta según el modelo
    let questions: string[] = [];
    try {
      questions = JSON.parse(response.data[0]?.generated_text.match(/\[.*\]/s)?.[0] || '[]');
    } catch {
      questions = [`¿Qué es ${tech}?`, `¿Para qué sirve ${tech}?`, `¿Cómo declarar una variable en ${tech}?`];
    }
    return { questions };
  }
  async evaluateLevel(answers: string[], tech: string) {
    // Prompt para evaluación de nivel
    const prompt = `Evalúa el nivel de un profesional en ${tech} según estas respuestas: ${JSON.stringify(answers)}. Devuelve solo una palabra: Principiante, Intermedio o Avanzado.`;
    const response = await axios.post(
      this.HF_API_URL,
      { inputs: prompt },
      { headers: { Authorization: `Bearer ${this.HF_API_KEY}` } }
    );
    let level = 'Principiante';
    if (typeof response.data[0]?.generated_text === 'string') {
      if (response.data[0].generated_text.includes('Avanzado')) level = 'Avanzado';
      else if (response.data[0].generated_text.includes('Intermedio')) level = 'Intermedio';
    }
    return { level };
  }
  async generateText(prompt: string): Promise<string> {
    try {
      if (!this.HF_API_KEY) {
        console.warn('HF_API_KEY not found, using fallback');
        throw new Error('API key not configured');
      }

      const response = await axios.post(
        this.HF_API_URL,
        { inputs: prompt },
        { 
          headers: { Authorization: `Bearer ${this.HF_API_KEY}` },
          timeout: 30000, // 30 seconds timeout
          validateStatus: (status) => status < 500 // Accept 4xx as valid responses
        }
      );

      if (response.data && Array.isArray(response.data) && response.data[0]?.generated_text) {
        return response.data[0].generated_text;
      } else {
        console.warn('Unexpected API response format:', response.data);
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error generating text:', error);
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout to Hugging Face API');
      } else if (error.response?.status === 503) {
        console.error('Hugging Face model is loading, this may take a few minutes');
      } else if (error.response?.status === 401) {
        console.error('Invalid Hugging Face API key');
      }
      throw error; // Re-throw to let calling service handle fallback
    }
  }

  async analyzeProject(projectName: string, projectContext: string, estimatedDuration: string) {
    const prompt = `Analiza este proyecto de software y proporciona recomendaciones estructuradas:

Proyecto: ${projectName}
Descripción: ${projectContext}
Duración estimada: ${estimatedDuration}

Por favor responde SOLO con un JSON válido con esta estructura exacta:
{
  "recommendedTeamSize": número,
  "roles": [
    {
      "title": "string",
      "count": número,
      "description": "string",
      "skillLevel": "Principiante|Intermedio|Avanzado"
    }
  ],
  "estimatedTimeline": "string",
  "keyTechnologies": ["string"],
  "suggestions": ["string"]
}`;

    try {
      if (!this.HF_API_KEY) {
        console.warn('HF_API_KEY not found, using fallback response');
        return this.getFallbackProjectAnalysis(projectName, projectContext, estimatedDuration);
      }

      const response = await axios.post(
        this.HF_API_URL,
        { inputs: prompt },
        {
          headers: { Authorization: `Bearer ${this.HF_API_KEY}` },
          timeout: 10000
        }
      );

      if (response.data && response.data[0]?.generated_text) {
        try {
          // Try to extract JSON from the response
          const jsonMatch = response.data[0].generated_text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysisData = JSON.parse(jsonMatch[0]);
            return analysisData;
          }
        } catch (parseError) {
          console.warn('Failed to parse AI response, using fallback');
        }
      }

      return this.getFallbackProjectAnalysis(projectName, projectContext, estimatedDuration);

    } catch (error) {
      console.error('Error calling AI service:', error);
      return this.getFallbackProjectAnalysis(projectName, projectContext, estimatedDuration);
    }
  }

  private getFallbackProjectAnalysis(projectName: string, projectContext: string, estimatedDuration: string) {
    // Determine team size based on duration and complexity
    const teamSize = this.calculateTeamSize(projectContext, estimatedDuration);
    const technologies = this.extractTechnologies(projectContext);
    
    return {
      recommendedTeamSize: teamSize,
      roles: this.generateRoles(teamSize, projectContext),
      estimatedTimeline: `Para un proyecto de ${estimatedDuration}, se recomienda dividir en ${Math.ceil(teamSize/2)} sprints de 2-3 semanas cada uno`,
      keyTechnologies: technologies,
      suggestions: this.generateSuggestions(projectContext, estimatedDuration)
    };
  }

  private calculateTeamSize(context: string, duration: string): number {
    let baseSize = 3;
    
    // Adjust based on duration
    if (duration.includes('año') || duration.includes('12')) baseSize += 2;
    else if (duration.includes('6')) baseSize += 1;
    
    // Adjust based on complexity indicators
    const complexityKeywords = ['microservicios', 'ai', 'machine learning', 'blockchain', 'real time', 'tiempo real'];
    const foundKeywords = complexityKeywords.filter(keyword => 
      context.toLowerCase().includes(keyword)
    );
    
    baseSize += Math.min(foundKeywords.length, 3);
    
    return Math.max(3, Math.min(baseSize, 8));
  }

  private extractTechnologies(context: string): string[] {
    const techKeywords = {
      'java': 'Java',
      'javascript': 'JavaScript',
      'python': 'Python',
      'react': 'React',
      'angular': 'Angular',
      'vue': 'Vue.js',
      'node': 'Node.js',
      'spring': 'Spring Boot',
      'mysql': 'MySQL',
      'postgresql': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'aws': 'AWS',
      'azure': 'Azure'
    };

    const foundTechs: string[] = [];
    const lowerContext = context.toLowerCase();
    
    Object.entries(techKeywords).forEach(([key, value]) => {
      if (lowerContext.includes(key)) {
        foundTechs.push(value);
      }
    });

    return foundTechs.length > 0 ? foundTechs : ['JavaScript', 'Node.js', 'React', 'MongoDB'];
  }

  private generateRoles(teamSize: number, context: string): any[] {
    const baseRoles = [
      {
        title: "Arquitecto de Software",
        count: 1,
        description: "Diseño de la arquitectura y patrones del sistema",
        skillLevel: "Avanzado"
      },
      {
        title: "Desarrollador Backend",
        count: Math.ceil(teamSize * 0.4),
        description: "Desarrollo de APIs y lógica del negocio",
        skillLevel: "Intermedio"
      },
      {
        title: "Desarrollador Frontend",
        count: Math.ceil(teamSize * 0.3),
        description: "Interfaz de usuario y experiencia",
        skillLevel: "Intermedio"
      }
    ];

    if (teamSize >= 5) {
      baseRoles.push({
        title: "Diseñador UI/UX",
        count: 1,
        description: "Diseño de interfaces y experiencia de usuario",
        skillLevel: "Intermedio"
      });
    }

    if (teamSize >= 6) {
      baseRoles.push({
        title: "DevOps Engineer",
        count: 1,
        description: "Infraestructura y despliegue continuo",
        skillLevel: "Avanzado"
      });
    }

    return baseRoles;
  }

  private generateSuggestions(context: string, duration: string): string[] {
    const suggestions = [
      "Implementar metodología Agile con sprints de 2-3 semanas",
      "Establecer CI/CD desde el inicio del proyecto",
      "Realizar code reviews obligatorios para mantener calidad",
      "Implementar testing automatizado (unitario e integración)"
    ];

    if (context.toLowerCase().includes('microservicios')) {
      suggestions.push("Usar Docker y Kubernetes para orquestación de microservicios");
    }

    if (context.toLowerCase().includes('tiempo real') || context.toLowerCase().includes('real time')) {
      suggestions.push("Considerar WebSockets o Server-Sent Events para funcionalidad en tiempo real");
    }

    if (duration.includes('año') || duration.includes('12')) {
      suggestions.push("Planificar arquitectura escalable desde el inicio");
      suggestions.push("Considerar implementación por fases/módulos");
    }

    return suggestions;
  }
}
