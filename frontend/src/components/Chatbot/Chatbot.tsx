import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Typography, CircularProgress, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import MicIcon from '@mui/icons-material/Mic';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';  // Add this line
import { keyframes } from '@mui/system';

interface Message {
  role: string;
  content: string | Array<{text?: string; image?: string; file?: string}>;
  liked?: boolean;
  disliked?: boolean;
}

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const Chatbot: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !image && !file) return;

    const newMessage: Message = {
      role: 'user',
      content: image || file 
        ? [{ text: input }, ...(image ? [{ image }] : []), ...(file ? [{ file }] : [])]
        : input
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setImage(null);
    setFile(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          message_history: messages,
          image,
          file
        }),
      });

      const data = await response.json();
      setMessages(data.message_history);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = (index: number) => {
    setMessages(prev => prev.map((msg, i) => {
      if (i === index) {
        return { ...msg, liked: !msg.liked, disliked: false };
      }
      return msg;
    }));
  };

  const handleDislike = (index: number) => {
    setMessages(prev => prev.map((msg, i) => {
      if (i === index) {
        return { ...msg, disliked: !msg.disliked, liked: false };
      }
      return msg;
    }));
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.start();
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const content = typeof message.content === 'string' 
      ? message.content 
      : message.content.map(item => item.text).join(' ');

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
          mb: 2,
          gap: 1,
        }}
      >
        {message.role === 'assistant' && (
          <Avatar
            sx={{
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',  // Matching header gradient
              animation: isLoading ? `${pulseAnimation} 2s infinite` : 'none',
              boxShadow: '0 4px 20px rgba(224, 195, 252, 0.2)',
            }}
          >
            <RocketLaunchIcon sx={{ color: '#13111C' }} />
          </Avatar>
        )}
        <Box sx={{ maxWidth: '70%' }}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 3,
              background: message.role === 'user' 
                ? 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)'  // Updated to match the modern gradient
                : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
              color: 'white',
              boxShadow: message.role === 'user' 
                ? '0 4px 20px rgba(224, 195, 252, 0.2)'  // Enhanced glow effect
                : '0 4px 12px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',  // Added glass effect
              border: message.role === 'user'
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography sx={{ 
              lineHeight: 1.6, 
              color: message.role === 'user' ? '#13111C' : 'white',
              fontWeight: message.role === 'user' ? 500 : 400,
            }}>
              {content}
            </Typography>
            {typeof message.content !== 'string' && message.content.map((item, idx) => (
              item.image && (
                <Box key={idx} sx={{ mt: 1, borderRadius: 2, overflow: 'hidden' }}>
                  <img src={item.image} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                </Box>
              )
            ))}
          </Paper>
          {message.role === 'assistant' && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => handleLike(index)}
                sx={{
                  color: message.liked ? '#ABFFF3' : 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    color: '#ABFFF3',
                    background: 'rgba(224, 195, 252, 0.1)'
                  }
                }}
              >
                <ThumbUpIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleDislike(index)}
                sx={{
                  color: message.disliked ? '#FF6B6B' : 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    color: '#FF6B6B',
                    background: 'rgba(255,107,107,0.1)'
                  }
                }}
              >
                <ThumbDownIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const handleClose = () => {
    setMessages([]); // Clear messages from state
    localStorage.removeItem('chatMessages'); // Clear messages from localStorage
    setInput(''); // Clear input field
    setImage(null); // Clear any uploaded image
    setFile(null); // Clear any uploaded file
    onClose(); // Call the original onClose prop
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0F172A 0%, #312E81 100%)',  // Dark blue-purple gradient
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(5px)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ 
            bgcolor: 'transparent',
            background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',  // Soft purple to blue gradient
            boxShadow: '0 4px 20px rgba(224, 195, 252, 0.3)',
            transition: 'all 0.3s ease',
            position: 'relative',
            '&:before': {
              content: '""',
              position: 'absolute',
              inset: -3,
              borderRadius: '50%',
              padding: '3px',
              background: 'linear-gradient(135deg, rgba(224, 195, 252, 0.3) 0%, rgba(142, 197, 252, 0.3) 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            },
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 6px 25px rgba(142, 197, 252, 0.4)',
              '&:before': {
                background: 'linear-gradient(135deg, rgba(224, 195, 252, 0.5) 0%, rgba(142, 197, 252, 0.5) 100%)',
              }
            }
          }}>
            <RocketLaunchIcon sx={{ 
              fontSize: '1.5rem',
              filter: 'brightness(1.2)',
              color: '#13111C'  // Dark color for better contrast
            }} />
          </Avatar>
          <Typography variant="h6" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',  // Matching gradient
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '0.5px',
            textShadow: '0 2px 10px rgba(224, 195, 252, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              letterSpacing: '0.7px',
              textShadow: '0 4px 15px rgba(142, 197, 252, 0.3)',
            }
          }}>AI Assistant</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ 
          color: 'rgba(255,255,255,0.7)',
          '&:hover': {
            color: 'white',
            background: 'rgba(255,255,255,0.1)'
          }
        }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message, index) => (
          <div key={index}>{renderMessage(message, index)}</div>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(5px)' }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          background: 'rgba(255,255,255,0.08)',
          p: 1.5,
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <label htmlFor="file-upload">
            <IconButton component="span" sx={{ 
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: '#E0C3FC',
                background: 'rgba(224, 195, 252, 0.1)'
              }
            }}>
              <AttachFileIcon />
            </IconButton>
          </label>
          <input
            type="file"
            style={{ display: 'none' }}
            id="file-upload"
            onChange={handleFileUpload}
          />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Ask anything"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            InputProps={{
              disableUnderline: true,
              sx: { 
                color: 'white',
                '& input': {
                  paddingTop: '7px',  // Adjust vertical alignment
                  paddingBottom: '4px',
                },
                '& input::placeholder': {
                  color: 'rgba(255,255,255,0.5)',
                  opacity: 1,  // Fix opacity in some browsers
                  verticalAlign: 'middle',  // Center align placeholder
                },
              }
            }}
          />
          <IconButton 
            onClick={handleVoiceInput}
            sx={{ 
              color: isListening ? '#E0C3FC' : 'rgba(255,255,255,0.7)',
              animation: isListening ? `${pulseAnimation} 1.5s infinite` : 'none',
              '&:hover': {
                color: '#E0C3FC',
                background: 'rgba(224, 195, 252, 0.1)'
              }
            }}
          >
            <MicIcon />
          </IconButton>
          <IconButton 
            onClick={handleSend}
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(215deg, #a3c1e2 0%, #7a8cc2 100%)',  // Muted, natural blue/purple
              color: '#ffffff',
              '&:hover': {
                background: 'linear-gradient(215deg, #8fb3da 0%, #6b7bb5 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(120, 150, 200, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: '#13111C' }} /> : <SendIcon />}
          </IconButton>
        </Box>
        {file && (
          <Box sx={{ 
            mt: 1, 
            display: 'flex', 
            gap: 1, 
            alignItems: 'center',
            background: 'rgba(255,255,255,0.1)',
            p: 1,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              File attached
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setFile(null)}
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: '#FF6B6B',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chatbot;
