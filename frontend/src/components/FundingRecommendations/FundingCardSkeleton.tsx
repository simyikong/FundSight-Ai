import React from 'react';
import { 
  Box, 
  Card, 
  Skeleton, 
  Grid,
  useTheme,
  styled,
  CardHeader,
  Divider
} from '@mui/material';

const SkeletonCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.10)',
  overflow: 'hidden',
  position: 'relative'
}));

const SkeletonHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  background: 'linear-gradient(145deg, rgba(66, 66, 120, 0.08) 0%, rgba(28, 28, 50, 0.15) 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}));

const SkeletonSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
}));

interface FundingCardSkeletonProps {
  count?: number;
}

const FundingCardSkeleton: React.FC<FundingCardSkeletonProps> = ({ count = 3 }) => {
  const theme = useTheme();
  
  // Create pulsing animation
  const pulseAnimation = {
    animation: 'pulse 1.5s ease-in-out 0.5s infinite',
    '@keyframes pulse': {
      '0%': {
        opacity: 1,
      },
      '50%': {
        opacity: 0.5,
      },
      '100%': {
        opacity: 1,
      },
    },
  };

  const renderSkeletonCard = () => (
    <SkeletonCard sx={{ ...pulseAnimation }}>
      {/* Header */}
      <SkeletonHeader>
        <Skeleton variant="rectangular" width="70%" height={28} sx={{ mb: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="50%" height={20} sx={{ borderRadius: 1 }} />
      </SkeletonHeader>
      
      {/* Button Container */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={40} 
          sx={{ borderRadius: theme.shape.borderRadius * 3 }} 
        />
      </Box>
      
      {/* Sections */}
      {[...Array(5)].map((_, index) => (
        <SkeletonSection key={index} sx={{ backgroundColor: index % 2 ? 'transparent' : 'rgba(0, 0, 0, 0.02)' }}>
          <Skeleton variant="rectangular" width="40%" height={24} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="90%" height={20} sx={{ borderRadius: 1 }} />
          {index === 3 && (
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 1, borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="70%" height={20} sx={{ mt: 1, borderRadius: 1 }} />
            </Box>
          )}
        </SkeletonSection>
      ))}
    </SkeletonCard>
  );

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Skeleton variant="rectangular" width="30%" height={30} sx={{ mb: 3, borderRadius: 1 }} />
      <Grid container spacing={3}>
        {[...Array(count)].map((_, index) => (
          <Grid item xs={12} md={12 / count} key={index}>
            {renderSkeletonCard()}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FundingCardSkeleton; 