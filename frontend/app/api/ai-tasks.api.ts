import axios from './axios';

export interface AITask {
  id: number;
  title: string;
  description: string;
  skillLevel: 'Principiante' | 'Intermedio' | 'Avanzado';
  estimatedHours: number;
  dayNumber: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  projectId: number;
  assigneeId?: number | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: number;
    name: string;
    email: string;
  } | null;
  project?: {
    id: number;
    name: string;
    logo: string;
  } | null;
}

export interface ProjectProgress {
  projectId: number;
  totalAiTasks: number;
  completedAiTasks: number;
  progressPercentage: number;
  estimatedDuration?: string;
  aiTimeline?: Record<string, unknown>;
}

export const aiTasksApi = {
  // Get AI tasks
  getAll: async (projectId?: number, assignedOnly?: boolean): Promise<AITask[]> => {
    const params: Record<string, string | number> = {};
    if (projectId !== undefined) {
      params.projectId = projectId;
    }
    if (assignedOnly !== undefined) {
      params.assignedOnly = assignedOnly.toString();
    }
    
    const response = await axios.get('/ai-tasks', { params });
    return response.data;
  },

  // Get AI tasks for a specific project
  getByProject: async (projectId: number): Promise<AITask[]> => {
    return aiTasksApi.getAll(projectId);
  },

  // Get assigned AI tasks for current user
  getAssigned: async (projectId?: number): Promise<AITask[]> => {
    return aiTasksApi.getAll(projectId, true);
  },

  // Complete an AI task
  complete: async (taskId: number): Promise<AITask> => {
    const response = await axios.post(`/ai-tasks/${taskId}/complete`);
    return response.data;
  },

  // Start an AI task
  start: async (taskId: number): Promise<AITask> => {
    const response = await axios.post(`/ai-tasks/${taskId}/start`);
    return response.data;
  },

  // Generate AI tasks for a project
  generateForProject: async (projectId: number): Promise<{ message: string; tasksCreated: number }> => {
    const response = await axios.post(`/ai-tasks/generate-for-project/${projectId}`);
    return response.data;
  },
  // Get project progress
  getProjectProgress: async (projectId: number): Promise<ProjectProgress> => {
    const response = await axios.get(`/ai-tasks/project/${projectId}/progress`);
    return response.data;
  },

  // Assign daily tasks automatically
  assignDailyTasks: async (projectId: number): Promise<{ message: string; assignedTasks: number; assignments: any[] }> => {
    const response = await axios.post(`/ai-tasks/assign-daily-tasks/${projectId}`);
    return response.data;
  },
};
