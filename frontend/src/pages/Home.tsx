import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Container, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ForumIcon from '@mui/icons-material/Forum';

const Home: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 800,
            mb: 2,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(45deg, #4A6FE9 30%, #5E35B1 90%)' 
              : 'linear-gradient(45deg, #3451B2 30%, #4A0D9A 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Welcome to FundSight AI
        </Typography>
        <Typography 
          variant="h5" 
          color="textSecondary" 
          sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}
        >
          Your AI-powered financial advisor for MSMEs. Get insights, recommendations, and support to grow your business.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', padding: 4 }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex', 
                    p: 2, 
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    color: 'white',
                    mb: 2
                  }}
                >
                  <BarChartIcon fontSize="large" />
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  Dashboard
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  View your financial overview, key metrics, and performance trends.
                </Typography>
                <Button 
                  component={Link} 
                  to="/dashboard" 
                  variant="outlined" 
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Explore Dashboard
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', padding: 4 }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex', 
                    p: 2, 
                    borderRadius: '50%',
                    bgcolor: 'secondary.main',
                    color: 'white',
                    mb: 2
                  }}
                >
                  <AccountBalanceIcon fontSize="large" />
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  Loan Recommendations
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  Get personalized loan options based on your business profile.
                </Typography>
                <Button 
                  component={Link} 
                  to="/loan" 
                  variant="outlined" 
                  color="secondary"
                  sx={{ mt: 2 }}
                >
                  Find Loans
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 30px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', padding: 4 }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex', 
                    p: 2, 
                    borderRadius: '50%',
                    bgcolor: 'primary.dark',
                    color: 'white',
                    mb: 2
                  }}
                >
                  <ForumIcon fontSize="large" />
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  AI Assistant
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  Get instant financial advice and answers to your business questions.
                </Typography>
                <Button 
                  onClick={() => {
                    // Find and trigger the Ask AI Assistant button in App.tsx
                    const buttons = document.querySelectorAll('button');
                    const aiButton = Array.from(buttons).find(button => 
                      button.textContent?.includes('Ask AI Assistant')
                    );
                    if (aiButton) {
                      aiButton.click();
                    }
                  }} 
                  variant="outlined" 
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Chat with AI
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;