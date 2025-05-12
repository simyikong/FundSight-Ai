import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Button, Box, Container, Drawer, IconButton } from '@mui/material';
import { theme, responsiveDarkTheme } from './theme';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Loan from './pages/Loan';
import Chatbot from './components/Chatbot/Chatbot';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(350);
  const [darkMode, setDarkMode] = useState(false);

  const handleChatbotOpen = () => setChatbotOpen(true);
  const handleChatbotClose = () => setChatbotOpen(false);
  const toggleTheme = () => setDarkMode(!darkMode);

  const currentTheme = useMemo(() => 
    darkMode ? responsiveDarkTheme : theme, 
    [darkMode]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startWidth = drawerWidth;

    const doDrag = (e: MouseEvent) => {
      const newWidth = startWidth - (e.clientX - startX);
      setDrawerWidth(Math.max(350, Math.min(newWidth, 500))); // Limit width between 350 and 500
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Router>
        <AppBar position="fixed" elevation={0}>
          <Toolbar sx={{ minHeight: 70, display: 'flex', alignItems: 'center', position: 'relative' }}>
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
                zIndex: 2,
              }}
            >
              FundSight AI
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: 'flex', gap: 3, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
              <Button
                color="inherit"
                component={Link}
                to="/dashboard"
                sx={{
                  fontWeight: 500,
                  fontSize: '1rem',
                  px: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/loan"
                sx={{
                  fontWeight: 500,
                  fontSize: '1rem',
                  px: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Loan
              </Button>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, zIndex: 2 }}>
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
        <Container 
          maxWidth="lg" 
          sx={{ 
            mt: 10,
            mb: 4,
            px: { xs: 2, sm: 3, md: 4 },
            width: chatbotOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
            transition: 'width 0.3s ease',
          }}>
          <Box>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/loan" element={<Loan />} />
            </Routes>
          </Box>
        </Container>
        <Drawer 
          anchor="right" 
          open={chatbotOpen} 
          onClose={handleChatbotClose}
          variant="persistent"
          PaperProps={{ 
            sx: { 
              width: drawerWidth,
              height: '100vh',
              border: 'none',
              boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
              position: 'fixed',
              right: 0,
            } 
          }}
        >
          <div 
            style={{
              width: '10px',
              cursor: 'ew-resize',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 1000,
            }}
            onMouseDown={handleMouseDown}
          />
          <Chatbot onClose={handleChatbotClose} />
        </Drawer>
      </Router>
    </ThemeProvider>
  );
}

export default App;