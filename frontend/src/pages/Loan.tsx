import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import LoanForm from '../components/Loan/LoanForm';

const Loan: React.FC = () => (
  <Container maxWidth="lg">
    <Box 
      textAlign="center" 
      sx={{ mb: 5, mt: 3 }}
    >
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Loan Recommendations
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Fill in your details below to get personalized loan options and eligibility information.
      </Typography>
    </Box>
    
    <LoanForm />
  </Container>
);

export default Loan;