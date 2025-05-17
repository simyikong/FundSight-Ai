import React from 'react';
import { Alert, Button } from '@mui/material';
import Layout from '../../Layout';

interface ErrorStateProps {
  title: string;
  subtitle: string;
  errorMessage: string;
  buttonText: string;
  onButtonClick: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  title, 
  subtitle, 
  errorMessage, 
  buttonText, 
  onButtonClick 
}) => {
  return (
    <Layout title={title} subtitle={subtitle}>
      <Alert severity="error" sx={{ mt: 2 }}>
        {errorMessage}
      </Alert>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={onButtonClick}
        sx={{ mt: 2 }}
      >
        {buttonText}
      </Button>
    </Layout>
  );
};

export default ErrorState; 