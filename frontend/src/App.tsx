import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Button, Box, Container, Drawer, IconButton, Grid, Stack } from '@mui/material';
import { theme } from './theme';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Loan from './pages/Loan';
import Chatbot from './components/Chatbot/Chatbot';
import Dashboard from './pages/Dashboard';
import Profile_Apply from './pages/Profile_Apply';
import FinancialRecords from './pages/FinancialRecords';

/**
 * Main App component.
 * Handles app-wide state and renders the main application structure.
 */
function App() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(350);

  // Event handlers
  const handleChatbotOpen = () => setChatbotOpen(true);
  const handleChatbotClose = () => setChatbotOpen(false);

  // Handle drawer resize functionality
  const handleDrawerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startWidth = drawerWidth;
    const doDrag = (e: MouseEvent) => {
      const newWidth = startWidth - (e.clientX - startX);
      setDrawerWidth(Math.max(350, Math.min(newWidth, 500)));
    };
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <AppBar 
            position="fixed" 
            sx={{ 
              width: chatbotOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
              transition: 'width 0.3s ease',
              mr: chatbotOpen ? `${drawerWidth}px` : 0,
              minHeight: 72,
              background: 'rgba(6, 4, 25, 0.95)',
              boxShadow: '0px 2px 20px 0px rgba(49, 28, 131, 0.1)',
            }}
          >
            <Toolbar sx={{ 
              minHeight: 72, 
              display: 'flex', 
              alignItems: 'center',
              px: 4,
              position: 'relative',
              justifyContent: 'space-between',
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                minWidth: 0,
                position: 'relative',
                zIndex: 2,
              }}>
                <Typography
                  variant="h5"
                  component={Link}
                  to="/"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 1,
                    textDecoration: 'none',
                    fontFamily: 'Inter, "Roboto", "Helvetica", sans-serif',
                    mr: 4,
                    pl: 4,
                    background: '#ffffff',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                    whiteSpace: 'nowrap',
                  }}
                >
                  FundSight AI
                </Typography>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                position: 'absolute',
                left: '50%',
                transition: 'all 0.3s ease',
                transform: 'translateX(-50%)',
              }}>
                <Button
                  color="inherit"
                  component={Link}
                  to="/dashboard"
                  sx={{
                    fontWeight: 500,
                    fontSize: '1rem',
                    px: 2,
                    minHeight: 36,
                    background: 'transparent',
                    boxShadow: 'none',
                    borderRadius: '20px',
                    ml: 0,
                    mr: 1,
                    textAlign: 'left',
                    color: '#FFFFFF',
                    border: '1.5px solid transparent',
                    '&:hover': {
                      background: 'rgba(142,197,252,0.08)',
                      border: '1.5px solid #8EC5FC',
                      color: '#fff',
                    },
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/loan"
                  sx={{
                    fontWeight: 500,
                    fontSize: '1rem',
                    px: 2,
                    minHeight: 36,
                    background: 'transparent',
                    boxShadow: 'none',
                    borderRadius: '20px',
                    ml: 0,
                    mr: 1,
                    textAlign: 'left',
                    color: '#FFFFFF',
                    border: '1.5px solid transparent',
                    '&:hover': {
                      background: 'rgba(142,197,252,0.08)',
                      border: '1.5px solid #8EC5FC',
                      color: '#fff',
                    },
                  }}
                >
                  Loan
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/profile"
                  sx={{
                    fontWeight: 500,
                    fontSize: '1rem',
                    px: 2,
                    minHeight: 36,
                    background: 'transparent',
                    boxShadow: 'none',
                    borderRadius: '20px',
                    ml: 0,
                    mr: 1,
                    textAlign: 'left',
                    color: '#FFFFFF',
                    border: '1.5px solid transparent',
                    '&:hover': {
                      background: 'rgba(142,197,252,0.08)',
                      border: '1.5px solid #8EC5FC',
                      color: '#fff',
                    },
                  }}
                >
                  Profile
                </Button>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                minWidth: 'fit-content',
                opacity: chatbotOpen ? 0 : 1,
                visibility: chatbotOpen ? 'hidden' : 'visible',
                transition: 'opacity 0.3s ease, visibility 0.3s ease',
              }}>
                <Button
                  variant="contained"
                  onClick={handleChatbotOpen}
                  sx={{
                    display: chatbotOpen ? 'none' : 'inline-flex', // Hide button when chatbot is open
                    fontWeight: 600,
                    borderRadius: '28px',
                    background: '#13111C',
                    position: 'relative',
                    border: 'none',
                    ml: 2,
                    mt: 1.5,
                    mb: 1.5,
                    mr: 4,
                    px: 3,
                    py: 1,
                    fontSize: '1rem',
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '& .buttonText': {
                      background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    },
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '30px',
                      padding: '2px',
                      background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
                      transform: 'translateY(-1px)',
                      '&:before': {
                        opacity: 0,
                      },
                      boxShadow: '0 4px 20px rgba(224, 195, 252, 0.3)',
                      '& .buttonText': {
                        background: '#13111C',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      },
                    },
                  }}
                >
                  <span className="buttonText">Ask AI Assistant</span>
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1,
              width: chatbotOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
              transition: 'width 0.3s ease, margin 0.3s ease',
              mt: 9,
              overflow: 'hidden',
              mr: chatbotOpen ? `${drawerWidth}px` : 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              p: 0, // Remove padding
            }}
          >
            <Container maxWidth="lg" sx={{ flex: 1, px: 3, py: 0 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/financial-records" element={<FinancialRecords />} />
                <Route path="/profile_apply" element={<Profile_Apply />} />
              </Routes>
            </Container>
            
            {/* Footer */}
            <Box
              component="footer"
              sx={{
                width: '100%',
                background: 'rgba(6, 4, 25, 0.95)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                mt: 'auto',
                py: 6,
                position: 'relative',
                left: 0,
                right: 0,
              }}
            >
              <Container maxWidth="lg">
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ mb: { xs: 3, md: 0 } }}>
                        <Typography
                          variant="h6"
                          component={Link}
                          to="/"
                          sx={{
                            fontWeight: 700,
                            letterSpacing: 1,
                            textDecoration: 'none',
                            mb: 2,
                            display: 'block',
                            background: '#ffffff',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          FundSight AI
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 300 }}>
                          Your AI-powered financial advisor for MSMEs. Making financial planning and loan access easier for Malaysian businesses.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="subtitle1" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                        Platform
                      </Typography>
                      <Stack spacing={1}>
                        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#8EC5FC' } }}>
                            Dashboard
                          </Typography>
                        </Link>
                        <Link to="/loan" style={{ textDecoration: 'none' }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#8EC5FC' } }}>
                            Loan
                          </Typography>
                        </Link>
                        <Link to="/profile" style={{ textDecoration: 'none' }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#8EC5FC' } }}>
                            Profile
                          </Typography>
                        </Link>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="subtitle1" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                        Legal
                      </Typography>
                      <Stack spacing={1}>
                        <Link to="/terms" style={{ textDecoration: 'none' }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#8EC5FC' } }}>
                            Terms of Service
                          </Typography>
                        </Link>
                        <Link to="/privacy" style={{ textDecoration: 'none' }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#8EC5FC' } }}>
                            Privacy Policy
                          </Typography>
                        </Link>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                        Contact Us
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                        Have questions? Reach out to our support team.
                      </Typography>
                    </Grid>
                  </Grid>
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                    © {new Date().getFullYear()} FundSight AI. All rights reserved.
                  </Typography>
                </Box>
              </Container>
            </Box>
          </Box>
          <Drawer 
            variant="persistent"
            anchor="right"
            open={chatbotOpen}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              position: 'fixed',
              right: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                border: 'none',
                boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
                position: 'fixed',
                height: '100vh',
                background: 'rgba(30, 27, 60, 0.95)',
              },
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
              onMouseDown={handleMouseDown}
            />
            <Chatbot onClose={handleChatbotClose} />
          </Drawer>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;