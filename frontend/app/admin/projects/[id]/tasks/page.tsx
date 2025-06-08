'use client';

import { useState } from 'react';
import { useTasks } from '@/app/hooks/useTasks';
import TaskModal from '../../../components/modals/TaskModal';
import { Task, tasksApi, TaskDistributionResult } from '@/app/api/tasks.api';
import { useProjects } from '@/app/hooks/useProjects';
import { useParams } from 'next/navigation';

export default function TasksPage() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, refreshTasks } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributionResult, setDistributionResult] = useState<TaskDistributionResult | null>(null);
  const { projects } = useProjects();
  const params = useParams();
  const projectId = parseInt(params.id as string);

  const handleCreateTask = () => {
    setModalMode('create');
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  const handleDeleteTask = async (taskId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  const handleAIDistributeTasks = async () => {
    if (!projectId) {
      alert('No se pudo obtener el ID del proyecto');
      return;
    }

    if (confirm('¿Deseas que la IA distribuya las tareas pendientes entre los colaboradores del proyecto?')) {
      try {
        setIsDistributing(true);
        const result = await tasksApi.distributeWithAI(projectId);
        setDistributionResult(result);
        
        // Refresh tasks to show new assignments
        await refreshTasks();
          // Show success message
        alert(`¡Distribución completada! ${result.assignments.length} asignaciones realizadas.\n\n${result.message}`);
      } catch (err) {
        console.error('Error distributing tasks:', err);
        alert('Error al distribuir las tareas. Por favor, inténtalo de nuevo.');
      } finally {
        setIsDistributing(false);
      }
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTask(taskId, {
        status: newStatus as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
      });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  if (loading) return <div className="p-4">Cargando tareas...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-gray-900 dark:text-white text-3xl font-bold mb-6">
        Gestión de Tareas
      </h1>
      
      <div className="card p-6">        <div className="flex gap-4 mb-8">
          <button
            onClick={handleCreateTask}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Nueva Tarea
          </button>
          <button
            onClick={handleAIDistributeTasks}
            disabled={isDistributing || tasks.length === 0}
            className={`px-6 py-2 rounded-md transition-colors ${
              isDistributing || tasks.length === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isDistributing ? 'Distribuyendo...' : '🤖 Distribución IA'}
          </button>
        </div>

        {/* AI Distribution Results */}
        {distributionResult && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Última Distribución IA
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-3">{distributionResult.message}</p>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Asignaciones:</h4>
              {distributionResult.assignments.map((assignment, index) => (
                <div key={index} className="text-sm text-blue-700 dark:text-blue-300 pl-4">
                  • <strong>{assignment.task.title}</strong> → {assignment.task.assignee.name}
                  <br />
                  <span className="text-xs text-blue-600 dark:text-blue-400 pl-2">
                    {assignment.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay tareas creadas aún. ¡Crea tu primera tarea!
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-zinc-800 dark:text-white font-semibold text-lg">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {task.status === 'PENDING' ? 'Pendiente' : 
                         task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Completada'}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {task.description}
                      </p>
                    )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Asignado a:</span>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          {task.assignee?.name || 'Sin asignar'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Proyecto:</span>
                        <span>{task.project?.name || 'Sin proyecto'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-center ml-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="p-2 border rounded bg-white dark:bg-zinc-800 text-sm border-gray-300 dark:border-zinc-600"
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="IN_PROGRESS">En Progreso</option>
                      <option value="COMPLETED">Completada</option>
                    </select>
                    <button
                      onClick={() => handleEditTask(task)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 px-3 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        task={selectedTask || undefined}
        onSubmit={async (data) => {
          try {
            let projectId = data.projectId;
            if (!projectId && projects && projects.length > 0) {
              projectId = projects[0].id;
            }
            if (!projectId) {
              alert('No hay proyecto seleccionado.');
              return;
            }
            if (modalMode === 'create') {
              await createTask({ ...data, projectId });
            } else if (modalMode === 'edit' && selectedTask) {
              await updateTask(selectedTask.id, { ...data, projectId });
            }
            setIsModalOpen(false);
          } catch (err) {
            console.error('Error saving task:', err);
          }
        }}
      />
    </div>
  );
}