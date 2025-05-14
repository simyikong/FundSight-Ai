import React from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import { FeatureCard } from '../components/Layout';
import BarChartIcon from '@mui/icons-material/BarChart';
import BusinessIcon from '@mui/icons-material/Business';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import ForumIcon from '@mui/icons-material/Forum';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Home: React.FC = () => {
  const theme = useTheme();

  const handleChatWithAI = () => {
    // Find and trigger the Ask AI Assistant button in App.tsx
    const buttons = document.querySelectorAll('button');
    const aiButton = Array.from(buttons).find(button => 
      button.textContent?.includes('Ask AI Assistant')
    );
    if (aiButton) {
      aiButton.click();
    }
  };

  const featureCards = [
    {
      icon: <BarChartIcon fontSize="large" />,
      title: "Dashboard",
      description: "View your financial overview, key metrics, and performance trends.",
      buttonText: "Explore Dashboard",
      buttonLink: "/dashboard",
      buttonColor: "primary" as const,
      iconBgColor: "primary.light"
    },
    {
      icon: <AssessmentIcon fontSize="large" />,
      title: "Financial Records",
      description: "Organize and manage your monthly financial documents and statements.",
      buttonText: "Manage Records",
      buttonLink: "/financial-records",
      buttonColor: "success" as const,
      iconBgColor: "success.light"
    },
    {
      icon: <BusinessIcon fontSize="large" />,
      title: "Company Profile",
      description: "Complete your company profile and upload the necessary business documents.",
      buttonText: "View Profile",
      buttonLink: "/company-profile",
      buttonColor: "secondary" as const,
      iconBgColor: "secondary.main"
    },
    {
      icon: <CreditScoreIcon fontSize="large" />,
      title: "Funding Recommendations",
      description: "Get personalized funding options based on your business profile.",
      buttonText: "Get Recommendations",
      buttonLink: "/funding-recommendations",
      buttonColor: "info" as const,
      iconBgColor: "info.main"
    },
    {
      icon: <ForumIcon fontSize="large" />,
      title: "AI Assistant",
      description: "Get instant financial advice and answers to your business questions.",
      buttonText: "Chat with AI",
      buttonColor: "primary" as const,
      iconBgColor: "primary.dark",
      onClick: handleChatWithAI
    }
  ];

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
          {featureCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard 
                icon={card.icon}
                title={card.title}
                description={card.description}
                buttonText={card.buttonText}
                buttonLink={card.buttonLink}
                buttonColor={card.buttonColor}
                iconBgColor={card.iconBgColor}
                onClick={card.onClick}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;