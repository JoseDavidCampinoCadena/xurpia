'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

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
            >
              <option value="">Seleccionar rol</option>
              <option value="admin">Administrador</option>
              <option value="developer">Desarrollador</option>
              <option value="designer">Diseñador</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-4 py-2 rounded-md"
            >
              {mode === 'create' ? 'Añadir' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 