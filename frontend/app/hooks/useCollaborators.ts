'use client';

import { useState, useEffect, useCallback } from 'react';
import { collaboratorsApi, Collaborator as ApiCollaborator } from '../api/collaborators.api';

export type Collaborator = ApiCollaborator & {
  user: ApiCollaborator['user'] & { description?: string };
};

// Helper type for axios error
interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    (err as AxiosErrorLike).response?.data?.message
  ) {
    return (err as AxiosErrorLike).response!.data!.message!;
  }
  return fallback;
}

export const useCollaborators = (projectId?: number) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = useCallback(async (projectId: number) => {
    try {
      setLoading(true);
      const data = await collaboratorsApi.getProjectCollaborators(projectId);
      setCollaborators(data as Collaborator[]);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al cargar colaboradores'));
      console.error('Error fetching collaborators:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCollaborator = async (
    name: string,
    email: string,
    role: 'ADMIN' | 'MEMBER',
    projectId: number
  ) => {
    try {
      setLoading(true);
      const newCollaborator = await collaboratorsApi.addCollaborator({
        name,
        email,
        role,
        projectId,
      });
      setCollaborators(prev => [...prev, newCollaborator as Collaborator]);
      setError(null);
      return newCollaborator as Collaborator;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, 'Error al agregar colaborador');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCollaboratorRole = async (collaboratorId: number, role: 'ADMIN' | 'MEMBER') => {
    try {
      setLoading(true);
      const updatedCollaborator = await collaboratorsApi.updateRole(collaboratorId, { role });
      setCollaborators(prev =>
        prev.map(collab =>
          collab.id === collaboratorId ? (updatedCollaborator as Collaborator) : collab
        )
      );
      setError(null);
      return updatedCollaborator as Collaborator;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, 'Error al actualizar rol');
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
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, 'Error al eliminar colaborador');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchCollaborators(projectId);
    }
  }, [projectId, fetchCollaborators]);

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