import React from 'react';
import {
  Box,
  Typography,
  Grid,
  useTheme
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { LoanRecommendation } from '../../components/types';
import FundingOptionCard from './FundingOptionCard';

interface FundingComparisonTableProps {
  recommendations: LoanRecommendation[];
}

const FundingComparisonTable: React.FC<FundingComparisonTableProps> = ({ recommendations }) => {
  const theme = useTheme();
  
  // Limit display to top 3 recommendations
  const displayRecommendations = recommendations.slice(0, 3);

  // This ensures we always have enough space for comparison
  const columnWidth = 12 / Math.min(3, displayRecommendations.length);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 4,
        fontWeight: 600
      }}>
        <CheckCircle color="success" sx={{ mr: 1 }} />
        Compare Funding Options
      </Typography>
      
      <Grid container spacing={3}>
        {displayRecommendations.map((recommendation) => (
          <Grid item xs={12} md={columnWidth} key={recommendation.id}>
            <FundingOptionCard recommendation={recommendation} />
          </Grid>
        ))}
      </Grid>

      {recommendations.length > 3 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          Showing top 3 recommended options. Contact us for more funding opportunities.
        </Typography>
      )}
    </Box>
  );
};

export default FundingComparisonTable; 