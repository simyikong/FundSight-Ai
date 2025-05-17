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

  sendStreamingMessage: async (data: {
    query: string;
    message_history: Message[];
    file?: string | null;
  }, onChunk: (chunk: string) => void, onError: (error: any) => void) => {
    try {
      const response = await fetch(`${api.defaults.baseURL}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                onError(data.error);
              } else if (data.content) {
                onChunk(data.content);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in streaming chat API:', error);
      onError(error);
    }
  },
};