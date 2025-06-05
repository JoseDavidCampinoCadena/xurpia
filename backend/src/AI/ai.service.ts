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
}
