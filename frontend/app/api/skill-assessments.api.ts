import axios from './axios';

export interface SkillQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
}

export interface SkillAssessment {
  id: number;
  userId: number;
  projectId: number;
  skillLevel: 'Principiante' | 'Intermedio' | 'Avanzado';
  score: number;
  completedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AssessmentResult {
  skillLevel: 'Principiante' | 'Intermedio' | 'Avanzado';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  recommendations: string[];
}

export const skillAssessmentsApi = {
  // Get assessment questions for a project
  getQuestions: async (projectId: number): Promise<SkillQuestion[]> => {
    const response = await axios.get(`/skill-assessments/projects/${projectId}/questions`);
    return response.data;
  },

  // Submit assessment answers
  submitAssessment: async (projectId: number, answers: Record<number, number>): Promise<AssessmentResult> => {
    const response = await axios.post(`/skill-assessments/projects/${projectId}/submit`, { answers });
    return response.data;
  },

  // Get project assessments (for admins)
  getProjectAssessments: async (projectId: number): Promise<SkillAssessment[]> => {
    const response = await axios.get(`/skill-assessments/projects/${projectId}`);
    return response.data;
  },

  // Get user's assessment for a project
  getUserAssessment: async (projectId: number): Promise<SkillAssessment | null> => {
    try {
      const response = await axios.get(`/skill-assessments/projects/${projectId}/user`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Create or update assessment questions (for admins)
  updateQuestions: async (projectId: number, questions: Omit<SkillQuestion, 'id'>[]): Promise<SkillQuestion[]> => {
    const response = await axios.put(`/skill-assessments/projects/${projectId}/questions`, { questions });
    return response.data;
  },

  // Reset user assessment (for admins)
  resetUserAssessment: async (projectId: number, userId: number): Promise<void> => {
    await axios.delete(`/skill-assessments/projects/${projectId}/users/${userId}`);
  },

  // Trigger automatic task assignment based on skill levels
  reassignTasks: async (projectId: number): Promise<{ assignedTasks: number; message: string }> => {
    const response = await axios.post(`/skill-assessments/projects/${projectId}/reassign-tasks`);
    return response.data;
  }
};
