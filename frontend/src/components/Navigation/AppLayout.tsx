import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { Header, ChatDrawer } from './index';

interface AppLayoutProps {
  children: ReactNode;
  chatbotOpen: boolean;
  drawerWidth: number;
  handleChatbotOpen: () => void;
  handleChatbotClose: () => void;
  handleDrawerMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * AppLayout component defines the overall application layout.
 * Includes Header, main content area, and ChatDrawer.
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  chatbotOpen,
  drawerWidth,
  handleChatbotOpen,
  handleChatbotClose,
  handleDrawerMouseDown
}) => {
  return (
    <>
      <Header 
        handleChatbotOpen={handleChatbotOpen}
      />
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
          {children}
        </Box>
      </Container>
      <ChatDrawer 
        open={chatbotOpen}
        width={drawerWidth}
        onClose={handleChatbotClose}
        onMouseDown={handleDrawerMouseDown}
      />
    </>
  );
};

export default AppLayout; 