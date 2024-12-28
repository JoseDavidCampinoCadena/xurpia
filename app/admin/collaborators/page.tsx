'use client';

import { useState } from 'react';
import CollaboratorModal from '../components/modals/CollaboratorModal';
import { FaUserCircle } from 'react-icons/fa';

interface Collaborator {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function CollaboratorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'developer'
    },
    {
      id: 2,
      name: 'Ana García',
      email: 'ana@example.com',
      role: 'designer'
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos@example.com',
      role: 'admin'
    }
  ]);

  const handleCreateCollaborator = () => {
    setModalMode('create');
    setSelectedCollaborator(null);
    setIsModalOpen(true);
  };

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setModalMode('edit');
    setSelectedCollaborator(collaborator);
    setIsModalOpen(true);
  };

  const handleDeleteCollaborator = (collaboratorId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este colaborador?')) {
      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
    }
  };

  const handleSaveCollaborator = (collaboratorData: Omit<Collaborator, 'id'>) => {
    if (modalMode === 'create') {
      // Crear nuevo colaborador
      setCollaborators(prev => [
        ...prev,
        { ...collaboratorData, id: Date.now() }
      ]);
    } else if (modalMode === 'edit' && selectedCollaborator) {
      // Actualizar colaborador existente
      setCollaborators(prev =>
        prev.map(collab =>
          collab.id === selectedCollaborator.id
            ? { ...collab, ...collaboratorData }
            : collab
        )
      );
    }
    setIsModalOpen(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-400';
      case 'developer':
        return 'text-blue-400';
      case 'designer':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-zinc-800 dark:text-white mb-6">Gestión de Colaboradores</h1>
      
      <div className="card rounded-lg p-6">
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleCreateCollaborator}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Añadir Colaborador
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collaborators.map((collaborator) => (
            <div key={collaborator.id} className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <FaUserCircle className="w-12 h-12 text-gray-400" />
                <div>
                  <h3 className="text-white font-semibold">{collaborator.name}</h3>
                  <p className="text-gray-400 text-sm">{collaborator.email}</p>
                  <p className={`text-sm ${getRoleColor(collaborator.role)}`}>
                    {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => handleEditCollaborator(collaborator)}
                  className="text-blue-400 hover:text-blue-500"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteCollaborator(collaborator.id)}
                  className="text-red-400 hover:text-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CollaboratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        collaborator={selectedCollaborator}
        onSave={handleSaveCollaborator}
      />
    </div>
  );
} 