import React from 'react';
import Layout from '../components/Layout';
import LoanForm from '../components/Loan/LoanForm';
import { Box, Typography, Card, CardContent, Grid, Divider } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

const Loan: React.FC = () => (
  <Layout
    title="Loan Recommendations"
    subtitle="Fill in your details below to get personalized loan options and eligibility information"
  >
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Box mb={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      color: 'white',
                      mx: 'auto'
                    }}
                  >
                    <AccountBalanceIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Competitive Rates
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Access the most competitive interest rates based on your business profile and credit history.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'secondary.main',
                      color: 'white',
                      mx: 'auto'
                    }}
                  >
                    <SecurityIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Secure Process
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Your financial information is encrypted and securely processed for loan evaluations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      color: 'white',
                      mx: 'auto'
                    }}
                  >
                    <SpeedIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Fast Approval
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Get pre-approved loan options quickly with our AI-powered evaluation system.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <LoanForm />
      </Grid>
    </Grid>
  </Layout>
);

export default Loan;