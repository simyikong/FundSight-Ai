import React from 'react';
import { Box, Typography, Grid, useTheme, Button, } from '@mui/material';
import { FeatureCard } from '../components/Layout';
import BarChartIcon from '@mui/icons-material/BarChart';
import BusinessIcon from '@mui/icons-material/Business';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import ForumIcon from '@mui/icons-material/Forum';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const featureCards = [
    {
      icon: <BarChartIcon />,
      title: "Dashboard",
      description: "View your financial overview, key metrics, and performance trends.",
      buttonText: "Explore Dashboard",
      buttonLink: "/dashboard",
      buttonColor: "primary",
      iconBgColor: "rgba(147, 51, 234, 0.1)",
      onClick: () => navigate('/dashboard')
    },
    {
      icon: <AccountBalanceIcon />,
      title: "Loan Recommendations",
      description: "Get personalized loan options based on your business profile.",
      buttonText: "Find Loans",
      buttonLink: "/funding-recommendations",
      buttonColor: "primary",
      iconBgColor: "rgba(79, 70, 229, 0.1)",
      onClick: () => navigate('/funding-recommendations')
    },
    {
      icon: <BusinessIcon fontSize="large" />,
      title: "Company Profile",
      description: "Complete your company profile and upload the necessary business documents.",
      buttonText: "View Profile",
      buttonLink: "/company-profile",
      buttonColor: "secondary" as const,
      iconBgColor: "secondary.main",
      onClick: () => navigate('/company-profile')
    },
    {
      icon: <AssessmentIcon fontSize="large" />,
      title: "Financial Records",
      description: "Manage your monthly financial documents and extract data for analytics.",
      buttonText: "View Records",
      buttonLink: "/financial-records",
      buttonColor: "success" as const,
      iconBgColor: "success.main",
      onClick: () => navigate('/financial-records')
    },
    {
      icon: <ForumIcon fontSize="large" />,
      title: "AI Assistant",
      description: "Get instant financial advice and answers to your business questions.",
      buttonText: "Chat with AI",
      buttonColor: "primary",
      iconBgColor: "rgba(99, 102, 241, 0.1)",
      onClick: () => navigate('/chat')
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      pt: 4,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '5%',
        right: '10%',
        width: '35%',
        height: '35%',
        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.18) 0%, transparent 70%)',
        filter: 'blur(60px)',
        borderRadius: '50%',
        zIndex: 0,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '15%',
        top: '70%',
        left: '5%',
        width: '30%',
        height: '30%',
        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.18) 0%, transparent 70%)',
        filter: 'blur(60px)',
        borderRadius: '50%',
        zIndex: 0,
      }
    }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 4, md: 8 },
          pt: { xs: 2, md: 4 }, // Reduced top padding
          pb: { xs: 4, md: 10 },
          zIndex: 1,
          gap: 6,
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '3.3rem', md: '4rem' },
                fontWeight: 800,
                mb: 3,
                mt: { xs: 2, md: 0 },
                background: `linear-gradient(135deg, #ca90c3 0%, #3d83c1 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 16px rgba(49, 112, 171, 0.25)',
              }}
            >
              Empowering MSMEs with <br /> <Box component="span" sx={{ 
                fontWeight: 800,
                background: `linear-gradient(135deg, #3d83c1 0%, #69c4e9 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 16px rgba(202, 144, 195, 0.25)',
              }}>AI Financial Guidance</Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.92)',
                fontWeight: 300,
                mb: 4,
                maxWidth: 600,
                lineHeight: 1.6,
              }}
            >
              FundSight AI simplifies financial planning for micro and small businesses across Malaysia. <br />
              Get tailored insights, budgeting tools, and loan advice—just for your business.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="contained" size="large" sx={{ borderRadius: 3, fontWeight: 700, background: 'linear-gradient(135deg,rgb(218, 185, 250) 0%, #8EC5FC 100%)', fontSize: '1.1rem', px: 4, py: 1.5 }}>Get Started</Button>
              <Button variant="outlined" size="large" sx={{ borderRadius: 3, fontWeight: 700, fontSize: '1.1rem', px: 4, py: 1.5, color: '#8EC5FC', borderColor: '#8EC5FC', background: 'rgba(142,197,252,0.08)', '&:hover': { background: 'rgba(142,197,252,0.15)' } }}>Learn More</Button>
            </Box>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 0 }}>
            <Box sx={{ 
              width: { xs: '100%', sm: '100%', md: '600px' }, 
              height: { xs: '600px', sm: '600px', md: '600px' }, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
            }}>
              <img 
                src="/landing_page.png" 
                alt="Landing page image" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain', 
                  filter: 'drop-shadow(0 0 32px #8EC5FC88)',
                }} 
              />
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Platform Features Heading */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <Typography variant="h4" sx={{ mt: 10, mb: 4, textAlign: 'center', fontWeight: 800, color: '#69c4e9', letterSpacing: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Platform Features
        </Typography>
      </motion.div>

      {/* Feature Cards Section (retain original cards, update style) */}
      <Box sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 4, md: 8 }, py: { xs: 2, md: 4 } }}>
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
          {featureCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              >
                <Box sx={{
                  background: 'rgba(20, 20, 40, 0.92)',
                  borderRadius: '28px',
                  p: 5,
                  height: '100%',
                  backdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(142,197,252,0.10)',
                  boxShadow: '0 8px 32px 0 rgba(142,197,252,0.10)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.03)',
                    background: 'rgba(30, 27, 60, 0.98)',
                    boxShadow: '0 20px 40px rgba(142,197,252,0.18)',
                    border: '1.5px solid #71b2dd',
                  }
                }}>
                  <Box sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    background: 'linear-gradient(135deg,rgb(20, 53, 83) 0%, #71b2dd 100%)',
                    boxShadow: '0 2px 12px rgba(142,197,252,0.10)',
                    '& svg': {
                      fontSize: '38px',
                      color: '#fff',
                    }
                  }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 2, color: '#fff', fontWeight: 700, textAlign: 'center' }}>
                    {card.title}
                  </Typography>
                  <Typography sx={{ mb: 4, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, textAlign: 'center' }}>
                    {card.description}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={card.onClick}
                    sx={{
                      borderRadius: '12px',
                      py: 1.5,
                      px: 3,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 700,
                      background: 'rgba(61, 131, 193, 0.1)',
                      color: '#69c4e9',
                      border: '1.5px solid #69c4e9',
                      boxShadow: '0 2px 12px rgba(61, 131, 193, 0.10)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #3170ab 0%, #69c4e9 100%)',
                        color: '#fff',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(61, 131, 193, 0.25)',
                      }
                    }}
                  >
                    {card.buttonText}
                  </Button>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How it Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <Typography variant="h4" sx={{ mt: 16, mb: 8, textAlign: 'center', fontWeight: 800, color: '#71b2dd', letterSpacing: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}>
          How FundSight AI Works
        </Typography>
      </motion.div>
      <Box sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 4, md: 8 }, py: { xs: 2, md: 4 }, mb: 16 }}>
        <Grid container spacing={6} justifyContent="center">
          {[
            {
              title: 'Connect Your Business Data',
              description: 'Securely link your accounting, banking, and business data sources for real-time insights.'
            },
            {
              title: 'AI-Powered Analysis',
              description: 'Our AI analyzes your financials, spending, and cash flow to provide actionable recommendations.'
            },
            {
              title: 'Personalized Guidance',
              description: 'Get tailored budgeting, loan, and financial advice specific to your business goals and needs.'
            },
            {
              title: 'Grow with Confidence',
              description: 'Make smarter decisions and access financing with confidence, backed by data-driven insights.'
            }
          ].map((step, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: idx * 0.2 }}
              >
                <Box sx={{
                  background: 'rgba(20, 20, 40, 0.92)',
                  borderRadius: '20px',
                  p: 4,
                  height: '100%',
                  backdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(142,197,252,0.10)',
                  boxShadow: '0 8px 32px 0 rgba(142,197,252,0.10)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(30, 27, 60, 0.98)',
                    boxShadow: '0 20px 40px rgba(142,197,252,0.18)',
                    border: '1.5px solid #71b2dd',
                    transform: 'translateY(-8px)',
                  }
                }}>
                  <Typography variant="h6" sx={{ color: '#71b2dd', fontWeight: 700, mb: 2 }}>{step.title}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{step.description}</Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;