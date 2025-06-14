'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { skillAssessmentsApi, SkillQuestion, AssessmentResult } from '@/app/api/skill-assessments.api';
import { useAuth } from '@/app/hooks/useAuth';
import { useProjects } from '@/app/hooks/useProjects';
import { getUserPermissions } from '@/app/utils/permissions';
import { 
  FaBrain, 
  FaSpinner, 
  FaCheck, 
  FaLightbulb,
  FaGraduationCap,
  FaArrowRight,
  FaClock
} from 'react-icons/fa';

export default function SkillAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  
  const projectId = parseInt(params.id as string);
  const project = projects.find((p) => p.id === projectId);
  
  const [questions, setQuestions] = useState<SkillQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [hasStarted, setHasStarted] = useState(false);

  // Redirect owners to dashboard (safety check)
  useEffect(() => {
    if (!userLoading && !projectsLoading && user && project) {
      const isOwner = getUserPermissions(user, project).isOwner;
      if (isOwner) {
        router.push(`/admin/projects/${projectId}`);
        return;
      }
    }
  }, [user, project, userLoading, projectsLoading, router, projectId]);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const assessmentQuestions = await skillAssessmentsApi.getQuestions(projectId);
      setQuestions(assessmentQuestions);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const assessmentResult = await skillAssessmentsApi.submitAssessment(projectId, answers);
      setResult(assessmentResult);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      alert('Error al enviar la evaluación. Por favor, inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }, [projectId, answers]);

  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, hasStarted, submitted, handleSubmit]);

  const handleStartAssessment = () => {
    setHasStarted(true);
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Principiante': return 'text-green-400';
      case 'Intermedio': return 'text-yellow-400';
      case 'Avanzado': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSkillLevelBg = (level: string) => {
    switch (level) {
      case 'Principiante': return 'bg-green-500/20 border-green-500/50';
      case 'Intermedio': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'Avanzado': return 'bg-red-500/20 border-red-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);
  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-400 w-8 h-8 mx-auto mb-4" />
          <span className="text-white">Cargando evaluación...</span>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="bg-gray-800/50 rounded-2xl p-12 text-center max-w-md mx-auto">
          <FaBrain className="text-gray-400 w-16 h-16 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Evaluación no disponible</h2>
          <p className="text-gray-300 mb-6">
            La evaluación de habilidades no está configurada para este proyecto.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="bg-gray-800/50 rounded-2xl p-12 text-center max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FaCheck className="text-white w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">¡Evaluación Completada!</h2>
          
          <div className={`rounded-2xl p-6 mb-6 border ${getSkillLevelBg(result.skillLevel)}`}>
            <h3 className="text-xl font-bold text-white mb-2">Tu nivel de habilidad:</h3>
            <div className={`text-4xl font-bold ${getSkillLevelColor(result.skillLevel)} mb-4`}>
              {result.skillLevel}
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{result.score}%</div>
                <div className="text-gray-300 text-sm">Puntuación</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{result.correctAnswers}/{result.totalQuestions}</div>
                <div className="text-gray-300 text-sm">Respuestas Correctas</div>
              </div>
            </div>
          </div>

          {result.recommendations.length > 0 && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6 mb-6 text-left">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FaLightbulb className="text-yellow-400" />
                Recomendaciones
              </h4>
              <ul className="text-gray-300 text-sm space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index}>• {recommendation}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push(`/admin/projects/${projectId}`)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2"
            >
              Ir al Proyecto
              <FaArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="bg-gray-800/50 rounded-2xl p-12 text-center max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FaGraduationCap className="text-white w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Evaluación de Habilidades</h2>
          <p className="text-gray-300 mb-6">
            Esta evaluación nos ayudará a asignarte tareas acordes a tu nivel de experiencia
          </p>
          
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-lg font-semibold text-white mb-3">Información importante:</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• {questions.length} preguntas en total</li>
              <li>• Tiempo límite: 30 minutos</li>
              <li>• Puedes navegar entre preguntas antes de enviar</li>
              <li>• Tu nivel se determinará automáticamente al finalizar</li>
              <li>• Las tareas se asignarán basándose en tu resultado</li>
            </ul>
          </div>

          <button
            onClick={handleStartAssessment}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 mx-auto"
          >
            <FaArrowRight className="w-5 h-5" />
            Comenzar Evaluación
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
                <FaBrain className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Evaluación de Habilidades</h1>
                <p className="text-gray-300">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'} flex items-center gap-2`}>
                <FaClock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
              <p className="text-gray-300 text-sm">Tiempo restante</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-800/50 rounded-2xl p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentQuestion.difficulty === 'BEGINNER' ? 'bg-green-500 text-white' :
                currentQuestion.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500 text-black' :
                'bg-red-500 text-white'
              }`}>
                {currentQuestion.difficulty === 'BEGINNER' ? 'Principiante' :
                 currentQuestion.difficulty === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
              </span>
              <span className="text-gray-400 text-sm">{currentQuestion.category}</span>
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-6">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-300 border ${
                  answers[currentQuestion.id] === index
                    ? 'bg-blue-600/30 border-blue-500 text-white'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    answers[currentQuestion.id] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-500'
                  }`}>
                    {answers[currentQuestion.id] === index && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <div className="flex items-center gap-4">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaCheck className="w-4 h-4" />
                    Finalizar Evaluación
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={answers[currentQuestion.id] === undefined}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Siguiente
                <FaArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Answer Summary */}
        <div className="mt-8 bg-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Progreso de respuestas:</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[questions[index].id] !== undefined
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
