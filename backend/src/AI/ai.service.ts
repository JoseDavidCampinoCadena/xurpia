import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private HF_API_URL = 'https://api-inference.huggingface.co/models/gpt2'; // Cambia por tu modelo preferido
  private HF_API_KEY = process.env.HF_API_KEY;

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
}
