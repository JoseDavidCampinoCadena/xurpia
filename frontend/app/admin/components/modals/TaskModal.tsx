'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Task, CreateTaskData, UpdateTaskData } from '@/app/api/tasks.api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  task?: Task;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
}

export default function TaskModal({ isOpen, onClose, mode, task, onSubmit }: TaskModalProps) {
  const params = useParams();
  const projectIdFromUrl = params?.id ? Number(params.id) : undefined;

  const [formData, setFormData] = useState<CreateTaskData | UpdateTaskData>({
    title: '',
    description: '',
    projectId: 1, // Temporal, deberías obtener los proyectos disponibles
    assigneeId: 1, // Temporal, deberías obtener los usuarios disponibles
    status: 'PENDING'
  });

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title,
        description: task.description || '',
        projectId: task.projectId ?? projectIdFromUrl ?? 1,
        assigneeId: task.assigneeId,
        status: task.status
      });
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: projectIdFromUrl || 1,
        assigneeId: 1,
        status: 'PENDING'
      });
    }
  }, [task, mode, projectIdFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {mode === 'create' ? 'Nueva Tarea' : 'Editar Tarea'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' })}
              className="w-full p-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
            >
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completada</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}