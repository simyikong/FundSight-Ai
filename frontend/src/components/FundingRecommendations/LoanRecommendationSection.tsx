import React, { useState } from 'react';
import { Box } from '@mui/material';
import { LoanRecommendation } from '../../components/types';
import RecommendationForm from './RecommendationForm';
import FundingComparisonTable from './FundingComparisonTable';

interface LoanRecommendationSectionProps {
  loanPurpose: string;
  loanAmount: string;
  additionalContext: string;
  onLoanPurposeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoanAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdditionalContextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEnabled: boolean;
  recommendations: LoanRecommendation[];
  onGenerateRecommendations: () => void;
}

const LoanRecommendationSection: React.FC<LoanRecommendationSectionProps> = ({
  loanPurpose,
  loanAmount,
  additionalContext,
  onLoanPurposeChange,
  onLoanAmountChange,
  onAdditionalContextChange,
  isEnabled,
  recommendations,
  onGenerateRecommendations
}) => {
  const [loading, setLoading] = useState(false);

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
      <RecommendationForm
        loanPurpose={loanPurpose}
        loanAmount={loanAmount}
        additionalContext={additionalContext}
        onLoanPurposeChange={onLoanPurposeChange}
        onLoanAmountChange={onLoanAmountChange}
        onAdditionalContextChange={onAdditionalContextChange}
        onGenerateRecommendations={handleGenerateRecommendations}
        isEnabled={isEnabled}
        isLoading={loading}
      />

      {recommendations.length > 0 && (
        <FundingComparisonTable recommendations={recommendations} />
      )}
    </Box>
  );
};

export default LoanRecommendationSection; 