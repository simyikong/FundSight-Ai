import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';

// Navigation item configuration type
interface NavItem {
  path: string;
  label: string;
}

// Common button style
const navButtonStyle = {
  fontWeight: 500,
  fontSize: '1rem',
  px: 2,
  transition: 'all 0.2s',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)',
  },
};

// Navigation items configuration
const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/financial-records', label: 'Financial Records' },
  { path: '/profile_apply', label: 'Profile & Apply' }
];

/**
 * NavButton component for individual navigation buttons
 */
const NavButton: React.FC<{ item: NavItem; onClick: (path: string) => void }> = ({ item, onClick }) => (
  <Button
    color="inherit"
    onClick={() => onClick(item.path)}
    sx={navButtonStyle}
  >
    {item.label}
  </Button>
);

/**
 * NavigationBar component provides the main navigation links for the application.
 * It uses the useNavigate hook from react-router-dom for client-side navigation.
 */
const NavigationBar = () => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      {navItems.map((item) => (
        <NavButton key={item.path} item={item} onClick={navigate} />
      ))}
    </Box>
  );
};

export default NavigationBar; 