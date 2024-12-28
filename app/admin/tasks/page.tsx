'use client';

import { useState } from 'react';
import TaskModal from '../components/modals/TaskModal';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  status: 'pending' | 'completed';
}

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Implementar autenticación',
      description: 'Implementar sistema de login y registro usando Next Auth',
      dueDate: '2024-07-20',
      assignedTo: 'user1',
      status: 'pending'
    },
    // Más tareas aquí...
  ]);

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

  const handleDeleteTask = (taskId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

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
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Fecha límite: {task.dueDate}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Asignado a: {task.assignedTo}</p>
                </div>
                <div className="flex gap-2">
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
        task={selectedTask || undefined}
      />
    </div>
  );
} 