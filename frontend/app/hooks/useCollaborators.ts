'use client';

import { useState } from 'react';
import { collaboratorsApi } from '../api/collaborators.api';

export interface Collaborator {
  id: number;
  userId: number;
  projectId: number;
  role: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  project: {
    id: number;
    name: string;
  };
}

export const useCollaborators = (projectId?: number) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = async (projectId: number) => {
    try {
      setLoading(true);
      const data = await collaboratorsApi.getProjectCollaborators(projectId);
      setCollaborators(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar colaboradores');
      console.error('Error fetching collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCollaborator = async (userId: number, projectId: number, role: string = 'MEMBER') => {
    try {
      setLoading(true);
      const newCollaborator = await collaboratorsApi.addCollaborator({
        userId,
        projectId,
        role,
      });
      setCollaborators(prev => [...prev, newCollaborator]);
      setError(null);
      return newCollaborator;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al agregar colaborador';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCollaboratorRole = async (collaboratorId: number, role: string) => {
    try {
      setLoading(true);
      const updatedCollaborator = await collaboratorsApi.updateRole(collaboratorId, { role });
      setCollaborators(prev =>
        prev.map(collab =>
          collab.id === collaboratorId ? updatedCollaborator : collab
        )
      );
      setError(null);
      return updatedCollaborator;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar rol';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (collaboratorId: number) => {
    try {
      setLoading(true);
      await collaboratorsApi.removeCollaborator(collaboratorId);
      setCollaborators(prev =>
        prev.filter(collab => collab.id !== collaboratorId)
      );
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar colaborador';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Si se proporciona un projectId, cargar los colaboradores automáticamente
  useState(() => {
    if (projectId) {
      fetchCollaborators(projectId);
    }
  });

  return {
    collaborators,
    loading,
    error,
    addCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    refreshCollaborators: fetchCollaborators,
  };
}; 