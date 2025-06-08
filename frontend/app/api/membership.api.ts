import axios from './axios';

export interface MembershipInfo {
  type: 'FREE' | 'PRO' | 'ENTERPRISE';
  expiresAt: Date | null;
  evaluationLimits: {
    perProject: number;
    description: string;
  };
  features: string[];
  price: string;
}

export interface EvaluationUsage {
  projectId: number;
  projectName: string;
  technology: string;
  count: number;
  limit: number;
  remaining: number;
}

export const membershipApi = {
  // Get user's current membership information
  getUserMembership: async (): Promise<MembershipInfo> => {
    const { data } = await axios.get('/membership/info');
    return data;
  },

  // Get evaluation usage statistics
  getEvaluationUsage: async (): Promise<EvaluationUsage[]> => {
    const { data } = await axios.get('/membership/usage');
    return data;
  },

  // Get available membership plans
  getAvailablePlans: async (): Promise<MembershipInfo[]> => {
    const { data } = await axios.get('/membership/plans');
    return data;
  },

  // Check if user can create an evaluation
  canCreateEvaluation: async (projectId: number, technology: string): Promise<{
    canCreate: boolean;
    reason?: string;
    currentCount: number;
    limit: number;
  }> => {
    const { data } = await axios.get(`/membership/can-evaluate/${projectId}/${encodeURIComponent(technology)}`);
    return data;
  },

  // Upgrade membership
  upgradeMembership: async (membershipType: 'PRO' | 'ENTERPRISE'): Promise<{ message: string }> => {
    const { data } = await axios.post('/membership/upgrade', { membershipType });
    return data;
  },

  // Downgrade membership to FREE
  downgradeMembership: async (): Promise<{ message: string }> => {
    const { data } = await axios.post('/membership/downgrade');
    return data;
  },
};
