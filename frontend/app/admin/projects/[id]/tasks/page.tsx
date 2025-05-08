'use client';

import { useState } from 'react';
import { useTasks } from '@/app/hooks/useTasks';
import TaskModal from '../../../components/modals/TaskModal';
import { Task } from '@/app/api/tasks.api';

export default function TasksPage() {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
      
      <div className="card p-6">
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleCreateTask}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Nueva Tarea
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-zinc-800 dark:text-white font-semibold">{task.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Asignado a: {task.assignee.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Proyecto: {task.project.name}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="p-2 border rounded bg-white dark:bg-zinc-800"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="COMPLETED">Completada</option>
                  </select>
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        task={selectedTask}
        onSubmit={async (data) => {
          try {
            if (modalMode === 'create') {
              await createTask(data);
            } else if (modalMode === 'edit' && selectedTask) {
              await updateTask(selectedTask.id, data);
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