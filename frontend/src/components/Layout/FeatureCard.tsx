import React, { ReactNode } from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  buttonColor?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  iconBgColor: string;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  buttonText,
  buttonLink,
  buttonColor = 'primary',
  iconBgColor,
  onClick
}) => {
  return (
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
            bgcolor: iconBgColor,
            color: 'white',
            mb: 2
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {description}
        </Typography>
        <Button 
          component={buttonLink ? Link : 'button'}
          to={buttonLink}
          variant="outlined" 
          color={buttonColor}
          onClick={onClick}
          sx={{ mt: 2 }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureCard; 