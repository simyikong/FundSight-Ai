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
  }, onChunk: (chunk: string) => void, onError: (error: any) => void, onTabSwitch: (tab: string, loanData?: { funding_purpose?: string; requested_amount?: string }) => void, onLoanData?: (data: { funding_purpose?: string; requested_amount?: string }) => void) => {
    try {
      const response = await fetch(`${api.defaults.baseURL}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const switchTab = response.headers.get('X-Switch-Tab');
      console.log('Switch tab header:', switchTab);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedLoanData: { funding_purpose?: string; requested_amount?: string } | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        console.log('Received chunk:', chunk);
        
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('Parsed SSE data:', data);
              
              if (data.error) {
                console.error('Error in SSE data:', data.error);
                onError(data.error);
              } else if (data.content) {
                onChunk(data.content);
                
                // Handle loan data from streaming response
                if (data.loan_data) {
                  console.log('Received loan data from stream:', data.loan_data);
                  accumulatedLoanData = data.loan_data;
                  if (onLoanData) {
                onLoanData(data.loan_data);
              }
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // After all chunks are processed, if we have loan data and a switch tab, pass it to onTabSwitch
      if (switchTab && accumulatedLoanData) {
        console.log('Calling onTabSwitch with:', { switchTab, accumulatedLoanData });
        onTabSwitch(switchTab, accumulatedLoanData);
      } else if (switchTab) {
        console.log('Calling onTabSwitch with just tab:', switchTab);
        onTabSwitch(switchTab);
      }
    } catch (error) {
      console.error('Error in streaming chat API:', error);
      onError(error);
    }
  },
};