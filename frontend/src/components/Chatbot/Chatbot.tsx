import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Typography, CircularProgress, Avatar, Dialog, DialogContent, Button } from '@mui/material';
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
  content: string | Array<{ text?: string; file?: string; name?: string; type?: string }>;
  liked?: boolean;
  disliked?: boolean;
  isChart?: boolean;
}

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

interface ChatbotProps {
  onClose: () => void;
  onLoanData?: (data: { funding_purpose?: string; requested_amount?: string }) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onClose, onLoanData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string; data: string } | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleTabSwitch = (tabName: string, loanData?: { funding_purpose?: string; requested_amount?: string }) => {
    console.log('Handling tab switch:', { tabName, loanData });
    switch (tabName) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'Loan':
        console.log('Navigating to funding recommendations with loan data:', loanData);
        navigate('/funding-recommendations', { 
          state: { 
            loanData: loanData || null 
          } 
        });
        break;
      case 'Profile':
        navigate('/company-profile');
        break;
      case 'Document':
        navigate('/financial-records');
        break;
      default:
        console.log('Unknown tab');
        break;
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !file && !fileInfo) return;

    setInput('');
    setFile(null);
    setFileInfo(null);
    setIsLoading(true);

    let newMessage: Message;
    if (fileInfo) {
      newMessage = {
        role: 'user',
        content: [
          ...(input.trim() ? [{ text: input }] : []),
          { file: fileInfo.data, name: fileInfo.name, type: fileInfo.type }
        ]
      };
    } else {
      newMessage = {
        role: 'user',
        content: input
      };
    }

    setMessages(prev => [...prev, newMessage]);

    // Check if the message is about charts
    const isChartRequest = input.toLowerCase().includes('generate') && input.toLowerCase().includes('chart');

    // If it's a chart request, wait for 5 seconds before showing the response
    if (isChartRequest) {
      setIsLoading(true);
      // Add an empty assistant message that will be updated after delay
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        isChart: false
      }]);
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      
      // Update the message with content and chart after delay
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = 'The line chart of Cash Inflow vs Outflow from January to May 2025 has been generated successfully.';
          lastMessage.isChart = true;
        }
        return newMessages;
      });
      
      setIsLoading(false);
      return;
    }

    // Add an empty assistant message that will be updated with streaming content
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      isChart: false
    }]);

    try {
      const messageData = {
        query: input,
        message_history: messages,
        ...(fileInfo && { file: fileInfo.data })
      };

      let accumulatedContent = '';

      await chatApi.sendStreamingMessage(
        messageData,
        (chunk: string) => {
          accumulatedContent += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = accumulatedContent;
            }
            return newMessages;
          });
        },
        (error: Error) => {
          console.error('Error in streaming:', error);
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = 'Sorry, there was an error processing your message.';
            }
            return newMessages;
          });
        },
        (tab: string, loanData?: { funding_purpose?: string; requested_amount?: string }) => {
          console.log('Tab switch callback received:', { tab, loanData });
          handleTabSwitch(tab, loanData);
        },
        (loanData: { funding_purpose?: string; requested_amount?: string }) => {
          console.log('Loan data callback received:', loanData);
          if (onLoanData) {
            onLoanData(loanData);
          }
        }
      );

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = 'Sorry, there was an error processing your message.';
        }
        return newMessages;
      });
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

  const quickStarts = [
    "Suggest me some loans",
    "What is my revenue growth?",
    "How can I reduce cost?"
  ];

  const handleQuickStart = async (msg: string) => {
    setInput(msg);
    await new Promise(r => setTimeout(r, 100)); // Ensure input is set before sending
    handleSendQuick(msg);
  };

  // Separate handler to avoid double input clearing
  const handleSendQuick = async (msg: string) => {
    if (!msg.trim()) return;
    const newMessage: Message = {
      role: 'user',
      content: msg
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setFile(null);
    setIsLoading(true);

    // Add an empty assistant message that will be updated with streaming content
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: ''
    }]);

    try {
      const messageData = {
        query: msg,
        message_history: messages,
      };

      let accumulatedContent = '';

      await chatApi.sendStreamingMessage(
        messageData,
        (chunk: string) => {
          accumulatedContent += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = accumulatedContent;
            }
            return newMessages;
          });
        },
        (error: Error) => {
          console.error('Error in streaming:', error);
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = 'Sorry, there was an error processing your message.';
            }
            return newMessages;
          });
        },
        (tab: string, loanData?: { funding_purpose?: string; requested_amount?: string }) => {
          handleTabSwitch(tab, loanData);
        },
        onLoanData
      );

    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = 'Sorry, there was an error processing your message.';
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const renderMessage = (message: Message, index: number) => {
    let filePreview = null;
    let textContent = '';
    if (Array.isArray(message.content)) {
      textContent = message.content.map(item => item.text || '').join(' ');
      const fileObj = message.content.find(item => item.file);
      if (fileObj) {
        filePreview = (
          <Box sx={{
            mb: 1,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            background: 'rgba(255,255,255,0.13)',
            py: 1.2,
            px: 2,
            borderRadius: 1,
            border: '1px solid rgba(255,255,255,0.13)',
            boxShadow: '0 1px 4px rgba(224, 195, 252, 0.10)',
            backdropFilter: 'blur(10px)',
            width: 'fit-content',
          }}>
            <Avatar sx={{ bgcolor: '#8086bf', width: 28, height: 28, fontSize: 18 }}>
              <DescriptionIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                {fileObj.name || 'File'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
                {fileObj.type || ''}
              </Typography>
            </Box>
          </Box>
        );
      }
    } else {
      textContent = message.content as string;
    }
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
        {isUser && Array.isArray(message.content) && message.content.some(item => item.file) && filePreview}
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
          <Box sx={{ maxWidth: '75%' }}>
            <Paper
              elevation={0}
              sx={{
                px: 2,
                borderRadius: 1,
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
              {message.isChart ? (
                <Box sx={{ px: 0.5, py: 1.2 }}>
                  <Typography sx={{
                    lineHeight: 1.6,
                    fontSize: 16,
                    fontWeight: 400,
                    wordBreak: 'break-word',
                    color: 'white',
                    mb: 2
                  }}>
                    {typeof message.content === 'string' ? message.content : ''}
                  </Typography>
                  <img 
                    src="/chart.png" 
                    alt="Chart" 
                    onClick={() => handleImageClick('/chart.png')}
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out'
                    }} 
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </Box>
              ) : (
                <Typography sx={{
                  lineHeight: 1.6,
                  fontSize: 16,
                  fontWeight: isUser ? 500 : 400,
                  wordBreak: 'break-word',
                  color: isUser ? '#13111C' : 'white',
                }}>
                  <ReactMarkdown>{textContent}</ReactMarkdown>
                </Typography>
              )}
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
    <>
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(22, 35, 63, 0.95) 10%, rgba(49, 46, 129, 0.95) 100%)',
        borderRadius: '0px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 80% 10%, rgba(157, 76, 232, 0.15) 0%, transparent 35%),
            radial-gradient(circle at 20% 10%, rgba(70, 147, 229, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 50% 5%, rgba(246, 153, 251, 0.15) 0%, transparent 30%)
          `,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
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
            color: '#E0C3FC',
            fontWeight: 600,
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
          {messages.length === 0 ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
              minHeight: 400,
            }}>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '0.5px',
                textShadow: '0 2px 10px rgba(224, 195, 252, 0.2)',
                mb: 5,
                textAlign: 'center',
              }}>
                How can I help you?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {quickStarts.map((msg) => (
                  <Paper
                    key={msg}
                    elevation={0}
                    sx={{
                      px: 2,
                      py: 1,
                      mb: 1.5,
                      borderRadius: 1,
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255, 255, 255, 0.52)',
                      cursor: 'pointer',
                      display: 'inline-block',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.15)',
                      }
                    }}
                    onClick={() => handleQuickStart(msg)}
                  >
                    {msg}
                  </Paper>
                ))}
              </Box>
            </Box>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index}>{renderMessage(message, index)}</div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>
        <Box sx={{ p: 2, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(5px)' }}>
          {/* Only show fileInfo preview above input area, not in chat history */}
          {fileInfo && (
            <Box sx={{
              mb: 1,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              background: 'rgba(255,255,255,0.13)',
              py: 1.2,
              px: 2,
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.13)',
              boxShadow: '0 1px 4px rgba(224, 195, 252, 0.10)',
              width: 'fit-content',
            }}>
              <Avatar sx={{ bgcolor: '#8086bf', width: 28, height: 28, fontSize: 18 }}> <DescriptionIcon sx={{ color: '#fff', fontSize: 18 }} /> </Avatar>
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
            background: 'rgba(255,255,255,0.10)',
            p: 1.5,
            borderRadius: 2,
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
                  width: '360px', // Make input wider
                  maxWidth: '100%',
                  background: 'transparent',
                  border: 'none',
                  '& input': {
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '10px',
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
                borderRadius: 2,
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

      <Dialog
        open={isImageModalOpen}
        onClose={handleCloseImageModal}
        maxWidth="lg"
        PaperProps={{
          sx: {
            background: 'rgba(22, 35, 63, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseImageModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: '#E0C3FC',
                background: 'rgba(224, 195, 252, 0.1)'
              },
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Enlarged Chart"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '4px'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Chatbot;