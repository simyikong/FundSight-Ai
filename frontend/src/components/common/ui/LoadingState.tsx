import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import Layout from '../../Layout';

interface LoadingStateProps {
  title: string;
  subtitle: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ title, subtitle }) => {
  return (
    <Layout title={title} subtitle={subtitle}>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    </Layout>
  );
};

export default LoadingState; 