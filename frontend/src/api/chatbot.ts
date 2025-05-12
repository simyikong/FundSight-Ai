import api from './index';

// Interface for chat message
interface Message {
  role: string;
  content: string | Array<{text?: string; file?: string}>;
  liked?: boolean;
  disliked?: boolean;
}

export const chatApi = {
  sendMessage: async (data: {
    query: string;
    message_history: Message[];
    file?: string | null;
  }) => {
    try {
      const response = await api.post('/api/v1/chat', data);
      console.log(response);
      return response;
    } catch (error) {
      console.error('Error in chat API:', error);
      throw error;
    }
  },
};