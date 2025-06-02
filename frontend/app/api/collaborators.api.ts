import axios from './axios';

interface AddCollaboratorData {
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  projectId: number;
  projectName: string; // <-- necesario para el backend
}

interface UpdateRoleData {
  role: 'ADMIN' | 'MEMBER';
}

export interface Collaborator {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  project: {
    id: number;
    name: string;
  };
  role: string;
}

export const collaboratorsApi = {
  getProjectCollaborators: async (projectId: number): Promise<Collaborator[]> => {
    const { data } = await axios.get(`/collaborators/project/${projectId}`);
    return data;
  },

  generateInvitationCode: async (projectId: number) => {
    const { data } = await axios.post(`/collaborators/generate-invitation-code`, { projectId });
    return data;
  },

  addCollaborator: async (collaboratorData: AddCollaboratorData): Promise<Collaborator> => {
    const { data } = await axios.post('/collaborators', collaboratorData);
    return data;
  },

  updateRole: async (collaboratorId: number, roleData: UpdateRoleData): Promise<Collaborator> => {
    const { data } = await axios.patch(`/collaborators/${collaboratorId}`, roleData);
    return data;
  },

  removeCollaborator: async (collaboratorId: number): Promise<void> => {
    await axios.delete(`/collaborators/${collaboratorId}`);
  },

  joinByCode: async (code: string) => {
    const { data } = await axios.post('/collaborators/join-by-code', { code });
    return data;
  },
};