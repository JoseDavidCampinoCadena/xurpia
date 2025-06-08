'use client';

import React from 'react';
import { useTasks } from '@/app/hooks/useTasks';
import { FaCheckCircle, FaPlay } from 'react-icons/fa';

export default function TasksPage() {
  const { tasks, loading, error, updateTask } = useTasks();  const handleMarkTaskComplete = async (taskId: number) => {
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
    <div className="p-6 max-w-6xl mx-auto">      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mis Tareas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tus tareas asignadas y tu progreso
          </p>        </div>
      </div>

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