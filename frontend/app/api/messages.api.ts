import axios from './axios';

export const messagesApi = {
  getMessages: async (otherUserId: number) => {
    const { data } = await axios.get(`/messages?otherUserId=${otherUserId}`);
    return data;
  },
  sendMessage: async (toUserId: number, content: string) => {
    const { data } = await axios.post('/messages', { toUserId, content });
    return data;
  },
  getChatsForProjectUser: async (projectId: number, userId: number) => {
    const { data } = await axios.get(`/messages/chats-summary?projectId=${projectId}&userId=${userId}`);
    return data;
  },
};
