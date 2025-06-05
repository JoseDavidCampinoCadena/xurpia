'use client';

import { useState } from 'react';
import { evaluationsApi, Question, EvaluationResult, UserEvaluation } from '../api/evaluations.api';

export const useEvaluations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = async (profession: string, technology: string): Promise<Question[]> => {
    try {
      setLoading(true);
      setError(null);
      const questions = await evaluationsApi.generateQuestions(profession, technology);
      return questions;
    } catch (err: unknown) {
      // Handle specific error types
      let errorMessage = 'Error al generar las preguntas';
        if (err && typeof err === 'object' && 'code' in err) {
        const axiosError = err as { code?: string };
        if (axiosError.code === 'ERR_NETWORK') {
          errorMessage = 'Error de conexión. Verificando conectividad...';
        } else if (axiosError.code === 'ECONNABORTED') {
          errorMessage = 'Tiempo de espera agotado. Usando preguntas predeterminadas...';
        }
      }
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          errorMessage = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
        } else if (axiosError.response?.status && axiosError.response.status >= 500) {
          errorMessage = 'Error del servidor. Intentando con preguntas predeterminadas...';
        }
      }
      
      setError(errorMessage);
      console.error('Error generating questions:', err);
      
      // Don't re-throw the error, let the component handle it gracefully
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitEvaluation = async (
    profession: string,
    technology: string,
    questions: Question[],
    userAnswers: number[]
  ): Promise<EvaluationResult> => {
    try {
      setLoading(true);
      setError(null);
      const result = await evaluationsApi.submitEvaluation(profession, technology, questions, userAnswers);
      return result;
    } catch (err: unknown) {
      setError('Error al enviar la evaluación');
      console.error('Error submitting evaluation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserEvaluations = async (): Promise<UserEvaluation[]> => {
    try {
      setLoading(true);
      setError(null);
      const evaluations = await evaluationsApi.getUserEvaluations();
      return evaluations;
    } catch (err: unknown) {
      setError('Error al cargar las evaluaciones');
      console.error('Error fetching evaluations:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateQuestions,
    submitEvaluation,
    getUserEvaluations,
  };
};
