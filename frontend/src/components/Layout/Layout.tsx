import React, { ReactNode } from 'react';
import { Box, Paper, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100%',
        py: 3
      }}
    >
      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ mb: 3 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link 
            component={RouterLink} 
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;

            return last ? (
              <Typography color="text.primary" key={to} sx={{ fontWeight: 500 }}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Typography>
            ) : (
              <Link
                component={RouterLink}
                to={to}
                key={to}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Link>
            );
          })}
        </Breadcrumbs>

        {/* Page Title and Subtitle */}
        {(title || subtitle) && (
          <Box sx={{ mb: 4 }}>
            {title && (
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography 
                variant="body1" 
                color="text.secondary"
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
      </Container>

      {/* Main Content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column'
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 2,
            height: '100%',
            border: theme => `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.default'
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default Layout; 