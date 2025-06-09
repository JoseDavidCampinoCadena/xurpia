import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  // Use more reliable and current models
  private HF_API_KEY = process.env.HF_TOKEN || process.env.HF_API_KEY;
  
  // Use better models that are more likely to be available
  private WORKING_MODELS = [
    'mistralai/Mistral-7B-Instruct-v0.1',
    'microsoft/DialoGPT-medium',
    'HuggingFaceH4/zephyr-7b-beta',
    'google/flan-t5-base',
    'microsoft/DialoGPT-small'
  ];
  async generateQuestions(tech: string) {
    // Ejemplo de prompt para generación de preguntas
    const prompt = `Genera 10 preguntas técnicas variadas y de dificultad creciente para evaluar conocimientos en ${tech}. Devuelve solo una lista JSON de strings.`;
    
    try {
      const response = await this.generateText(prompt);
      let questions: string[] = [];
      
      try {
        questions = JSON.parse(response.match(/\[.*\]/s)?.[0] || '[]');
      } catch {
        // Fallback questions if parsing fails
        questions = [`¿Qué es ${tech}?`, `¿Para qué sirve ${tech}?`, `¿Cómo declarar una variable en ${tech}?`];
      }
      
      return { questions };
    } catch (error) {
      // Return fallback questions if AI fails
      const questions = [`¿Qué es ${tech}?`, `¿Para qué sirve ${tech}?`, `¿Cómo declarar una variable en ${tech}?`];
      return { questions };
    }
  }  async evaluateLevel(answers: string[], tech: string) {
    // Prompt para evaluación de nivel
    const prompt = `Evalúa el nivel de un profesional en ${tech} según estas respuestas: ${JSON.stringify(answers)}. Devuelve solo una palabra: Principiante, Intermedio o Avanzado.`;
    
    try {
      const response = await this.generateText(prompt);
      let level = 'Principiante';
      
      if (typeof response === 'string') {
        if (response.includes('Avanzado')) level = 'Avanzado';
        else if (response.includes('Intermedio')) level = 'Intermedio';
      }
      
      return { level };
    } catch (error) {
      console.error('Error evaluating level:', error);
      // Fallback to basic evaluation
      return { level: 'Intermedio' };
    }
  }async generateText(prompt: string): Promise<string> {
    // If no API key, use fallback immediately
    if (!this.HF_API_KEY) {
      console.warn('HF_API_KEY not found, using fallback');
      throw new Error('API key not configured');
    }

    // Try working models
    const modelsToTry = this.WORKING_MODELS.map(model => 
      `https://api-inference.huggingface.co/models/${model}`
    );

    for (const modelUrl of modelsToTry) {
      try {
        console.log(`Trying AI model: ${modelUrl}`);
        
        const response = await axios.post(
          modelUrl,
          { 
            inputs: prompt,
            parameters: {
              max_new_tokens: 256,
              temperature: 0.7,
              return_full_text: false
            }
          },
          { 
            headers: { Authorization: `Bearer ${this.HF_API_KEY}` },
            timeout: 10000, // 10 seconds timeout
            validateStatus: (status) => status < 500 // Accept 4xx as valid responses to get error details
          }
        );

        if (response.data && Array.isArray(response.data) && response.data[0]?.generated_text) {
          console.log(`✅ AI model ${modelUrl} succeeded`);
          return response.data[0].generated_text;
        } else if (response.data && response.data.generated_text) {
          console.log(`✅ AI model ${modelUrl} succeeded`);
          return response.data.generated_text;
        } else {
          console.warn(`Unexpected API response format from ${modelUrl}:`, response.data);
          continue; // Try next model
        }
      } catch (error) {
        console.error(`❌ AI model ${modelUrl} failed:`, error.response?.data || error.message);
        
        if (error.response?.status === 503) {
          console.log(`Model ${modelUrl} is loading, trying next model...`);
          continue; // Try next model
        } else if (error.response?.status === 401) {
          console.error('Invalid Hugging Face API key - skipping all models');
          break; // No point trying other models with bad API key
        } else if (error.code === 'ECONNABORTED') {
          console.error(`Request timeout for ${modelUrl}, trying next model...`);
          continue; // Try next model
        }
        
        // For other errors, continue to try next model
        continue;
      }
    }
    
    // All models failed, throw error to trigger fallback
    throw new Error('All AI models failed or are unavailable');
  }async analyzeProject(projectName: string, projectContext: string, estimatedDuration: string) {
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
  "suggestions": ["string"],
  "dailyTasksPlan": {
    "totalDays": número,
    "tasksPerDay": [
      {
        "day": número,
        "tasks": [
          {
            "title": "string",
            "description": "string",
            "skillLevel": "Principiante|Intermedio|Avanzado",
            "estimatedHours": número,
            "role": "string"
          }
        ]
      }
    ]
  }
}`;

    try {
      if (!this.HF_API_KEY) {
        console.warn('HF_API_KEY not found, using fallback response');
        return this.getFallbackProjectAnalysis(projectName, projectContext, estimatedDuration);
      }

      console.log('🤖 Attempting AI project analysis...');
      const response = await this.generateText(prompt);

      if (response) {
        try {
          // Try to extract JSON from the response
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysisData = JSON.parse(jsonMatch[0]);
            console.log('✅ AI analysis successful');
            return analysisData;
          } else {
            console.warn('No JSON found in AI response, using fallback');
          }
        } catch (parseError) {
          console.warn('Failed to parse AI response as JSON, using fallback:', parseError.message);
        }
      }

      // If we get here, AI didn't work properly
      console.log('🔄 Using fallback analysis due to AI issues');
      return this.getFallbackProjectAnalysis(projectName, projectContext, estimatedDuration);

    } catch (error) {
      console.error('Error calling AI service:', error.message);
      console.log('🔄 Using fallback analysis due to AI error');
      return this.getFallbackProjectAnalysis(projectName, projectContext, estimatedDuration);
    }
  }
  private getFallbackProjectAnalysis(projectName: string, projectContext: string, estimatedDuration: string) {
    // Determine team size based on duration and complexity
    const teamSize = this.calculateTeamSize(projectContext, estimatedDuration);
    const technologies = this.extractTechnologies(projectContext);
    const totalDays = this.parseDurationToDays(estimatedDuration);
    const dailyTasksPlan = this.generateDailyTasksPlan(totalDays, teamSize, projectContext, technologies);
    
    return {
      recommendedTeamSize: teamSize,
      roles: this.generateRoles(teamSize, projectContext),
      estimatedTimeline: `Para un proyecto de ${estimatedDuration}, se recomienda dividir en ${Math.ceil(teamSize/2)} sprints de 2-3 semanas cada uno`,
      keyTechnologies: technologies,
      suggestions: this.generateSuggestions(projectContext, estimatedDuration),
      dailyTasksPlan: dailyTasksPlan
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

  private parseDurationToDays(duration: string): number {
    const lowerDuration = duration.toLowerCase();
    
    // Parse different duration formats
    if (lowerDuration.includes('día')) {
      const match = lowerDuration.match(/(\d+)\s*día/);
      return match ? parseInt(match[1]) : 30;
    }
    
    if (lowerDuration.includes('semana')) {
      const match = lowerDuration.match(/(\d+)\s*semana/);
      return match ? parseInt(match[1]) * 7 : 30;
    }
    
    if (lowerDuration.includes('mes')) {
      const match = lowerDuration.match(/(\d+)\s*mes/);
      return match ? parseInt(match[1]) * 30 : 60;
    }
    
    if (lowerDuration.includes('año')) {
      const match = lowerDuration.match(/(\d+)\s*año/);
      return match ? parseInt(match[1]) * 365 : 180;
    }
    
    // Default to 2 months if can't parse
    return 60;
  }

  private generateDailyTasksPlan(totalDays: number, teamSize: number, projectContext: string, technologies: string[]) {
    const tasksPerDay = [];
    const phases = this.getProjectPhases(totalDays);
    
    for (let day = 1; day <= totalDays; day++) {
      const currentPhase = this.getCurrentPhase(day, totalDays, phases);
      const dailyTasks = this.generateTasksForDay(day, currentPhase, teamSize, projectContext, technologies);
      
      tasksPerDay.push({
        day: day,
        tasks: dailyTasks
      });
    }
    
    return {
      totalDays: totalDays,
      tasksPerDay: tasksPerDay
    };
  }

  private getProjectPhases(totalDays: number) {
    const phases = [
      { name: 'Planificación y Diseño', percentage: 0.2 },
      { name: 'Configuración y Setup', percentage: 0.1 },
      { name: 'Desarrollo Backend', percentage: 0.3 },
      { name: 'Desarrollo Frontend', percentage: 0.25 },
      { name: 'Integración y Testing', percentage: 0.1 },
      { name: 'Despliegue y Documentación', percentage: 0.05 }
    ];
    
    let currentDay = 1;
    return phases.map(phase => {
      const phaseDays = Math.ceil(totalDays * phase.percentage);
      const result = {
        ...phase,
        startDay: currentDay,
        endDay: currentDay + phaseDays - 1,
        days: phaseDays
      };
      currentDay += phaseDays;
      return result;
    });
  }

  private getCurrentPhase(day: number, totalDays: number, phases: any[]) {
    return phases.find(phase => day >= phase.startDay && day <= phase.endDay) || phases[0];
  }

  private generateTasksForDay(day: number, phase: any, teamSize: number, projectContext: string, technologies: string[]) {
    const tasks = [];
    const maxTasksPerDay = Math.min(teamSize * 2, 6); // Max 6 tasks per day
    
    // Generate tasks based on the current phase
    switch (phase.name) {
      case 'Planificación y Diseño':
        tasks.push(...this.getPlanningTasks(day, phase));
        break;
      case 'Configuración y Setup':
        tasks.push(...this.getSetupTasks(day, phase, technologies));
        break;
      case 'Desarrollo Backend':
        tasks.push(...this.getBackendTasks(day, phase, technologies));
        break;
      case 'Desarrollo Frontend':
        tasks.push(...this.getFrontendTasks(day, phase, technologies));
        break;
      case 'Integración y Testing':
        tasks.push(...this.getTestingTasks(day, phase));
        break;
      case 'Despliegue y Documentación':
        tasks.push(...this.getDeploymentTasks(day, phase));
        break;
    }
    
    return tasks.slice(0, maxTasksPerDay);
  }

  private getPlanningTasks(day: number, phase: any) {
    const planningTasks = [
      { title: 'Análisis de Requerimientos', description: 'Documentar y analizar los requerimientos funcionales y no funcionales', skillLevel: 'Intermedio', estimatedHours: 6, role: 'Arquitecto de Software' },
      { title: 'Diseño de Arquitectura', description: 'Crear diagramas de arquitectura del sistema', skillLevel: 'Avanzado', estimatedHours: 8, role: 'Arquitecto de Software' },
      { title: 'Diseño de Base de Datos', description: 'Modelar entidades y relaciones de la base de datos', skillLevel: 'Intermedio', estimatedHours: 6, role: 'Desarrollador Backend' },
      { title: 'Wireframes y Mockups', description: 'Crear wireframes de las interfaces principales', skillLevel: 'Intermedio', estimatedHours: 4, role: 'Diseñador UI/UX' },
      { title: 'Definición de APIs', description: 'Especificar endpoints y contratos de las APIs', skillLevel: 'Intermedio', estimatedHours: 4, role: 'Desarrollador Backend' }
    ];
    
    return [planningTasks[Math.min(day - 1, planningTasks.length - 1)]];
  }

  private getSetupTasks(day: number, phase: any, technologies: string[]) {
    const setupTasks = [
      { title: 'Configuración del Entorno de Desarrollo', description: 'Setup del workspace y herramientas de desarrollo', skillLevel: 'Intermedio', estimatedHours: 4, role: 'DevOps Engineer' },
      { title: 'Inicialización del Proyecto Backend', description: `Configurar proyecto ${technologies.includes('Node.js') ? 'Node.js' : 'backend'}`, skillLevel: 'Intermedio', estimatedHours: 3, role: 'Desarrollador Backend' },
      { title: 'Inicialización del Proyecto Frontend', description: `Configurar proyecto ${technologies.includes('React') ? 'React' : 'frontend'}`, skillLevel: 'Intermedio', estimatedHours: 3, role: 'Desarrollador Frontend' },
      { title: 'Configuración de Base de Datos', description: 'Setup y configuración inicial de la base de datos', skillLevel: 'Intermedio', estimatedHours: 2, role: 'Desarrollador Backend' }
    ];
    
    return setupTasks.slice(0, 2);
  }

  private getBackendTasks(day: number, phase: any, technologies: string[]) {
    const backendTasks = [
      { title: 'Implementar Modelos de Datos', description: 'Crear entidades y modelos de la base de datos', skillLevel: 'Intermedio', estimatedHours: 6, role: 'Desarrollador Backend' },
      { title: 'Desarrollo de APIs REST', description: 'Implementar endpoints principales', skillLevel: 'Intermedio', estimatedHours: 8, role: 'Desarrollador Backend' },
      { title: 'Autenticación y Autorización', description: 'Implementar sistema de login y permisos', skillLevel: 'Avanzado', estimatedHours: 6, role: 'Desarrollador Backend' },
      { title: 'Validación de Datos', description: 'Implementar validaciones de entrada', skillLevel: 'Intermedio', estimatedHours: 4, role: 'Desarrollador Backend' },
      { title: 'Manejo de Errores', description: 'Implementar manejo centralizado de errores', skillLevel: 'Intermedio', estimatedHours: 3, role: 'Desarrollador Backend' }
    ];
    
    const dayInPhase = day - phase.startDay + 1;
    return [backendTasks[Math.min(dayInPhase - 1, backendTasks.length - 1)]];
  }

  private getFrontendTasks(day: number, phase: any, technologies: string[]) {
    const frontendTasks = [
      { title: 'Configurar Routing', description: 'Implementar navegación entre páginas', skillLevel: 'Intermedio', estimatedHours: 4, role: 'Desarrollador Frontend' },
      { title: 'Componentes Base', description: 'Crear componentes reutilizables básicos', skillLevel: 'Intermedio', estimatedHours: 6, role: 'Desarrollador Frontend' },
      { title: 'Interfaz de Usuario Principal', description: 'Desarrollar pantallas principales', skillLevel: 'Intermedio', estimatedHours: 8, role: 'Desarrollador Frontend' },
      { title: 'Integración con APIs', description: 'Conectar frontend con servicios backend', skillLevel: 'Intermedio', estimatedHours: 6, role: 'Desarrollador Frontend' },
      { title: 'Responsive Design', description: 'Adaptar interfaces para dispositivos móviles', skillLevel: 'Intermedio', estimatedHours: 4, role: 'Desarrollador Frontend' }
    ];
    
    const dayInPhase = day - phase.startDay + 1;
    return [frontendTasks[Math.min(dayInPhase - 1, frontendTasks.length - 1)]];
  }

  private getTestingTasks(day: number, phase: any) {
    const testingTasks = [
      { title: 'Testing Unitario Backend', description: 'Escribir pruebas unitarias para servicios', skillLevel: 'Intermedio', estimatedHours: 6, role: 'Desarrollador Backend' },
      { title: 'Testing de Integración', description: 'Pruebas de integración entre componentes', skillLevel: 'Avanzado', estimatedHours: 4, role: 'Desarrollador Backend' },
      { title: 'Testing Frontend', description: 'Pruebas unitarias de componentes React', skillLevel: 'Intermedio', estimatedHours: 4, role: 'Desarrollador Frontend' },
      { title: 'Testing E2E', description: 'Pruebas end-to-end del flujo completo', skillLevel: 'Avanzado', estimatedHours: 6, role: 'Desarrollador Frontend' }
    ];
    
    const dayInPhase = day - phase.startDay + 1;
    return [testingTasks[Math.min(dayInPhase - 1, testingTasks.length - 1)]];
  }

  private getDeploymentTasks(day: number, phase: any) {
    const deploymentTasks = [
      { title: 'Configuración de Producción', description: 'Setup del entorno de producción', skillLevel: 'Avanzado', estimatedHours: 6, role: 'DevOps Engineer' },
      { title: 'Despliegue y Monitoreo', description: 'Deploy de la aplicación y setup de monitoring', skillLevel: 'Avanzado', estimatedHours: 4, role: 'DevOps Engineer' },
      { title: 'Documentación Técnica', description: 'Crear documentación del proyecto', skillLevel: 'Intermedio', estimatedHours: 4, role: 'Arquitecto de Software' }
    ];
    
    const dayInPhase = day - phase.startDay + 1;
    return [deploymentTasks[Math.min(dayInPhase - 1, deploymentTasks.length - 1)]];
  }
}
