'use client';

import { useState, useEffect } from 'react';
import { projectsApi } from '../api/projects.api';
import { useAuth } from './useAuth';

export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
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

  const createProject = async (data: { name: string; description?: string }) => {
    try {
      const newProject = await projectsApi.create(data);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError('Error al crear el proyecto');
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const updateProject = async (id: number, data: { name?: string; description?: string }) => {
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
  };
}; 