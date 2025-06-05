import axios from './axios';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  projectId?: number | null; // AHORA es opcional
  assigneeId: number;
  createdAt: string;
  updatedAt: string;
  assignee: {
    id: number;
    name: string;
    email: string;
  };
  project?: {
    id: number;
    name: string;
  } | null; // AHORA es opcional
}

export interface CreateTaskData {
  title: string;
  description?: string;
  assigneeId: number;
  projectId?: number; // Opcional en creación
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  projectId?: number;
  assigneeId?: number;
}

export interface TaskDistributionResult {
  message: string;
  assignments: {
    task: Task;
    reason: string;
  }[];
  criteria: string;
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
  },  delete: async (id: number): Promise<void> => {
    await axios.delete(`/tasks/${id}`);
  },

  distributeWithAI: async (projectId: number, criteria?: string): Promise<TaskDistributionResult> => {
    const { data } = await axios.post('/tasks/distribute', {
      projectId,
      criteria: criteria || 'skills and workload'
    });
    return data;
  },
};
