'use client';

import { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useProjects } from '@/app/hooks/useProjects';
import CollaboratorModal from '@/app/admin/components/modals/CollaboratorModal';
import { collaboratorsApi } from '@/app/api/collaborators.api';
import { projectsApi } from '@/app/api/projects.api';
import { Collaborator, Project } from '@/app/types/api.types';

export default function CollaboratorList() {
  const { currentProjectId } = useProjects();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [projectCode, setProjectCode] = useState<string | null>(null);

  // Nuevos estados para la función de unirse
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (currentProjectId) {
      refreshCollaborators();
      fetchProjectCode();
    }
  }, [currentProjectId]);

  const refreshCollaborators = async () => {
    try {
      const data = await collaboratorsApi.getCollaboratorsByProject(currentProjectId!);
      setCollaborators(data);
    } catch (err) {
      console.error('Error fetching collaborators:', err);
    }
  };

  const fetchProjectCode = async () => {
    try {
      const project: Project = await projectsApi.getProjectById(currentProjectId!);
      setProjectCode(project.code);
    } catch (err) {
      console.error('Error al obtener el código del proyecto:', err);
    }
  };

  const handleCopyCode = async () => {
    if (!projectCode) return;
    try {
      await navigator.clipboard.writeText(projectCode);
      alert('¡Código copiado al portapapeles!');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleAddCollaborator = () => {
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
    try {
      await collaboratorsApi.removeCollaborator(collaboratorId);
      await refreshCollaborators();
    } catch (err) {
      console.error('Error deleting collaborator:', err);
      alert('Error al eliminar colaborador.');
    }
  };

  const handleSaveCollaborator = async (collaboratorData: Omit<Collaborator, 'id'>) => {
    try {
      if (modalMode === 'create') {
        await collaboratorsApi.addCollaboratorByEmail({
          projectId: currentProjectId!,
          email: collaboratorData.email,
          role: collaboratorData.role as 'ADMIN' | 'MEMBER',
        });
      } else if (modalMode === 'edit' && selectedCollaborator) {
        await collaboratorsApi.updateRole(selectedCollaborator.id, {
          role: collaboratorData.role as 'ADMIN' | 'MEMBER',
        });
      }

      await refreshCollaborators();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error al guardar colaborador:', err);
      alert('Error al guardar el colaborador.');
    }
  };

  const handleJoinWithCode = async () => {
    try {
      if (!joinCode.trim()) {
        setJoinError('Debes ingresar un código válido.');
        return;
      }

      const userEmail = localStorage.getItem('loggedInUserEmail');
      if (!userEmail) {
        setJoinError('No se encontró el usuario actual. Inicia sesión nuevamente.');
        return;
      }

      const project = await projectsApi.getProjectByCode(joinCode.trim());

      if (!project || !project.id) {
        setJoinError('Proyecto no encontrado.');
        return;
      }

      await collaboratorsApi.addCollaboratorByEmail({
        projectId: project.id,
        email: userEmail,
        role: 'MEMBER',
      });

      alert('¡Te uniste correctamente al proyecto!');
      setJoinCode('');
      setJoinError('');
    } catch (error: any) {
      console.error('Error al unirse al proyecto:', error);
      setJoinError('No se pudo unir al proyecto. Verifica el código o si ya eres colaborador.');
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'ADMIN'
      ? 'text-red-600 dark:text-red-400'
      : 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="p-4 mt-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Colaboradores</h2>
        <button
          onClick={handleAddCollaborator}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Agregar Colaborador
        </button>
      </div>

      {/* Unirse a proyecto por código */}
      

      {/* Mostrar el código del proyecto actual */}
      {projectCode && (
        <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-md mb-6">
          <p className="text-zinc-800 dark:text-white font-medium">Código del proyecto:</p>
          <div className="flex items-center mt-1 gap-2">
            <span className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 px-3 py-1 rounded-md text-sm text-zinc-900 dark:text-white">
              {projectCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-sm text-blue-600 hover:underline"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {/* Lista de colaboradores */}
      <div className="bg-white dark:bg-zinc-800 p-4 rounded-md shadow-md">
        {collaborators.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-300">No hay colaboradores en este proyecto.</p>
        ) : (
          <ul className="space-y-4">
            {collaborators.map((colab) => (
              <li key={colab.id} className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-700 p-4 rounded-md shadow-sm">
                <div className="flex items-center gap-3">
                  <FaUserCircle className="text-zinc-500 dark:text-zinc-300" size={24} />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{colab.user.name}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">{colab.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${getRoleColor(colab.role)}`}>{colab.role}</span>
                  <button
                    onClick={() => handleEditCollaborator(colab)}
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteCollaborator(colab.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal para crear/editar colaborador */}
      <CollaboratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCollaborator}
        mode={modalMode}
        collaborator={selectedCollaborator}
      />
    </div>
  );
}
