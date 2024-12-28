'use client';

import { useState } from 'react';
import { FaPlus, FaCheck, FaClock, FaTrash } from 'react-icons/fa';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Completar documentación',
      description: 'Finalizar la documentación del proyecto actual',
      status: 'pending',
      dueDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Revisar pull requests',
      description: 'Revisar y aprobar los PRs pendientes',
      status: 'completed',
      dueDate: '2024-01-10'
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        ...newTask,
        status: 'pending'
      }
    ]);

    setNewTask({
      title: '',
      description: '',
      dueDate: ''
    });
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
        : task
    ));
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Tareas</h1>

      {/* Formulario para nueva tarea */}
      <form onSubmit={addTask} className="mb-8 bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Título</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 rounded-md border border-gray-200 dark:border-zinc-700"
              placeholder="Título de la tarea"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Fecha límite</label>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 rounded-md border border-gray-200 dark:border-zinc-700"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-2 rounded-md border border-gray-200 dark:border-zinc-700 resize-none"
              rows={3}
              placeholder="Descripción de la tarea"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FaPlus /> Agregar Tarea
          </button>
        </div>
      </form>

      {/* Lista de tareas */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm flex items-start justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    task.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-zinc-700'
                  }`}
                >
                  {task.status === 'completed' && <FaCheck size={12} />}
                </button>
                <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${
                  task.status === 'completed' ? 'line-through opacity-50' : ''
                }`}>
                  {task.title}
                </h3>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{task.description}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FaClock />
                <span>{task.dueDate}</span>
              </div>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-600 p-2"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 