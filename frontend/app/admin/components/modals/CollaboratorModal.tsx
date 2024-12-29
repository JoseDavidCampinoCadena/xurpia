'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { collaboratorsApi } from '@/app/api/collaborators.api';
import { useProjects } from '@/app/hooks/useProjects';

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  collaborator?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  onSave: (collaborator: { name: string; email: string; role: string }) => void;
}

export default function CollaboratorModal({
  isOpen,
  onClose,
  mode,
  collaborator,
  onSave
}: CollaboratorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { projects } = useProjects();

  // Actualizar el formulario cuando se edita un colaborador existente
  useEffect(() => {
    if (collaborator && mode === 'edit') {
      setFormData({
        name: collaborator.name,
        email: collaborator.email,
        role: collaborator.role
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: ''
      });
    }
  }, [collaborator, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'create' && projects.length > 0) {
        // Crear el colaborador con el ID del primer proyecto
        const newCollaborator = await collaboratorsApi.addCollaborator({
          name: formData.name,
          email: formData.email,
          role: formData.role === 'admin' ? 'ADMIN' : 'MEMBER',
          projectId: projects[0].id
        });

        // Solo si la operación en el backend es exitosa, actualizar el frontend
        onSave({
          name: newCollaborator.user.name,
          email: newCollaborator.user.email,
          role: newCollaborator.role
        });
        onClose();
      } else if (mode === 'edit' && collaborator) {
        const updatedCollaborator = await collaboratorsApi.updateRole(collaborator.id, {
          role: formData.role === 'admin' ? 'ADMIN' : 'MEMBER'
        });

        onSave({
          name: updatedCollaborator.user.name,
          email: updatedCollaborator.user.email,
          role: updatedCollaborator.role
        });
        onClose();
      }
    } catch (err: any) {
      console.error('Error:', err);
      if (err.response?.status === 409) {
        setError('Este usuario ya es un colaborador en este proyecto.');
      } else {
        const errorMessage = err.response?.data?.message || 'Error al procesar la solicitud';
        setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="card p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="text-red-500">No hay proyectos disponibles. Debes crear un proyecto primero.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-900 dark:text-white text-xl font-semibold">
            {mode === 'create' ? 'Añadir Colaborador' : 'Editar Colaborador'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={loading}
          >
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input w-full rounded-md"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input w-full rounded-md"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input w-full rounded-md"
              required
              disabled={loading}
            >
              <option value="">Seleccionar rol</option>
              <option value="admin">Administrador</option>
              <option value="member">Miembro</option>
            </select>
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 rounded-md"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? 'Procesando...' : mode === 'create' ? 'Añadir' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 