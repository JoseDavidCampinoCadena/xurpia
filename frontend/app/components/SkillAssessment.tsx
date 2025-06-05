'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEvaluations } from '../hooks/useEvaluations';
import { Question, EvaluationResult } from '../api/evaluations.api';

const TECHNOLOGIES = {
  'Frontend': ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'CSS', 'HTML'],
  'Backend': ['Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go'],
  'Mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin'],
  'Data Science': ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'],
  'DevOps': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
  'QA': ['Selenium', 'Jest', 'Cypress', 'Manual Testing', 'Automation'],
  'Diseño': ['Figma', 'Adobe XD', 'Photoshop', 'UI/UX', 'Prototyping'],
};

interface SkillAssessmentProps {
  onComplete?: () => void;
}

export default function SkillAssessment({ onComplete }: SkillAssessmentProps) {
  const { user } = useAuth();
  const { generateQuestions, submitEvaluation, loading, error } = useEvaluations();
  
  const [step, setStep] = useState<'confirm' | 'technology' | 'questions' | 'result'>('confirm');
  const [profession, setProfession] = useState<string>('');
  const [technology, setTechnology] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutos en segundos
  const handleSubmitEvaluation = useCallback(async () => {
    try {
      const evaluationResult = await submitEvaluation(profession, technology, questions, userAnswers);
      setResult(evaluationResult);
      setStep('result');
    } catch (err) {
      console.error('Error submitting evaluation:', err);
    }
  }, [submitEvaluation, profession, technology, questions, userAnswers]);

  useEffect(() => {
    if (user?.profession) {
      setProfession(user.profession);
    }
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'questions' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitEvaluation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft, handleSubmitEvaluation]);

  const handleProfessionConfirm = (confirmed: boolean) => {
    if (confirmed) {
      setStep('technology');
    } else {
      // Si no confirma la profesión, permitir seleccionar otra
      setProfession('');
      setStep('technology');
    }
  };  const handleTechnologySelect = async (selectedTechnology: string) => {
    setTechnology(selectedTechnology);
    try {
      const generatedQuestions = await generateQuestions(profession, selectedTechnology);
      setQuestions(generatedQuestions);
      setUserAnswers(new Array(generatedQuestions.length).fill(-1));
      setStep('questions');
      setTimeLeft(120); // Reset timer
    } catch (err) {
      console.error('Error generating questions:', err);
      // Error state is already handled by useEvaluations hook
      // Stay on technology selection step to allow retry
      // The error will be displayed at the bottom of the component
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitEvaluation();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ADVANCED':
        return 'text-green-600 bg-green-100';
      case 'INTERMEDIATE':
        return 'text-yellow-600 bg-yellow-100';
      case 'BEGINNER':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'ADVANCED':
        return 'Avanzado';
      case 'INTERMEDIATE':
        return 'Intermedio';
      case 'BEGINNER':
        return 'Principiante';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Generando evaluación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
        {step === 'confirm' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Evaluación de Habilidades
            </h2>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
              Vamos a evaluar tus conocimientos para asignarte tareas adecuadas a tu nivel.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
              <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
                Tu profesión registrada es: <strong>{user?.profession || 'No especificada'}</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                ¿Es esta tu profesión actual?
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleProfessionConfirm(true)}
                className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors"
              >
                Sí, continuar
              </button>
              <button
                onClick={() => handleProfessionConfirm(false)}
                className="bg-gray-500 text-white px-8 py-3 rounded-md hover:bg-gray-600 transition-colors"
              >
                No, seleccionar otra
              </button>
            </div>
          </div>
        )}

        {step === 'technology' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Selecciona tu especialización
            </h2>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
              Elige la tecnología o área en la que quieres ser evaluado:
            </p>
            
            {!profession && (
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Primero selecciona tu profesión:
                </label>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full max-w-md p-3 border rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-gray-300 dark:border-zinc-600"
                >
                  <option value="">Selecciona una profesión</option>
                  {Object.keys(TECHNOLOGIES).map(prof => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                </select>
              </div>
            )}            {profession && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {TECHNOLOGIES[profession as keyof typeof TECHNOLOGIES]?.map(tech => (
                  <button
                    key={tech}
                    onClick={() => handleTechnologySelect(tech)}
                    disabled={loading}
                    className="p-4 border-2 border-gray-200 dark:border-zinc-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && technology === tech && (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    )}
                    {tech}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'questions' && questions.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pregunta {currentQuestionIndex + 1} de {questions.length}
              </h2>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  timeLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  Tiempo: {formatTime(timeLeft)}
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {questions[currentQuestionIndex]?.question}
              </h3>
              <div className="space-y-3">
                {questions[currentQuestionIndex]?.options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      userAnswers[currentQuestionIndex] === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-zinc-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={index}
                      checked={userAnswers[currentQuestionIndex] === index}
                      onChange={() => handleAnswerSelect(index)}
                      className="sr-only"
                    />
                    <span className="text-gray-900 dark:text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 border border-gray-300 dark:border-zinc-600 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
              >
                Anterior
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={userAnswers[currentQuestionIndex] === -1}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              ¡Evaluación Completada!
            </h2>
            <div className="bg-gray-50 dark:bg-zinc-900 p-8 rounded-lg mb-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Tu resultado en {technology}:
                </h3>
                <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${getLevelColor(result.level)}`}>
                  {getLevelText(result.level)}
                </div>
              </div>
              <div className="mb-6">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                  Puntuación: <strong>{result.score}/100</strong>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${result.score}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {result.feedback}
              </p>
            </div>
            <button
              onClick={onComplete}
              className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors"
            >
              Continuar a Tareas
            </button>
          </div>
        )}        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error al generar la evaluación
                </h3>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                {step === 'technology' && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleTechnologySelect(technology)}
                      className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded-md transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
