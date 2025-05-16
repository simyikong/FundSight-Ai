import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { AccountBalance, CheckCircle, InfoOutlined } from '@mui/icons-material';
import { LoanRecommendation, LOAN_PURPOSES } from '../../components/types';

interface LoanRecommendationSectionProps {
  loanPurpose: string;
  loanAmount: string;
  onLoanPurposeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoanAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEnabled: boolean;
  recommendations: LoanRecommendation[];
  onGenerateRecommendations: () => void;
}

const LoanRecommendationSection: React.FC<LoanRecommendationSectionProps> = ({
  loanPurpose,
  loanAmount,
  onLoanPurposeChange,
  onLoanAmountChange,
  isEnabled,
  recommendations,
  onGenerateRecommendations
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleGenerateRecommendations = () => {
    setLoading(true);
    onGenerateRecommendations();
    
    // Simulate loading state for a better UX
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <Box>
      {!isEnabled ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Complete your company profile and upload at least one document to enable funding recommendations.
        </Alert>
      ) : null}
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          select
          label="Funding Purpose"
          value={loanPurpose}
          onChange={onLoanPurposeChange}
          variant="outlined"
          disabled={!isEnabled}
          sx={{ mb: 2 }}
        >
          <MenuItem value="">
            <em>Select funding purpose</em>
          </MenuItem>
          {LOAN_PURPOSES.map((option) => (
            <MenuItem key={option} value={option.toLowerCase()}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Requested Amount (RM)"
          value={loanAmount}
          onChange={onLoanAmountChange}
          variant="outlined"
          type="number"
          disabled={!isEnabled}
          placeholder="e.g., 50000"
          InputProps={{
            startAdornment: (
              <Typography variant="body1" sx={{ mr: 1, color: 'text.secondary' }}>
                RM
              </Typography>
            )
          }}
        />
      </Box>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleGenerateRecommendations}
          disabled={!isEnabled || !loanPurpose || !loanAmount || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AccountBalance />}
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Analyzing...' : 'Get Funding Recommendations'}
        </Button>
      </Box>

      {recommendations.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="success" sx={{ mr: 1 }} />
            Recommended Funding Options
          </Typography>
          
          <List>
            {recommendations.map((rec) => (
              <Paper
                key={rec.id}
                elevation={0}
                sx={{ 
                  mb: 3, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {rec.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Provider: {rec.provider}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Amount:
                      </Typography>
                      <Typography variant="body1">
                        {rec.amount}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Interest Rate:
                      </Typography>
                      <Typography variant="body1">
                        {rec.interestRate}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider />
                
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <InfoOutlined fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    {rec.eligibilitySummary}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Why you qualify:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {rec.reasons.map((reason: string, idx: number) => (
                      <Chip
                        key={idx}
                        label={reason}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: 'background.default', textAlign: 'right' }}>
                  <Button variant="contained" size="small">
                    Apply Now
                  </Button>
                </Box>
              </Paper>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default LoanRecommendationSection; 