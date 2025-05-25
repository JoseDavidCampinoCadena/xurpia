import axios from './axios';
import { User } from './users.api';

export const aiApi = {
  recommendCollaborators: async (interest: string, users: User[]): Promise<number[]> => {
    const { data } = await axios.post('/collaborators/recommend', { interest, users });
    return data.recommendedUserIds;
  },
};
