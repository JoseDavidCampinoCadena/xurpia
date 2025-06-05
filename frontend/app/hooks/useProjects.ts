'use client';

import { useState, useEffect } from 'react';
import { projectsApi } from '../api/projects.api';
import { useAuth } from './useAuth';

export interface Project {
  id: number;
  name: string;
  description?: string;
  logo: string;
  location?: string;
  lastConnection?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  collaborators?: any[];
  tasks?: any[];
  owner?: {
    id: number;
    name: string;
    email: string;
  };
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: { name: string; description?: string; logo: string; location?: string; lastConnection?: string }) => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      const newProject = await projectsApi.create({
        ...data,
        ownerId: user.id,
      });
      setProjects(prev => [...prev, newProject]);
      // Lógica para aumentar el conteo de proyectos del usuario al crear uno
      // Si tienes un campo projectsCount en el usuario, aquí podrías actualizarlo
      // await usersApi.updateUserProfile(user.id, { projectsCount: (user.projectsCount || 0) + 1 });
      return newProject;
    } catch (err) {
      setError('Error al crear el proyecto');
      console.error('Error creating project:', err);
      throw err;
    }
  };

  // Lógica para aumentar el conteo de proyectos cuando el usuario se une a un proyecto
  const joinProject = async (projectId: number) => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      await projectsApi.join(projectId, user.id);
      // Aquí podrías actualizar el conteo de proyectos del usuario
      // await usersApi.updateUserProfile(user.id, { projectsCount: (user.projectsCount || 0) + 1 });
      await fetchProjects();
    } catch (err) {
      setError('Error al unirse al proyecto');
      console.error('Error joining project:', err);
      throw err;
    }
  };

  const updateProject = async (id: number, data: { name?: string; description?: string; logo?: string; location?: string; lastConnection?: string }) => {
    try {
      const updatedProject = await projectsApi.update(id, data);
      setProjects(prev => prev.map(project => 
        project.id === id ? updatedProject : project
      ));
      return updatedProject;
    } catch (err) {
      setError('Error al actualizar el proyecto');
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await projectsApi.delete(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError('Error al eliminar el proyecto');
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects,
    joinProject, // Exporta la función para usarla donde se necesite
  };
};