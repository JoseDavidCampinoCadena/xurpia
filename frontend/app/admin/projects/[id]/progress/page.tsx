'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaChartLine, FaCode, FaUser, FaCheckCircle, FaClock, FaExclamationTriangle, FaRobot, FaCalendarAlt, FaBrain, FaTasks } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';
import { projectsApi } from '@/app/api/projects.api';
import { aiTasksApi, AITask, ProjectProgress } from '@/app/api/ai-tasks.api';
import { useAuth } from '@/app/hooks/useAuth';
import { Project } from '@/app/hooks/useProjects';

interface AITaskProgress {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  percentage: number;
}

interface CollaboratorAIProgress {
  id: number;
  name: string;
  tasksCompleted: number;
  tasksAssigned: number;
  completionRate: number;
  skillDistribution: {
    Principiante: number;
    Intermedio: number;
    Avanzado: number;
  };
}

interface DailyProgress {
  day: number;
  tasksTotal: number;
  tasksCompleted: number;
  completionRate: number;
}

export default function ProgressPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [aiTasks, setAiTasks] = useState<AITask[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = async () => {
    if (!user || !projectId) return;
    
    try {
      setLoading(true);
      const [projectData, aiTasksData, progressData] = await Promise.all([
        projectsApi.getById(parseInt(projectId)),
        aiTasksApi.getByProject(parseInt(projectId)),
        aiTasksApi.getProjectProgress(parseInt(projectId))
      ]);
      
      setProject(projectData);
      setAiTasks(aiTasksData);
      setProjectProgress(progressData);
      setError(null);
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError('Error al cargar los datos del proyecto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && projectId) {
      fetchProjectData();
    }
  }, [user, projectId]);

  const calculateAITaskProgress = (): AITaskProgress => {
    const total = aiTasks.length;
    const completed = aiTasks.filter(task => task.status === 'COMPLETED').length;
    const inProgress = aiTasks.filter(task => task.status === 'IN_PROGRESS').length;
    const pending = aiTasks.filter(task => task.status === 'PENDING').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, percentage };
  };

  const calculateCollaboratorAIProgress = (): CollaboratorAIProgress[] => {
    if (!project?.collaborators) return [];

    const collaboratorsMap = new Map<number, CollaboratorAIProgress>();
    
    // Initialize with project owner
    if (project.owner) {
      collaboratorsMap.set(project.owner.id, {
        id: project.owner.id,
        name: project.owner.name,
        tasksCompleted: 0,
        tasksAssigned: 0,
        completionRate: 0,
        skillDistribution: { Principiante: 0, Intermedio: 0, Avanzado: 0 }
      });
    }

    // Initialize collaborators
    project.collaborators.forEach(collab => {
      collaboratorsMap.set(collab.user.id, {
        id: collab.user.id,
        name: collab.user.name,
        tasksCompleted: 0,
        tasksAssigned: 0,
        completionRate: 0,
        skillDistribution: { Principiante: 0, Intermedio: 0, Avanzado: 0 }
      });
    });

    // Calculate AI task statistics for each collaborator
    aiTasks.forEach(task => {
      if (task.assigneeId) {
        const collaborator = collaboratorsMap.get(task.assigneeId);
        if (collaborator) {
          collaborator.tasksAssigned++;
          collaborator.skillDistribution[task.skillLevel]++;
          if (task.status === 'COMPLETED') {
            collaborator.tasksCompleted++;
          }
        }
      }
    });

    // Calculate completion rates
    collaboratorsMap.forEach(collab => {
      collab.completionRate = collab.tasksAssigned > 0 
        ? Math.round((collab.tasksCompleted / collab.tasksAssigned) * 100)
        : 0;
    });

    return Array.from(collaboratorsMap.values()).filter(collab => collab.tasksAssigned > 0);
  };

  const calculateDailyProgress = (): DailyProgress[] => {
    const dailyMap = new Map<number, DailyProgress>();
    
    aiTasks.forEach(task => {
      if (!dailyMap.has(task.dayNumber)) {
        dailyMap.set(task.dayNumber, {
          day: task.dayNumber,
          tasksTotal: 0,
          tasksCompleted: 0,
          completionRate: 0
        });
      }
      
      const dayProgress = dailyMap.get(task.dayNumber)!;
      dayProgress.tasksTotal++;
      if (task.status === 'COMPLETED') {
        dayProgress.tasksCompleted++;
      }
    });

    // Calculate completion rates
    dailyMap.forEach(dayProgress => {
      dayProgress.completionRate = dayProgress.tasksTotal > 0 
        ? Math.round((dayProgress.tasksCompleted / dayProgress.tasksTotal) * 100)
        : 0;
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.day - b.day);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className={`h-8 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'} rounded mb-8 w-64`}></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-64 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'} rounded`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
          {error}
        </div>
      </div>
    );
  }

  const aiTaskProgress = calculateAITaskProgress();
  const collaboratorProgress = calculateCollaboratorAIProgress();
  const dailyProgress = calculateDailyProgress();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FaBrain className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Progreso AI: {project?.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Progreso General AI */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <FaRobot className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Progreso AI
            </h2>
          </div>
          
          <div className="flex justify-center items-center h-48">
            <div className="relative w-32 h-32">
              <div className={`absolute inset-0 border-8 rounded-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-100'}`}></div>
              <div
                className={`absolute inset-0 border-8 rounded-full transition-all duration-1000 ${theme === 'dark' ? 'border-green-400' : 'border-green-500'}`}
                style={{
                  background: `conic-gradient(${theme === 'dark' ? '#4ade80' : '#22c55e'} ${(projectProgress?.progressPercentage || 0) * 3.6}deg, ${theme === 'dark' ? '#3f3f46' : '#f3f4f6'} 0deg)`
                }}
              ></div>
              <div className="absolute inset-4 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {projectProgress?.progressPercentage || 0}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {projectProgress?.completedAiTasks || 0} de {projectProgress?.totalAiTasks || 0} tareas completadas
            </p>
          </div>
        </div>

        {/* Estadísticas de Tareas AI */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <FaTasks className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Tareas AI
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'} flex items-center gap-3`}>
              <FaCheckCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Completadas
                </p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {aiTaskProgress.completed}
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'} flex items-center gap-3`}>
              <FaClock className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  En Progreso
                </p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {aiTaskProgress.inProgress}
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'} flex items-center gap-3`}>
              <FaExclamationTriangle className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Pendientes
                </p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {aiTaskProgress.pending}
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'} flex items-center gap-3`}>
              <FaCode className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total
                </p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {aiTaskProgress.total}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progreso por Colaborador AI */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <FaUser className={`w-6 h-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-500'}`} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Colaboradores AI
            </h2>
          </div>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {collaboratorProgress.length > 0 ? (
              collaboratorProgress.map((collab) => (
                <div key={collab.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'}`}></div>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {collab.name}
                      </span>
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {collab.tasksCompleted}/{collab.tasksAssigned}
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-100'}`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'}`}
                      style={{ width: `${collab.completionRate}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-1 text-xs">
                    <span className={`px-1 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                      P: {collab.skillDistribution.Principiante}
                    </span>
                    <span className={`px-1 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                      I: {collab.skillDistribution.Intermedio}
                    </span>
                    <span className={`px-1 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'}`}>
                      A: {collab.skillDistribution.Avanzado}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No hay colaboradores asignados
              </p>
            )}
          </div>
        </div>

        {/* Progreso Diario */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm md:col-span-2 lg:col-span-1`}>
          <div className="flex items-center gap-2 mb-6">
            <FaCalendarAlt className={`w-6 h-6 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Timeline Diario
            </h2>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dailyProgress.slice(0, 10).map((day) => (
              <div key={day.day} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Día {day.day}
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {day.tasksCompleted}/{day.tasksTotal} ({day.completionRate}%)
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-100'}`}>
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${theme === 'dark' ? 'bg-orange-400' : 'bg-orange-500'}`}
                    style={{ width: `${day.completionRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {dailyProgress.length === 0 && (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No hay tareas programadas por días
              </p>
            )}
          </div>
        </div>

        {/* Información del Proyecto AI */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm md:col-span-2`}>
          <div className="flex items-center gap-2 mb-6">
            <FaChartLine className={`w-6 h-6 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-500'}`} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Información del Proyecto AI
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Propietario
                </p>
                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {project?.owner?.name || 'No especificado'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Duración Estimada
                </p>
                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {projectProgress?.estimatedDuration || 'No especificada'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total de Días Planificados
                </p>
                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {dailyProgress.length} días
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Colaboradores Activos
                </p>
                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {collaboratorProgress.length}
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Fecha de Creación
                </p>
                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'No disponible'}
                </p>
              </div>
              {project?.description && (
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Descripción
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} line-clamp-3`}>
                    {project.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}