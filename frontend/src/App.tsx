import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme, responsiveDarkTheme } from './theme';
import { AppLayout } from './components/Navigation';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile_Apply from './pages/Profile_Apply';
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

  // Theme selection based on dark mode setting
  const currentTheme = useMemo(() => 
    darkMode ? responsiveDarkTheme : theme, 
    [darkMode]
  );

  // Handle drawer resize functionality
  const handleDrawerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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
            <Route path="/financial-records" element={<FinancialRecords />} />
            <Route path="/profile_apply" element={<Profile_Apply />} />
          </Routes>
        </AppLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;