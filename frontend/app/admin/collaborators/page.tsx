'use client';

import { useState, useEffect } from 'react';
import CollaboratorModal from '../components/modals/CollaboratorModal';
import { FaUserCircle } from 'react-icons/fa';
import { useProjects } from '@/app/hooks/useProjects';
import { useCollaborators } from '@/app/hooks/useCollaborators';
import { collaboratorsApi } from '@/app/api/collaborators.api';

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
  
  const { projects } = useProjects();
  const { collaborators, loading, error, refreshCollaborators, removeCollaborator } = useCollaborators(
    projects.length > 0 ? projects[0].id : undefined
  );

  // Cargar colaboradores cuando haya proyectos disponibles
  useEffect(() => {
    if (projects.length > 0) {
      refreshCollaborators(projects[0].id);
    }
  }, [projects]);

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

  const handleDeleteCollaborator = async (collaboratorId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este colaborador?')) {
      try {
        await removeCollaborator(collaboratorId);
      } catch (error) {
        console.error('Error al eliminar colaborador:', error);
      }
    }
  };

  const handleSaveCollaborator = async (collaboratorData: Omit<Collaborator, 'id'>) => {
    try {
      if (modalMode === 'create' && projects.length > 0) {
        refreshCollaborators(projects[0].id);
      } else if (modalMode === 'edit' && selectedCollaborator) {
        refreshCollaborators(projects[0].id);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al guardar colaborador:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'text-red-400';
      case 'member':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return <div className="p-8">Cargando colaboradores...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="p-8">
        <div className="card rounded-lg p-6">
          <p className="text-red-500">No hay proyectos disponibles. Debes crear un proyecto primero.</p>
        </div>
      </div>
    );
  }

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
                  <h3 className="text-white font-semibold">{collaborator.user.name}</h3>
                  <p className="text-gray-400 text-sm">{collaborator.user.email}</p>
                  <p className={`text-sm ${getRoleColor(collaborator.role)}`}>
                    {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1).toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => handleEditCollaborator({
                    id: collaborator.id,
                    name: collaborator.user.name,
                    email: collaborator.user.email,
                    role: collaborator.role
                  })}
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