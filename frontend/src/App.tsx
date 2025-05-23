import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AppLayout } from './components/Navigation';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CompanyProfile from './pages/CompanyProfile';
import FundingRecommendations from './pages/FundingRecommendations';
import FinancialRecords from './pages/FinancialRecords';
import AdminPage from './pages/AdminPage';

/**
 * Main App component.
 * Handles app-wide state and renders the main application structure.
 */
function App() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(350);
  const [chatbotInput, setChatbotInput] = useState('');

  // Event handlers
  const handleChatbotOpen = () => setChatbotOpen(true);
  const handleChatbotClose = () => setChatbotOpen(false);
  const handleLoanData = (data: { funding_purpose?: string; requested_amount?: string }) => {
    // Handle loan data if needed
    console.log('Loan data received:', data);
  };

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

  // Listen for custom event to open chatbot
  useEffect(() => {
    const handler = (event: CustomEvent) => {
      console.log('Chatbot event triggered');
      setChatbotOpen(true);
      const inputText = event.detail?.input || "Analyze the financial health score of 69.17% and provide suggestions for improvement.";
      console.log('Setting chatbot input to:', inputText);
      setChatbotInput(inputText);
    };
    window.addEventListener('open-ai-chatbot', handler as EventListener);
    return () => window.removeEventListener('open-ai-chatbot', handler as EventListener);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppLayout
          chatbotOpen={chatbotOpen}
          drawerWidth={drawerWidth}
          handleChatbotOpen={handleChatbotOpen}
          handleChatbotClose={handleChatbotClose}
          handleDrawerMouseDown={handleDrawerMouseDown}
          chatbotInput={chatbotInput}
          onLoanData={handleLoanData}
        >
          <Routes>
            <Route path="/" element={<Home chatbotOpen={chatbotOpen} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/funding-recommendations" element={<FundingRecommendations />} />
            <Route path="/financial-records" element={<FinancialRecords />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </AppLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;