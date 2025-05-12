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
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';

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
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string; data: string } | null>(null);

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
        navigate('/dashboard');
        break;
      case 'Loan':
        navigate('/loan');
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

      let content: string;
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
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileInfo({
          data: reader.result as string,
          name: uploadedFile.name,
          type: uploadedFile.type,
        });
        setFile(uploadedFile.name); // Set file name to state
      };
      reader.readAsDataURL(uploadedFile);
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
      : message.content.map(item => item.text || '').join(' ');
    const isUser = message.role === 'user';

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
          gap: 1,
          width: '100%',
        }}
      >
        {isUser && fileInfo && (
          <Box sx={{ 
            mb: 1, 
            display: 'flex', 
            gap: 1, 
            alignItems: 'center',
            background: 'rgba(255,255,255,0.13)',
            py: 1.2,
            px: 2,
            borderRadius: 2.5,
            border: '1px solid rgba(255,255,255,0.13)',
            boxShadow: '0 1px 4px rgba(224, 195, 252, 0.10)',
            backdropFilter: 'blur(10px)', // Glassmorphism effect
            width: 'fit-content',
          }}>
            <Avatar sx={{ bgcolor: 'rgba(134, 106, 226, 0.9)', width: 28, height: 28, fontSize: 18 }}> 
              <DescriptionIcon sx={{ color: '#fff', fontSize: 18 }} /> 
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                {fileInfo.name}
              </Typography>
            </Box>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            gap: 1,
            width: '100%',
          }}
        >
          {!isUser && (
            <Avatar
              sx={{
                bgcolor: 'transparent',
                background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
                animation: isLoading ? `${pulseAnimation} 2s infinite` : 'none',
                boxShadow: '0 4px 20px rgba(224, 195, 252, 0.2)',
                width: 36,
                height: 36,
                mr: 1,
              }}
            >
              <RocketLaunchIcon sx={{ color: '#13111C', fontSize: 22 }} />
            </Avatar>
          )}
          <Box sx={{ maxWidth: '75%'}}> {/* Adjusted minWidth to prevent wrapping */}
            <Paper
              elevation={0}
              sx={{
                py: 0.1,
                px: 2,
                borderRadius: 3.5,
                background: isUser
                  ? 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)'
                  : 'rgba(255,255,255,0.08)',
                color: isUser ? '#13111C' : 'white',
                boxShadow: isUser
                  ? '0 2px 8px rgba(224, 195, 252, 0.10)'
                  : '0 2px 8px rgba(0,0,0,0.10)',
                border: isUser
                  ? '1px solid rgba(255,255,255,0.18)'
                  : '1px solid rgba(255,255,255,0.10)',
                ml: isUser ? 'auto' : 0,
                mr: isUser ? 0 : 1,
                transition: 'background 0.2s, box-shadow 0.2s',
                fontSize: 16,
              }}
            >
              <Typography sx={{
                lineHeight: 1.6,
                fontSize: 16,
                fontWeight: isUser ? 500 : 400,
                wordBreak: 'break-word',
                color: isUser ? '#13111C' : 'white',
              }}>
                <ReactMarkdown>{content}</ReactMarkdown>
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    setInput('');
    setFile(null);
    setFileInfo(null);
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0F172A 0%, #312E81 100%)',
      borderRadius: '0px',
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
        <IconButton onClick={onClose} size="small" sx={{ 
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
          background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          letterSpacing: '0.5px',
          textShadow: '0 2px 10px rgba(224, 195, 252, 0.2)',
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
        {fileInfo && (
          <Box sx={{ 
            mb: 1, 
            display: 'flex', 
            gap: 1, 
            alignItems: 'center',
            background: 'rgba(255,255,255,0.13)',
            py: 1.2,
            px: 2,
            borderRadius: 2.5,
            border: '1px solid rgba(255,255,255,0.13)',
            boxShadow: '0 1px 4px rgba(224, 195, 252, 0.10)',
            width: 'fit-content',
          }}>
            <Avatar sx={{ bgcolor: 'rgba(134, 106, 226, 0.9)', width: 28, height: 28, fontSize: 18 }}> <DescriptionIcon sx={{ color: '#fff', fontSize: 18 }} /> </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                {fileInfo.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
                {fileInfo.type}
              </Typography>
          </Box>
            <IconButton
              size="small"
              onClick={() => {
                setFileInfo(null);
                setFile(null);
              }}
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: '#FF6B6B',
                  background: 'rgba(255,255,255,0.1)'
                },
                borderRadius: 2
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Box sx={{ 
          display: 'flex', 
          gap: 1.5,
          background: 'rgba(255,255,255,0.10)',
          p: 1.5,
          borderRadius: 3.5,
          border: '1px solid rgba(255,255,255,0.13)',
          boxShadow: '0 1px 4px rgba(224, 195, 252, 0.10)',
          alignItems: 'center',
        }}>
          <label htmlFor="file-upload">
            <IconButton component="span" sx={{ 
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: '#E0C3FC',
                background: 'rgba(224, 195, 252, 0.1)'
              },
              borderRadius: 2
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
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            InputProps={{
              disableUnderline: true,
              sx: { 
                color: 'white',
                fontSize: 16,
                '& input': {
                  paddingTop: '8px', 
                  paddingBottom: '8px',
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
              },
              borderRadius: 2
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
              borderRadius: 2.5,
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
      </Box>
    </Box>
  );
};

export default Chatbot;