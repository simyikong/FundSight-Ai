import React from 'react';
import { Box, Typography } from '@mui/material';
import { FinancialRecords as FinancialRecordsComponent } from '../components/FinancialRecords';
import Layout from '../components/Layout';

const FinancialRecords: React.FC = () => {
  return (
    <Layout
      title="Financial Records"
      subtitle="Manage your monthly financial documents and extract data for analytics"
    >
      <FinancialRecordsComponent />
    </Layout>
  );
};

export default FinancialRecords; 