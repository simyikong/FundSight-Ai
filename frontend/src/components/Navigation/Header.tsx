import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NavigationBar from './NavigationBar';

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
  handleChatbotOpen: () => void;
}

/**
 * Header component for the application.
 * Contains the app bar, navigation, theme toggle, and AI assistant button.
 */
const Header: React.FC<HeaderProps> = ({ darkMode, toggleTheme, handleChatbotOpen }) => {
  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar sx={{ minHeight: 70, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
            color: 'white',
            textDecoration: 'none',
            transition: 'color 0.2s',
            '&:hover': { color: 'primary.light', cursor: 'pointer' },
            fontFamily: '"Roboto", "Helvetica", sans-serif',
            mr: 3,
            zIndex: 10,
          }}
        >
          FundSight AI
        </Typography>
        
        {/* Navigation Links */}
        <NavigationBar />
        
        {/* Right Side Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button
            variant="contained"
            onClick={handleChatbotOpen}
            sx={{
              fontWeight: 600,
              borderRadius: 28,
              px: 3,
              py: 1,
              fontSize: '0.95rem',
              boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              background: theme => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.25)',
              },
            }}
          >
            Ask AI Assistant
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 