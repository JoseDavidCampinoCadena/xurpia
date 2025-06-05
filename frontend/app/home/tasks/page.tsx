'use client';

import React, { useState, useEffect } from 'react';
import { useTasks } from '@/app/hooks/useTasks';
import { useAuth } from '@/app/hooks/useAuth';
import { useEvaluations } from '@/app/hooks/useEvaluations';
import { useNotifications } from '@/app/hooks/useNotifications';
import SkillAssessment from '@/app/components/SkillAssessment';
import { FaBell, FaCheckCircle, FaPlay } from 'react-icons/fa';

export default function TasksPage() {
  const { tasks, loading, error, updateTask } = useTasks();
  const { user } = useAuth();
  const { getUserEvaluations } = useEvaluations();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  const [showAssessment, setShowAssessment] = useState(false);
  const [userEvaluations, setUserEvaluations] = useState<Array<{
    id: number;
    profession: string;
    technology: string;
    level: string;
    score: number;
    createdAt: string;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loadUserEvaluations = async () => {
      try {
        const evaluations = await getUserEvaluations();
        setUserEvaluations(evaluations);
          // Si el usuario no tiene evaluaciones, mostrar la evaluación
        if (evaluations.length === 0) {
          setShowAssessment(true);
        }
      } catch (err) {
        console.error('Error loading evaluations:', err);
      }
    };

    if (user) {
      loadUserEvaluations();
    }
  }, [user, getUserEvaluations]);
  const handleMarkTaskComplete = async (taskId: number) => {
    try {
      await updateTask(taskId, { status: 'COMPLETED' });
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleMarkTaskInProgress = async (taskId: number) => {
    try {
      await updateTask(taskId, { status: 'IN_PROGRESS' });
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS':
        return 'text-yellow-600 bg-yellow-100';
      case 'PENDING':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completada';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'PENDING':
        return 'Pendiente';
      default:
        return status;
    }
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

  if (showAssessment) {
    return (
      <SkillAssessment
        onComplete={() => {
          setShowAssessment(false);
          // Recargar evaluaciones después de completar
          getUserEvaluations().then(setUserEvaluations).catch(console.error);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header con notificaciones */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mis Tareas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tus tareas asignadas y tu progreso
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Botón de notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FaBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Dropdown de notificaciones */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-zinc-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botón para nueva evaluación */}
          <button
            onClick={() => setShowAssessment(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Nueva Evaluación
          </button>
        </div>
      </div>

      {/* Evaluaciones del usuario */}
      {userEvaluations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Mis Habilidades Evaluadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {evaluation.technology}
                </h3>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getLevelColor(evaluation.level)}`}>
                  {getLevelText(evaluation.level)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Puntuación: {evaluation.score}/100
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(evaluation.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de tareas */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tareas Asignadas ({tasks.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-zinc-700">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No tienes tareas asignadas aún
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Proyecto: {task.project?.name}</span>
                      <span>Creada: {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {task.status === 'PENDING' && (
                      <button
                        onClick={() => handleMarkTaskInProgress(task.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        <FaPlay size={10} />
                        Iniciar
                      </button>
                    )}
                    
                    {task.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleMarkTaskComplete(task.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        <FaCheckCircle size={12} />
                        Completar
                      </button>
                    )}

                    {task.status === 'COMPLETED' && (
                      <span className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded">
                        <FaCheckCircle size={12} />
                        Completada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}