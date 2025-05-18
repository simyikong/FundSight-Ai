import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import ChatDrawer from './ChatDrawer';
import Footer from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
  chatbotOpen: boolean;
  drawerWidth: number;
  handleChatbotOpen: () => void;
  handleChatbotClose: () => void;
  handleDrawerMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  chatbotInput?: string;
  onLoanData?: (data: { funding_purpose?: string; requested_amount?: string }) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  chatbotOpen,
  drawerWidth,
  handleChatbotOpen,
  handleChatbotClose,
  handleDrawerMouseDown,
  chatbotInput,
  onLoanData
}) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header 
        handleChatbotOpen={handleChatbotOpen}
        chatbotOpen={chatbotOpen}
        drawerWidth={drawerWidth}
      />
      
      {/* Main content area that resizes when chatbot opens */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          width: chatbotOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          transition: 'width 0.3s ease, margin 0.3s ease',
          mt: 9,
          overflow: 'hidden',
          mr: chatbotOpen ? `${drawerWidth}px` : 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          py: { xs: 2, sm: 3, md: 4 }, // Add responsive padding
          px: { xs: 2, sm: 6, md: 6 }, // Add responsive padding
        }}
      >
        {children}
      </Box>
      <Footer 
        handleChatbotOpen={handleChatbotOpen}
        chatbotOpen={chatbotOpen}
        drawerWidth={drawerWidth}
      />

      {/* Chatbot drawer */}
      <ChatDrawer
        open={chatbotOpen}
        onClose={handleChatbotClose}
        width={drawerWidth}
        onMouseDown={handleDrawerMouseDown}
        input={chatbotInput}
        onLoanData={onLoanData}
      />
    </Box>
  );
};
