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
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              FundSight Ai
            </Typography>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
            <Button color="inherit" component={Link} to="/loan">Loan</Button>
            <Button color="inherit" onClick={handleChatbotOpen}>Chatbot</Button>
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
        <Drawer anchor="right" open={chatbotOpen} onClose={handleChatbotClose} PaperProps={{ sx: { width: 350 } }}>
          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">AI Chatbot</Typography>
              <IconButton onClick={handleChatbotClose}>
                <span style={{ fontSize: 20 }}>&times;</span>
              </IconButton>
            </Box>
            <Chatbot />
          </Box>
        </Drawer>
      </Router>
    </ThemeProvider>
  );
}

export default App;