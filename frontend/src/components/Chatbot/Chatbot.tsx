import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Stack, Button, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatbotProps {
  onClose?: () => void;
}

const suggestions = [
  'Update company info?',
  'Check loan status?'
];

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hello, I'm your FundSight AI Assistant.\nWhat can I help you with?" },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "I'm an AI assistant. (This is a demo response.)" } as Message,
      ]);
    }, 800);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Paper elevation={4} sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#232526',
        borderRadius: 0,
        p: 0,
        m: 0,
        boxShadow: 'none',
        overflow: 'hidden',
      }}>
        {/* Header with close button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, pb: 1, bgcolor: '#232526', position: 'relative' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <SmartToyIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1, color: 'white' }}>AI Chatbot</Typography>
            <Typography variant="body2" sx={{ color: 'grey.300', fontWeight: 400 }}>Your AI-powered financial assistant</Typography>
          </Box>
          {onClose && (
            <IconButton onClick={onClose} sx={{ color: 'grey.200', ml: 1 }}>
              <span style={{ fontSize: 20 }}>&times;</span>
            </IconButton>
          )}
        </Box>
        {/* Welcome & Suggestions */}
        {messages.length === 1 && (
          <Box sx={{ mb: 2, mt: 1, px: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'grey.100', mb: 0.5, lineHeight: 1.2, fontSize: '1.25rem' }}>
              Hello, I'm your FundSight AI Assistant.<br />
              <span style={{ color: '#ffe082', fontWeight: 600, fontSize: '1.15rem' }}>What can I help you with?</span>
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1, fontSize: '0.95rem' }}>Get Started</Typography>
            <Stack direction="column" spacing={1}>
              {suggestions.map((s, i) => (
                <Button
                  key={i}
                  variant="contained"
                  startIcon={<span style={{ fontWeight: 'bold', fontSize: 16 }}>+</span>}
                  sx={{
                    borderRadius: 3,
                    background: 'primary.main',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minHeight: 36,
                    py: 0.5,
                    justifyContent: 'flex-start',
                    pl: 2,
                    boxShadow: '0 2px 8px rgba(25,118,210,0.10)',
                    '&:hover': {
                      background: 'primary.dark',
                    },
                  }}
                  onClick={() => handleSuggestion(s)}
                >
                  {s}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
        {/* Chat area */}
        <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, px: 2 }}>
          <Stack spacing={2}>
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 1.5,
                    maxWidth: '75%',
                    bgcolor: msg.sender === 'user' ? 'primary.main' : '#414345',
                    color: msg.sender === 'user' ? 'white' : (idx === 0 && msg.sender === 'bot' ? 'grey.300' : 'grey.100'),
                    borderRadius: 3,
                    borderTopRightRadius: msg.sender === 'user' ? 0 : 12,
                    borderTopLeftRadius: msg.sender === 'user' ? 12 : 0,
                    fontSize: idx === 0 && msg.sender === 'bot' ? '0.95rem' : '1rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i} style={{ display: 'block' }}>{line}</span>
                  ))}
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>
        {/* Input */}
        <Box sx={{ display: 'flex', gap: 1, p: 2, pt: 0, bgcolor: '#232526', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            sx={{
              bgcolor: '#232526',
              borderRadius: 5,
              height: 40,
              input: { color: 'grey.100', fontWeight: 500, height: 40, padding: '10px 14px', fontSize: '1rem' },
              '& fieldset': { border: 'none' },
            }}
            InputProps={{ sx: { height: 40 } }}
          />
          <IconButton color="primary" onClick={handleSend} sx={{ borderRadius: 2, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, color: 'white', width: 40, height: 40, minWidth: 40, minHeight: 40 }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

export default Chatbot;
