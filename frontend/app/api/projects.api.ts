import axios from './axios';
import { Project } from '../hooks/useProjects';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await axios.get('/projects');
    return data;
  },

  create: async (projectData: { name: string; description?: string; logo: string; location?: string; lastConnection?: string }): Promise<Project> => {
    const { data } = await axios.post('/projects', projectData);
    return data;
  },

  update: async (id: number, projectData: { name?: string; description?: string; logo?: string; location?: string; lastConnection?: string }): Promise<Project> => {
    const { data } = await axios.patch(`/projects/${id}`, projectData);
    return data;
  },
  getById: async (id: number): Promise<Project> => {
    const { data } = await axios.get(`/projects/${id}`);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/projects/${id}`);
  },

  join: async (projectId: number, userId: number): Promise<void> => {
    await axios.post(`/projects/${projectId}/join`);
  },
};