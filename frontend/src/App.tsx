import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Button, Box, Container, Drawer, IconButton, Grid, Stack } from '@mui/material';
import { theme } from './theme';
import { AppLayout } from './components/Navigation';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CompanyProfile from './pages/CompanyProfile';
import FundingRecommendations from './pages/FundingRecommendations';
import Chatbot from './components/Chatbot/Chatbot';
import FinancialRecords from './pages/FinancialRecords';

/**
 * Main App component.
 * Handles app-wide state and renders the main application structure.
 */
function App() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(350);
  const [darkMode, setDarkMode] = useState(false);

  // Event handlers
  const handleChatbotOpen = () => setChatbotOpen(true);
  const handleChatbotClose = () => setChatbotOpen(false);
  const toggleTheme = () => setDarkMode(!darkMode);

  // Handle drawer resize functionality
  const handleDrawerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startWidth = drawerWidth;
    const doDrag = (e: MouseEvent) => {
      const newWidth = startWidth - (e.clientX - startX);
      setDrawerWidth(Math.max(350, Math.min(newWidth, 500)));
    };
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppLayout
          chatbotOpen={chatbotOpen}
          drawerWidth={drawerWidth}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          handleChatbotOpen={handleChatbotOpen}
          handleChatbotClose={handleChatbotClose}
          handleDrawerMouseDown={handleDrawerMouseDown}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/funding-recommendations" element={<FundingRecommendations />} />
            <Route path="/financial-records" element={<FinancialRecords />} />
          </Routes>
        </AppLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;