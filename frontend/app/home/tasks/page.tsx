'use client';

import React, { useState, useMemo } from 'react';
import { useTasks } from '@/app/hooks/useTasks';
import { FaCheckCircle, FaPlay, FaClock, FaRobot, FaFilter, FaTasks, FaChartLine, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

export default function TasksPage() {
  const { tasks, loading, error, updateTask } = useTasks();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL'); // ALL, AI, REGULAR

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

  // Función para extraer información adicional de tareas de IA
  const parseAITaskInfo = (description: string) => {
    const info = {
      deadline: null as string | null,
      skillLevel: null as string | null,
      dayNumber: null as string | null,
      assignedBy: null as string | null,
    };

    if (description) {
      const deadlineMatch = description.match(/📅 Fecha límite estimada: ([^\n]+)/);
      if (deadlineMatch) info.deadline = deadlineMatch[1];

      const skillMatch = description.match(/🎯 Nivel: ([^\n]+)/);
      if (skillMatch) info.skillLevel = skillMatch[1];

      const dayMatch = description.match(/📊 Día del proyecto: ([^\n]+)/);
      if (dayMatch) info.dayNumber = dayMatch[1];

      const assignedMatch = description.match(/🤖 Tarea generada por IA y asignada por ([^\n]+)/);
      if (assignedMatch) info.assignedBy = assignedMatch[1];
    }

    return info;
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const statusMatch = filterStatus === 'ALL' || task.status === filterStatus;
      const typeMatch = filterType === 'ALL' || 
        (filterType === 'AI' && task.title.startsWith('[IA]')) ||
        (filterType === 'REGULAR' && !task.title.startsWith('[IA]'));
      
      return statusMatch && typeMatch;
    });
  }, [tasks, filterStatus, filterType]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const pending = tasks.filter(t => t.status === 'PENDING').length;
    const aiTasks = tasks.filter(t => t.title.startsWith('[IA]')).length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, inProgress, completed, pending, aiTasks, progressPercentage };
  }, [tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'IN_PROGRESS':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
      case 'PENDING':
        return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
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

  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel?.toLowerCase()) {
      case 'principiante':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'intermedio':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'avanzado':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tus tareas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="text-red-600 dark:text-red-400 mb-2">❌ Error</div>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <FaTasks className="text-blue-600 dark:text-blue-400" />
            Mis Tareas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tus tareas asignadas y tu progreso personal
          </p>
        </div>
        
        {taskStats.total > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {taskStats.progressPercentage}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Progreso General
            </div>
          </div>
        )}
      </div>      {/* Task Statistics */}
      {taskStats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <FaTasks className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.pending}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                <FaClock className="text-gray-600 dark:text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.inProgress}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                <FaPlay className="text-yellow-600 dark:text-yellow-400 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.completed}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <FaCheckCircle className="text-green-600 dark:text-green-400 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tareas IA</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.aiTasks}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <FaRobot className="text-purple-600 dark:text-purple-400 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {taskStats.total > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center gap-4 mb-4">
            <FaFilter className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="ALL">Todos</option>
                <option value="PENDING">Pendientes</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="COMPLETED">Completadas</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="ALL">Todas</option>
                <option value="AI">Solo Tareas IA</option>
                <option value="REGULAR">Solo Tareas Regulares</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              Mostrando {filteredTasks.length} de {taskStats.total} tareas
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {taskStats.total > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progreso General</h3>
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {taskStats.completed} de {taskStats.total} completadas
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${taskStats.progressPercentage}%` }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            {taskStats.progressPercentage}% Completado
          </div>
        </div>
      )}      {/* Lista de tareas */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaTasks className="text-blue-600 dark:text-blue-400" />
              Tareas Asignadas ({filteredTasks.length})
            </h2>
            {taskStats.aiTasks > 0 && (
              <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                <HiSparkles className="w-4 h-4" />
                {taskStats.aiTasks} tareas generadas por IA
              </div>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-zinc-700">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4">
                {taskStats.total === 0 ? (
                  <FaTasks className="w-16 h-16 text-gray-400 mx-auto" />
                ) : (
                  <FaFilter className="w-16 h-16 text-gray-400 mx-auto" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {taskStats.total === 0 ? 'No hay tareas asignadas' : 'No hay tareas que coincidan'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {taskStats.total === 0 
                  ? 'Cuando tengas tareas asignadas aparecerán aquí' 
                  : 'Prueba ajustando los filtros para ver más tareas'
                }
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const aiInfo = task.title.startsWith('[IA]') ? parseAITaskInfo(task.description || '') : null;
              
              return (
                <div key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {task.title.startsWith('[IA]') ? task.title.replace('[IA] ', '') : task.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                        {task.title.startsWith('[IA]') && (
                          <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <FaRobot className="w-3 h-3" />
                            Tarea IA
                          </span>
                        )}
                      </div>

                      {/* AI Task Info */}
                      {aiInfo && (
                        <div className="mb-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {aiInfo.skillLevel && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-400">Nivel:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(aiInfo.skillLevel)}`}>
                                {aiInfo.skillLevel}
                              </span>
                            </div>
                          )}
                          {aiInfo.deadline && (
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                              <span className="text-gray-700 dark:text-gray-300">{aiInfo.deadline}</span>
                            </div>
                          )}
                          {aiInfo.dayNumber && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-400">Día:</span>
                              <span className="text-gray-700 dark:text-gray-300">{aiInfo.dayNumber}</span>
                            </div>
                          )}
                          {aiInfo.assignedBy && (
                            <div className="flex items-center gap-2">
                              <FaUser className="text-gray-500 dark:text-gray-400 w-3 h-3" />
                              <span className="text-gray-700 dark:text-gray-300">{aiInfo.assignedBy}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {task.description && (
                        <div className="mb-3">
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {task.title.startsWith('[IA]') 
                              ? task.description.split('\n\n')[0] // Solo mostrar la primera parte para tareas IA
                              : task.description
                            }
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FaTasks className="w-3 h-3" />
                          <span>Proyecto: {task.project?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>Creada: {new Date(task.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      {task.status === 'PENDING' && (
                        <button
                          onClick={() => handleMarkTaskInProgress(task.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
                        >
                          <FaPlay className="w-3 h-3" />
                          Iniciar
                        </button>
                      )}
                      
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleMarkTaskComplete(task.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                          <FaCheckCircle className="w-3 h-3" />
                          Completar
                        </button>
                      )}

                      {task.status === 'COMPLETED' && (
                        <span className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg font-medium">
                          <FaCheckCircle className="w-3 h-3" />
                          Completada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}