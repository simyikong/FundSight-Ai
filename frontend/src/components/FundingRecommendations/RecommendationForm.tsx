import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { LOAN_PURPOSES } from '../../components/types';

interface RecommendationFormProps {
  loanPurpose: string;
  loanAmount: string;
  additionalContext: string;
  onLoanPurposeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoanAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdditionalContextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateRecommendations: () => void;
  isEnabled: boolean;
  isLoading: boolean;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({
  loanPurpose,
  loanAmount,
  additionalContext,
  onLoanPurposeChange,
  onLoanAmountChange,
  onAdditionalContextChange,
  onGenerateRecommendations,
  isEnabled,
  isLoading
}) => {
  return (
    <Box>
      {!isEnabled && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Complete your company profile and upload at least one document to enable funding recommendations.
        </Alert>
      )}
      
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
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <Typography variant="body1" sx={{ mr: 1, color: 'text.secondary' }}>
                RM
              </Typography>
            )
          }}
        />

        <TextField
          fullWidth
          label="Additional Context (Optional)"
          value={additionalContext}
          onChange={onAdditionalContextChange}
          variant="outlined"
          disabled={!isEnabled}
          multiline
          rows={3}
          placeholder="Provide more details about your funding needs, business situation, or specific requirements to help us generate better recommendations."
          helperText="This information helps the AI better understand your specific funding needs"
        />
      </Box>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onGenerateRecommendations}
          disabled={!isEnabled || !loanPurpose || !loanAmount || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AccountBalance />}
          sx={{ minWidth: 200 }}
        >
          {isLoading ? 'Analyzing...' : 'Get Funding Recommendations'}
        </Button>
      </Box>
    </Box>
  );
};

export default RecommendationForm; 