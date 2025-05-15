import React from 'react';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface FooterProps {
    handleChatbotOpen: () => void;
    chatbotOpen: boolean;
    drawerWidth: number;
}

const Footer: React.FC<FooterProps> = ({ handleChatbotOpen, chatbotOpen, drawerWidth }) => {
    return (
        <Box
            component="footer"
            sx={{
                width: chatbotOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
                background: 'rgba(6, 4, 25, 0.95)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                py: { xs: 4, md: 6 },
                px: { xs: 2, md: 4 },
                position: 'relative',
                transition: 'margin 0.3s ease',
                marginRight: chatbotOpen ? `${drawerWidth}px` : 0,  // Adjust margin instead of width
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
    );
};

export default Footer;