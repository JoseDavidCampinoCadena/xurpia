import axios from './axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // Changed to string for JSON compatibility
}

export interface AIConversation {
  id: string;
  userId: number;
  title: string;
  messages: ChatMessage[];
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

export const aiConversationApi = {
  // Get all conversations for the current user
  getAllConversations: async (): Promise<AIConversation[]> => {
    const { data } = await axios.get('/ai-conversations');
    return data;
  },

  // Get a specific conversation by ID
  getConversationById: async (conversationId: string): Promise<AIConversation> => {
    const { data } = await axios.get(`/ai-conversations/${conversationId}`);
    return data;
  },

  // Send a message and get AI response
  sendMessage: async (message: string, conversationId?: string): Promise<{
    conversation: AIConversation;
    reply: string;
  }> => {
    const { data } = await axios.post('/ai-conversations/send-message', {
      message,
      conversationId,
    });
    return data;
  },

  // Delete a conversation
  deleteConversation: async (conversationId: string): Promise<void> => {
    await axios.delete(`/ai-conversations/${conversationId}`);
  },

  // Rename a conversation
  renameConversation: async (conversationId: string, title: string): Promise<AIConversation> => {
    const { data } = await axios.post(`/ai-conversations/${conversationId}/rename`, { title });
    return data;
  },
  // Test endpoint for debugging
  testConnection: async (): Promise<{ status: string; message: string }> => {
    try {
      const { data } = await axios.get('/ai-conversations/health');
      return data;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  },
};
