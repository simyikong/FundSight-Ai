import React from 'react';
import Layout from '../components/Layout';
import { Box, Typography } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Layout
      title="Financial Dashboard"
      subtitle="Overview of your business financial performance and metrics"
    >
      <Box p={2}>
        <Typography variant="body1">
          Dashboard content goes here
        </Typography>
      </Box>
    </Layout>
  );
};

export default Dashboard;