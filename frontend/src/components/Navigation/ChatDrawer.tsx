import React from 'react';
import { Drawer } from '@mui/material';
import { Chatbot } from '../Chatbot/Chatbot';

interface ChatDrawerProps {
  open: boolean;
  width: number;
  onClose: () => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  input?: string;
  onLoanData?: (data: { funding_purpose?: string; requested_amount?: string }) => void;
}

/**
 * ChatDrawer component for the AI assistant chat interface.
 * Includes a resizable drawer with the Chatbot component.
 */
const ChatDrawer: React.FC<ChatDrawerProps> = ({ 
  open, 
  width, 
  onClose, 
  onMouseDown,
  input,
  onLoanData 
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      PaperProps={{
        sx: {
          width: width,
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
        onMouseDown={onMouseDown}
      />
      <Chatbot 
        onClose={onClose} 
        input={input}
        onLoanData={onLoanData}
      />
    </Drawer>
  );
};

export default ChatDrawer; 