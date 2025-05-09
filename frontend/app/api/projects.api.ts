import axios from './axios';
import { Project } from '../hooks/useProjects';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await axios.get('/projects');
    return data;
  },

  create: async (projectData: { name: string; description?: string }): Promise<Project> => {
    const { data } = await axios.post('/projects', projectData);
    return data;
  },

  update: async (id: number, projectData: { name?: string; description?: string }): Promise<Project> => {
    const { data } = await axios.patch(`/projects/${id}`, projectData);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/projects/${id}`);
  },
};

// Funciones helper para usar directamente
export const getAllProjects = async (): Promise<Project[]> => {
  return projectsApi.getAll();
}; 