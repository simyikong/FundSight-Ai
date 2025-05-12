import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Button, Box, Container, Drawer, IconButton } from '@mui/material';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Loan from './pages/Loan';
import Chatbot from './components/Chatbot/Chatbot';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const handleChatbotOpen = () => setChatbotOpen(true);
  const handleChatbotClose = () => setChatbotOpen(false);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" elevation={2} sx={{ background: 'rgba(18,18,18,0.95)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
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
                '&:hover': { color: 'primary.main', cursor: 'pointer' },
                fontFamily: 'Montserrat, Roboto, sans-serif',
                mr: 3,
                zIndex: 2,
              }}
            >
              FundSight Ai
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: 'flex', gap: 3, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
              <Button
                color="inherit"
                component={Link}
                to="/dashboard"
                sx={{
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  letterSpacing: 0.5,
                  px: 3,
                  borderRadius: 2,
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    background: 'rgba(25, 118, 210, 0.08)',
                    color: 'primary.main',
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
                  fontSize: '1.1rem',
                  letterSpacing: 0.5,
                  px: 3,
                  borderRadius: 2,
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    background: 'rgba(25, 118, 210, 0.08)',
                    color: 'primary.main',
                  },
                }}
              >
                Loan
              </Button>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', zIndex: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleChatbotOpen}
                sx={{
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(25,118,210,0.15)',
                  ml: 2,
                  px: 3,
                  py: 1.2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    background: 'primary.dark',
                    boxShadow: '0 4px 16px rgba(25,118,210,0.25)',
                  },
                }}
              >
                Chatbot
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/loan" element={<Loan />} />
            </Routes>
          </Box>
        </Container>
        <Drawer anchor="right" open={chatbotOpen} onClose={handleChatbotClose} PaperProps={{ sx: { width: 350, height: '100vh' } }}>
          <Chatbot onClose={handleChatbotClose} />
        </Drawer>
      </Router>
    </ThemeProvider>
  );
}

export default App;