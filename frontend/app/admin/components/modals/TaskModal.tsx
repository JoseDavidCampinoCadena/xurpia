'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Task, CreateTaskData, UpdateTaskData } from '@/app/api/tasks.api';
import { useCollaborators } from '@/app/hooks/useCollaborators';
import { useAuth } from '@/app/hooks/useAuth';

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
  const { user } = useAuth();

  // Get project collaborators
  const { collaborators } = useCollaborators(projectIdFromUrl);
  
  // Create a list of all assignable members (current user + collaborators)
  const assignableMembers = [
    // Include current user as first option
    ...(user ? [{
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'Owner'
    }] : []),
    // Include all collaborators except current user
    ...collaborators
      .filter(collab => collab.user.id !== user?.id)
      .map(collab => ({
        id: collab.user.id,
        name: collab.user.name,
        email: collab.user.email,
        role: collab.role
      }))
  ];
  const [formData, setFormData] = useState<CreateTaskData | UpdateTaskData>({
    title: '',
    description: '',
    projectId: projectIdFromUrl || 1,
    assigneeId: user?.id || 1,
    status: 'PENDING'
  });
  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title,
        description: task.description || '',
        projectId: task.projectId ?? projectIdFromUrl ?? 1,
        assigneeId: task.assigneeId ?? undefined,
        status: task.status
      });
    } else {
      // For create mode, set default assignee to current user if available
      setFormData({
        title: '',
        description: '',
        projectId: projectIdFromUrl || 1,
        assigneeId: user?.id || 1,
        status: 'PENDING'
      });
    }
  }, [task, mode, projectIdFromUrl, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
              className="w-full p-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-gray-300 dark:border-zinc-600"
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
              className="w-full p-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-gray-300 dark:border-zinc-600"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Asignar a
            </label>
            <select
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: Number(e.target.value) })}
              className="w-full p-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-gray-300 dark:border-zinc-600"
            >
              {assignableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email}) - {member.role}
                </option>
              ))}
              {assignableMembers.length === 0 && (
                <option value={user?.id || 1}>
                  {user?.name || 'Usuario actual'} (Solo tú)
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' })}
              className="w-full p-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-gray-300 dark:border-zinc-600"
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
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-zinc-600 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}