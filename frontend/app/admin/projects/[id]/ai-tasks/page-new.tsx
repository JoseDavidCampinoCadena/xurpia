'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { aiTasksApi, AITask } from '@/app/api/ai-tasks.api';
import { skillAssessmentsApi, SkillAssessment, SkillQuestion } from '@/app/api/skill-assessments.api';
import { 
  FaBrain, 
  FaRobot, 
  FaTasks, 
  FaPlay, 
  FaCheck, 
  FaClock, 
  FaUser, 
  FaChartLine,
  FaLightbulb,
  FaSpinner,
  FaExclamationTriangle,
  FaUserGraduate,
  FaUsers,
  FaCog,
  FaTrash
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

interface AITaskProgress {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  progressPercentage: number;
  skillDistribution: {
    Principiante: number;
    Intermedio: number;
    Avanzado: number;
  };
  dailyProgress: Array<{
    day: number;
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }>;
}

export default function AITasksPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const [aiTasks, setAiTasks] = useState<AITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string | null>(null);
  
  // New state for skill assessments
  const [activeTab, setActiveTab] = useState<'tasks' | 'assessments'>('tasks');
  const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<SkillQuestion[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  const loadAITasks = useCallback(async () => {
    try {
      setLoading(true);
      const tasks = await aiTasksApi.getByProject(projectId);
      setAiTasks(tasks);
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas de IA');
      console.error('Error loading AI tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadAssessments = useCallback(async () => {
    try {
      setLoadingAssessments(true);
      const projectAssessments = await skillAssessmentsApi.getProjectAssessments(projectId);
      setAssessments(projectAssessments);
    } catch (err) {
      console.error('Error loading assessments:', err);
    } finally {
      setLoadingAssessments(false);
    }
  }, [projectId]);

  const loadAssessmentQuestions = useCallback(async () => {
    try {
      const questions = await skillAssessmentsApi.getQuestions(projectId);
      setAssessmentQuestions(questions);
    } catch (err) {
      console.error('Error loading assessment questions:', err);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadAITasks();
    }
  }, [projectId, loadAITasks]);

  useEffect(() => {
    if (projectId && activeTab === 'assessments') {
      loadAssessments();
      loadAssessmentQuestions();
    }
  }, [projectId, activeTab, loadAssessments, loadAssessmentQuestions]);
  
  const generateAITasks = async () => {
    try {
      setIsGenerating(true);
      await aiTasksApi.generateForProject(projectId);
      await loadAITasks();
    } catch (err) {
      setError('Error al generar tareas de IA');
      console.error('Error generating AI tasks:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const startTask = async (taskId: number) => {
    try {
      await aiTasksApi.start(taskId);
      await loadAITasks();
    } catch (err) {
      console.error('Error starting task:', err);
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      await aiTasksApi.complete(taskId);
      await loadAITasks();
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const assignDailyTasks = async () => {
    try {
      setIsAssigning(true);
      setError(null);
      const result = await aiTasksApi.assignDailyTasks(projectId);
      
      await loadAITasks();
      alert(`¡Asignación completada! Se asignaron ${result.assignedTasks} tareas automáticamente.`);
    } catch (err) {
      setError('Error al asignar tareas automáticamente');
      console.error('Error assigning daily tasks:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const reassignTasksBasedOnSkills = async () => {
    try {
      setIsAssigning(true);
      setError(null);
      const result = await skillAssessmentsApi.reassignTasks(projectId);
      
      await loadAITasks();
      alert(`¡Reasignación completada! ${result.message}`);
    } catch (err) {
      setError('Error al reasignar tareas basadas en habilidades');
      console.error('Error reassigning tasks:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const resetUserAssessment = async (userId: number) => {
    try {
      await skillAssessmentsApi.resetUserAssessment(projectId, userId);
      await loadAssessments();
      alert('Evaluación reiniciada exitosamente');
    } catch (err) {
      console.error('Error resetting assessment:', err);
      alert('Error al reiniciar la evaluación');
    }
  };

  const calculateAITaskProgress = (): AITaskProgress => {
    const totalTasks = aiTasks.length;
    const completedTasks = aiTasks.filter(task => task.status === 'COMPLETED').length;
    const inProgressTasks = aiTasks.filter(task => task.status === 'IN_PROGRESS').length;
    const pendingTasks = aiTasks.filter(task => task.status === 'PENDING').length;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const skillDistribution = aiTasks.reduce(
      (acc, task) => {
        acc[task.skillLevel]++;
        return acc;
      },
      { Principiante: 0, Intermedio: 0, Avanzado: 0 }
    );

    const tasksByDay = aiTasks.reduce((acc, task) => {
      if (!acc[task.dayNumber]) {
        acc[task.dayNumber] = [];
      }
      acc[task.dayNumber].push(task);
      return acc;
    }, {} as Record<number, AITask[]>);

    const dailyProgress = Object.entries(tasksByDay).map(([day, tasks]) => {
      const dayTasks = tasks.length;
      const completedDayTasks = tasks.filter(task => task.status === 'COMPLETED').length;
      return {
        day: parseInt(day),
        totalTasks: dayTasks,
        completedTasks: completedDayTasks,
        progress: dayTasks > 0 ? (completedDayTasks / dayTasks) * 100 : 0
      };
    }).sort((a, b) => a.day - b.day);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      progressPercentage,
      skillDistribution,
      dailyProgress
    };
  };

  const getFilteredTasks = () => {
    let filtered = aiTasks;
    
    if (selectedDay !== null) {
      filtered = filtered.filter(task => task.dayNumber === selectedDay);
    }
    
    if (selectedSkillLevel) {
      filtered = filtered.filter(task => task.skillLevel === selectedSkillLevel);
    }
    
    return filtered.sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) {
        return a.dayNumber - b.dayNumber;
      }
      
      const statusOrder = { 'PENDING': 0, 'IN_PROGRESS': 1, 'COMPLETED': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  };

  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel) {
      case 'Principiante': return 'bg-green-500';
      case 'Intermedio': return 'bg-yellow-500';
      case 'Avanzado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <FaClock className="text-yellow-400" />;
      case 'IN_PROGRESS': return <FaPlay className="text-blue-400" />;
      case 'COMPLETED': return <FaCheck className="text-green-400" />;
      default: return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completada';
      default: return 'Desconocido';
    }
  };

  if (loading && activeTab === 'tasks') {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-green-400 w-8 h-8" />
          <span className="text-white ml-3">Cargando tareas de IA...</span>
        </div>
      </div>
    );
  }

  const taskProgress = calculateAITaskProgress();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
              <FaBrain className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestión Inteligente</h1>
              <p className="text-gray-300">Tareas IA y Evaluaciones de Habilidad</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            {activeTab === 'tasks' && aiTasks.length === 0 && (
              <button
                onClick={generateAITasks}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FaRobot className="w-5 h-5" />
                    Generar Tareas IA
                  </>
                )}
              </button>
            )}
            
            {activeTab === 'tasks' && aiTasks.length > 0 && assessments.length > 0 && (
              <button
                onClick={reassignTasksBasedOnSkills}
                disabled={isAssigning}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
              >
                {isAssigning ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Reasignando...
                  </>
                ) : (
                  <>
                    <FaBrain className="w-5 h-5" />
                    Reasignar por Habilidades
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-gray-800/50 rounded-2xl p-2 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'tasks'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <FaTasks className="w-5 h-5" />
              Gestión de Tareas
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'assessments'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <FaUserGraduate className="w-5 h-5" />
              Evaluaciones de Habilidad
              {assessments.length > 0 && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {assessments.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <FaExclamationTriangle className="text-red-400 w-5 h-5" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'tasks' ? (
          // Tasks Tab Content
          <>
            {aiTasks.length === 0 ? (
              <div className="bg-gray-800/50 rounded-2xl p-12 text-center">
                <FaRobot className="text-gray-400 w-16 h-16 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">No hay tareas de IA generadas</h2>
                <p className="text-gray-300 mb-6">
                  Genera tareas automáticamente basadas en el análisis de IA de tu proyecto
                </p>
                <button
                  onClick={generateAITasks}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 mx-auto disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <FaSpinner className="animate-spin w-6 h-6" />
                      Generando Tareas...
                    </>
                  ) : (
                    <>
                      <HiSparkles className="w-6 h-6" />
                      Generar Tareas con IA
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Progress Overview */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FaTasks className="text-blue-400 w-8 h-8" />
                      <span className="text-2xl font-bold text-white">{taskProgress.totalTasks}</span>
                    </div>
                    <p className="text-gray-300">Total Tareas</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FaCheck className="text-green-400 w-8 h-8" />
                      <span className="text-2xl font-bold text-white">{taskProgress.completedTasks}</span>
                    </div>
                    <p className="text-gray-300">Completadas</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FaPlay className="text-blue-400 w-8 h-8" />
                      <span className="text-2xl font-bold text-white">{taskProgress.inProgressTasks}</span>
                    </div>
                    <p className="text-gray-300">En Progreso</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FaChartLine className="text-purple-400 w-8 h-8" />
                      <span className="text-2xl font-bold text-white">{Math.round(taskProgress.progressPercentage)}%</span>
                    </div>
                    <p className="text-gray-300">Progreso</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <FaLightbulb className="text-yellow-400" />
                    Filtros
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Day Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Por Día</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedDay(null)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            selectedDay === null 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Todos
                        </button>
                        {taskProgress.dailyProgress.map(day => (
                          <button
                            key={day.day}
                            onClick={() => setSelectedDay(day.day)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                              selectedDay === day.day 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            Día {day.day}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skill Level Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Por Nivel</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedSkillLevel(null)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            selectedSkillLevel === null 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Todos
                        </button>
                        {Object.entries(taskProgress.skillDistribution).map(([level, count]) => (
                          <button
                            key={level}
                            onClick={() => setSelectedSkillLevel(level)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                              selectedSkillLevel === level 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full ${getSkillLevelColor(level)}`}></div>
                            {level} ({count})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="bg-gray-800/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <FaTasks className="text-green-400" />
                      Tareas ({filteredTasks.length})
                    </h3>
                    
                    {aiTasks.some(task => !task.assignee) && (
                      <button
                        onClick={assignDailyTasks}
                        disabled={isAssigning}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 text-sm"
                      >
                        {isAssigning ? (
                          <>
                            <FaSpinner className="animate-spin w-4 h-4" />
                            Asignando...
                          </>
                        ) : (
                          <>
                            <FaUser className="w-4 h-4" />
                            Auto-Asignar
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <FaTasks className="text-gray-400 w-12 h-12 mx-auto mb-4" />
                      <p className="text-gray-300">No hay tareas que coincidan con los filtros seleccionados</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50 hover:border-green-400/30 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  Día {task.dayNumber}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${getSkillLevelColor(task.skillLevel)}`}></div>
                                <span className="text-gray-300 text-sm">{task.skillLevel}</span>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(task.status)}
                                  <span className="text-gray-300 text-sm">{getStatusText(task.status)}</span>
                                </div>
                              </div>
                              
                              <h4 className="text-lg font-semibold text-white mb-2">{task.title}</h4>
                              <p className="text-gray-300 mb-3">{task.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                  <FaClock />
                                  <span>Estimado: {task.estimatedHours}h</span>
                                </div>
                                {task.assignee && (
                                  <div className="flex items-center gap-2">
                                    <FaUser />
                                    <span>Asignado: {task.assignee.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              {task.status === 'PENDING' && (
                                <button
                                  onClick={() => startTask(task.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                                >
                                  <FaPlay className="w-4 h-4" />
                                  Iniciar
                                </button>
                              )}
                              
                              {task.status === 'IN_PROGRESS' && (
                                <button
                                  onClick={() => completeTask(task.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                                >
                                  <FaCheck className="w-4 h-4" />
                                  Completar
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress bar for the task */}
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                task.status === 'COMPLETED' ? 'bg-green-500' : 
                                task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-500'
                              }`}
                              style={{ 
                                width: task.status === 'COMPLETED' ? '100%' : 
                                       task.status === 'IN_PROGRESS' ? '50%' : '0%' 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          // Assessments Tab Content
          <div className="space-y-8">
            {loadingAssessments ? (
              <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin text-green-400 w-8 h-8" />
                <span className="text-white ml-3">Cargando evaluaciones...</span>
              </div>
            ) : (
              <>
                {/* Assessment Overview */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FaUsers className="text-blue-400 w-8 h-8" />
                      <span className="text-2xl font-bold text-white">{assessments.length}</span>
                    </div>
                    <p className="text-gray-300">Evaluaciones Completadas</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FaUserGraduate className="text-green-400 w-8 h-8" />
                      <span className="text-2xl font-bold text-white">
                        {assessments.filter(a => a.skillLevel === 'Avanzado').length}
                      </span>
                    </div>
                    <p className="text-gray-300">Nivel Avanzado</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FaChartLine className="text-purple-400 w-8 h-8" />
                      <span className="text-2xl font-bold text-white">
                        {assessments.length > 0 
                          ? Math.round(assessments.reduce((acc, a) => acc + a.score, 0) / assessments.length)
                          : 0}%
                      </span>
                    </div>
                    <p className="text-gray-300">Puntuación Promedio</p>
                  </div>
                </div>

                {/* Assessments List */}
                <div className="bg-gray-800/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <FaUserGraduate className="text-green-400" />
                      Evaluaciones de Colaboradores
                    </h3>
                  </div>

                  {assessments.length === 0 ? (
                    <div className="text-center py-12">
                      <FaUserGraduate className="text-gray-400 w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No hay evaluaciones completadas</h3>
                      <p className="text-gray-300 mb-6">
                        Los colaboradores pueden completar una evaluación de habilidades cuando se unan al proyecto
                      </p>
                      <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                        <p className="text-blue-200 text-sm">
                          💡 <strong>Consejo:</strong> Las evaluaciones ayudan a asignar tareas automáticamente basadas en el nivel de habilidad de cada colaborador
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assessments.map((assessment) => (
                        <div
                          key={assessment.id}
                          className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50 hover:border-green-400/30 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-3 rounded-xl">
                                <FaUser className="text-white w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-white">{assessment.user.name}</h4>
                                <p className="text-gray-300 text-sm">{assessment.user.email}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <div className={`w-3 h-3 rounded-full ${getSkillLevelColor(assessment.skillLevel)}`}></div>
                                  <span className="text-gray-300 text-sm font-medium">{assessment.skillLevel}</span>
                                  <span className="text-gray-400 text-sm">•</span>
                                  <span className="text-gray-300 text-sm">{assessment.score}% de aciertos</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-white">{assessment.score}%</div>
                                <div className="text-xs text-gray-400">Puntuación</div>
                              </div>
                              <button
                                onClick={() => resetUserAssessment(assessment.userId)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-sm"
                                title="Reiniciar evaluación"
                              >
                                <FaTrash className="w-3 h-3" />
                                Reiniciar
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-4 text-xs text-gray-400">
                            Completada el {new Date(assessment.completedAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Information Card */}
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <FaCog className="text-purple-400 w-6 h-6 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">¿Cómo funciona el sistema de evaluaciones?</h3>
                      <ul className="text-gray-300 text-sm space-y-2">
                        <li>• Los colaboradores completan una evaluación al unirse al proyecto</li>
                        <li>• El sistema determina automáticamente su nivel: Principiante, Intermedio o Avanzado</li>
                        <li>• Las tareas se asignan automáticamente basándose en el nivel de habilidad</li>
                        <li>• Puedes reasignar tareas cuando se completen nuevas evaluaciones</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
