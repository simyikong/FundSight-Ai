import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Typography, CircularProgress, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import MicIcon from '@mui/icons-material/Mic';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';  
import { keyframes } from '@mui/system';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { BiSolidEdit } from "react-icons/bi";
import { chatApi } from '../../api/chatbot';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface Message {
  role: string;
  content: string | Array<{text?: string; file?: string}>;
  liked?: boolean;
  disliked?: boolean;
}

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const Chatbot: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const navigate = useNavigate(); 

  const handleTabSwitch = (tabName: string) => {
    switch (tabName) {
      case 'Dashboard':
        navigate('/dashboard'); // Navigate to Dashboard tab
        break;
      case 'Loan':
        navigate('/loan'); // Navigate to Loan tab
        break;
      default:
        console.log('Unknown tab');
        break;
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    const newMessage: Message = {
      role: 'user',
      content: file 
        ? [{ text: input }, ...(file ? [{ file }] : [])]
        : input
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setFile(null);
    setIsLoading(true);

    try {
      const messageData = {
        query: input,
        message_history: messages,
        ...(file && { file })
      };
      const llm_response = await chatApi.sendMessage(messageData);

      let content: string 
      if (typeof llm_response.data.response === 'string') {
        content = llm_response.data.response;
      } else if (typeof llm_response.data.response === 'object' && llm_response.data.response !== null) {
        content = llm_response.data.response.message;
      } else {
        content = 'Unexpected response format.';
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: content
      }]);

      if (llm_response.data.switch_tab) {
        handleTabSwitch(llm_response.data.switch_tab);
      }
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
              background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
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
              py: 0.5,  
              px: 2,    
              borderRadius: 1,
              background: message.role === 'user' 
                ? 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
              color: 'white',
              boxShadow: message.role === 'user' 
                ? '0 4px 20px rgba(224, 195, 252, 0.2)'
                : '0 4px 12px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',
              border: message.role === 'user'
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography sx={{ 
              lineHeight: 1.2,  // Adjust line height for smaller bubble
              color: message.role === 'user' ? '#13111C' : 'white',
              fontWeight: message.role === 'user' ? 500 : 400,
            }}>
              <ReactMarkdown>{content}</ReactMarkdown>
            </Typography>
            {typeof message.content !== 'string' && message.content.map((item, idx) => (
              item.file && (
                <Box key={idx} sx={{ mt: 1, borderRadius: 2, overflow: 'hidden' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Attached file
                  </Typography>
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
    onClose(); 
  };

  const handleClearChat = () => {
    setMessages([]); // Clear messages from state
    localStorage.removeItem('chatMessages'); // Clear messages from localStorage
    setInput(''); // Clear input field
    setFile(null); // Clear any uploaded file
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg,rgb(25, 21, 54) 10%, #312E81 100%)',
      borderRadius: '0px',
      boxShadow: '0 -10px 20px rgba(187, 157, 242, 0.53)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.04)',
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2.2, 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(11, 7, 44, 0.95)',
        boxShadow: '0px 20px 60px 0px rgba(131, 141, 249, 0.20)',
        backdropFilter: 'blur(5px)',
      }}>
        <IconButton onClick={handleClose} size="small" sx={{ 
          color: 'rgba(255,255,255,0.7)',
          '&:hover': {
            color: '#E0C3FC',
            background: 'rgba(224, 195, 252, 0.1)'
          }
        }}>
          <MenuOpenIcon sx={{ 
            transform: 'rotate(180deg)',
            transition: 'transform 0.3s ease'
          }} />
        </IconButton>

        <Typography variant="h6" sx={{ 
          fontWeight: 700,
          letterSpacing: '0.5px',
          fontSize: '1.35rem',
          background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 2px 10px rgba(224, 195, 252, 0.2)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10px',
            left: '-50px',
            right: '-50px',
            bottom: '-10px',
            background: 'linear-gradient(90deg, transparent, rgba(224, 195, 252, 0.15) 30%, rgba(224, 195, 252, 0.15) 70%, transparent)',
            filter: 'blur(8px)',
            zIndex: -1,
          }
        }}>AI Assistant</Typography>

        <IconButton 
          onClick={handleClearChat}
          size="small" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            '&:hover': {
              color: '#E0C3FC',
              background: 'rgba(224, 195, 252, 0.1)'
            }
          }}
        >
          <BiSolidEdit size={20} />
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
            accept=".pdf,.docx,.jpg,.jpeg,.png,.csv,.xlsx"
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
                  paddingTop: '7px', 
                  paddingBottom: '4px',
                },
                '& input::placeholder': {
                  color: 'rgba(255,255,255,0.5)',
                  opacity: 1,  
                  verticalAlign: 'middle', 
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
              background: 'linear-gradient(215deg, #a3c1e2 0%, #7a8cc2 100%)', 
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
