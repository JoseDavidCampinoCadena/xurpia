import axios from './axios';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  projectId?: number | null;
  assigneeId?: number | null; // Now optional since tasks can be unassigned
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: number;
    name: string;
    email: string;
  } | null; // Now optional since tasks can be unassigned
  project?: {
    id: number;
    name: string;
  } | null;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  assigneeId?: number; // Now optional for unassigned tasks
  projectId?: number;
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
