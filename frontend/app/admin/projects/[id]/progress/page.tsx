'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaChartLine, FaCode, FaPaintBrush, FaServer, FaBug, FaUser, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';
import { projectsApi } from '@/app/api/projects.api';
import { tasksApi, Task } from '@/app/api/tasks.api';
import { useAuth } from '@/app/hooks/useAuth';
import { Project } from '@/app/hooks/useProjects';

interface TaskProgress {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  percentage: number;
}

interface CollaboratorProgress {
  id: number;
  name: string;
  tasksCompleted: number;
  tasksAssigned: number;
  completionRate: number;
}

export default function ProgressPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = async () => {
    if (!user || !projectId) return;
    
    try {
      setLoading(true);
      const [projectData, userTasks] = await Promise.all([
        projectsApi.getById(parseInt(projectId)),
        tasksApi.getAll(user.id)
      ]);
      
      setProject(projectData);
      // Filter tasks for this specific project
      const projectTasks = userTasks.filter(task => task.project?.id === parseInt(projectId));
      setTasks(projectTasks);
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

  const calculateTaskProgress = (): TaskProgress => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const pending = tasks.filter(task => task.status === 'PENDING').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, percentage };
  };

  const calculateCollaboratorProgress = (): CollaboratorProgress[] => {
    if (!project?.collaborators) return [];

    const collaboratorsMap = new Map<number, CollaboratorProgress>();
    
    // Initialize with project owner
    if (project.owner) {
      collaboratorsMap.set(project.owner.id, {
        id: project.owner.id,
        name: project.owner.name,
        tasksCompleted: 0,
        tasksAssigned: 0,
        completionRate: 0
      });
    }

    // Initialize collaborators
    project.collaborators.forEach(collab => {
      collaboratorsMap.set(collab.user.id, {
        id: collab.user.id,
        name: collab.user.name,
        tasksCompleted: 0,
        tasksAssigned: 0,
        completionRate: 0
      });
    });

    // Calculate task statistics for each collaborator
    tasks.forEach(task => {
      const collaborator = collaboratorsMap.get(task.assigneeId);
      if (collaborator) {
        collaborator.tasksAssigned++;
        if (task.status === 'COMPLETED') {
          collaborator.tasksCompleted++;
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

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className={`h-8 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-200'} rounded mb-8 w-64`}></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
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

  const taskProgress = calculateTaskProgress();
  const collaboratorProgress = calculateCollaboratorProgress();
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Progreso del Proyecto: {project?.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progreso General */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <FaChartLine className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Progreso General
            </h2>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="relative w-48 h-48">
              <div className={`absolute inset-0 border-8 rounded-full ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-100'}`}></div>
              <div
                className={`absolute inset-0 border-8 rounded-full transition-all duration-1000 ${theme === 'dark' ? 'border-green-400' : 'border-green-500'}`}
                style={{
                  background: `conic-gradient(${theme === 'dark' ? '#4ade80' : '#22c55e'} ${taskProgress.percentage * 3.6}deg, ${theme === 'dark' ? '#3f3f46' : '#f3f4f6'} 0deg)`
                }}
              ></div>
              <div className="absolute inset-4 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {taskProgress.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Tareas */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Estadísticas de Tareas
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'} flex items-center gap-3`}>
              <FaCheckCircle className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
              <div>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Completadas
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {taskProgress.completed}
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'} flex items-center gap-3`}>
              <FaClock className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
              <div>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  En Progreso
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {taskProgress.inProgress}
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'} flex items-center gap-3`}>
              <FaExclamationTriangle className={`w-6 h-6 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <div>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Pendientes
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {taskProgress.pending}
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'} flex items-center gap-3`}>
              <FaCode className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
              <div>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Total
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {taskProgress.total}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progreso por Colaborador */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Progreso por Colaborador
          </h2>
          <div className="space-y-4">
            {collaboratorProgress.length > 0 ? (
              collaboratorProgress.map((collab) => (
                <div key={collab.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaUser className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                      <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {collab.name}
                      </span>
                    </div>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {collab.tasksCompleted}/{collab.tasksAssigned} ({collab.completionRate}%)
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-100'}`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'}`}
                      style={{ width: `${collab.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                No hay colaboradores con tareas asignadas
              </p>
            )}
          </div>
        </div>

        {/* Información del Proyecto */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Información del Proyecto
          </h2>
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
                Colaboradores
              </p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {project?.collaborators?.length || 0}
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
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {project.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}