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
  borderRadius: '20px',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1.5px solid #8EC5FC',
    transform: 'translateY(-2px)',
    borderRadius: '20px',
  },
};

// Navigation items configuration
const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/funding-recommendations', label: 'Funding' },
  { path: '/financial-records', label: 'Financial Records' },
  { path: '/company-profile', label: 'Company Profile' },
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