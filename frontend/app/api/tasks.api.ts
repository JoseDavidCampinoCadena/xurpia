import axios from './axios';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  projectId: number;
  assigneeId: number;
  createdAt: string;
  updatedAt: string;
  assignee: {
    id: number;
    name: string;
    email: string;
  };
  project: {
    id: number;
    name: string;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: number;
  assigneeId: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  projectId?: number;
  assigneeId?: number;
}

export const tasksApi = {
  getAll: async (userId?: number): Promise<Task[]> => {
    const { data } = await axios.get('/tasks', {
      params: { userId }
    });
    return data;
  },

  getById: async (id: number): Promise<Task> => {
    const { data } = await axios.get(`/tasks/${id}`);
    return data;
  },

  create: async (taskData: CreateTaskData): Promise<Task> => {
    const { data } = await axios.post('/tasks', taskData);
    return data;
  },

  update: async (id: number, taskData: UpdateTaskData): Promise<Task> => {
    const { data } = await axios.patch(`/tasks/${id}`, taskData);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/tasks/${id}`);
  },
}; 