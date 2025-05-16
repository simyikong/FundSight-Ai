import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigationBar from './NavigationBar';

interface HeaderProps {
  handleChatbotOpen: () => void;
  chatbotOpen: boolean;
  drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ handleChatbotOpen, chatbotOpen, drawerWidth }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: chatbotOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
        transition: 'width 0.3s ease',
        mr: chatbotOpen ? `${drawerWidth}px` : 0,
        minHeight: 72,
        background: 'rgba(6, 4, 25, 0.95)',
        boxShadow: '0px 2px 20px 0px rgba(49, 28, 131, 0.1)',
      }}
    >
      <Toolbar sx={{
        minHeight: 72,
        display: 'flex',
        alignItems: 'center',
        px: 4,
        position: 'relative',
        justifyContent: 'space-between',
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
          position: 'relative',
          zIndex: 2,
        }}>
          <img
            src="/logo.png"
            alt="FundSight AI Logo"
            style={{
              height: '36px',
              width: 'auto',
              marginLeft: '28px',
              marginRight: '-18px'
            }}
          />
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              textDecoration: 'none',
              fontFamily: 'Inter, "Roboto", "Helvetica", sans-serif',
              mr: 4,
              pl: 4,
              background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg,rgb(223, 160, 225) 0%,rgb(67, 129, 221) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transform: 'translateY(-1px)',
              }
            }}
          >
            FundSight AI
          </Typography>
        </Box>

        {/* Navigation Links */}
        <NavigationBar />

        {/* Right Side Controls */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 'fit-content',
          opacity: chatbotOpen ? 0 : 1,
          visibility: chatbotOpen ? 'hidden' : 'visible',
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
        }}>
          <Button
            variant="contained"
            onClick={handleChatbotOpen}
            sx={{
              display: chatbotOpen ? 'none' : 'inline-flex', // Hide button when chatbot is open
              fontWeight: 600,
              borderRadius: '28px',
              background: '#13111C',
              position: 'relative',
              border: 'none',
              ml: 2,
              mt: 1.5,
              mb: 1.5,
              mr: 4,
              px: 3,
              py: 1,
              fontSize: '1rem',
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '& .buttonText': {
                background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              },
              '&:before': {
                content: '""',
                position: 'absolute',
                inset: -2,
                borderRadius: '30px',
                padding: '2px',
                background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
                transform: 'translateY(-1px)',
                '&:before': {
                  opacity: 0,
                },
                boxShadow: '0 4px 20px rgba(224, 195, 252, 0.3)',
                '& .buttonText': {
                  background: '#13111C',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                },
              },
            }}
          >
            <span className="buttonText">Ask AI Assistant</span>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;