import React from 'react';
import { Box } from '@mui/material';
import { LoanRecommendation } from '../../components/types';
import RecommendationForm from './RecommendationForm';
import FundingComparisonTable from './FundingComparisonTable';
import ThinkingProcess from './ThinkingProcess';
import FundingCardSkeleton from './FundingCardSkeleton';

interface LoanRecommendationSectionProps {
  loanPurpose: string;
  loanAmount: string;
  additionalContext: string;
  onLoanPurposeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoanAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdditionalContextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEnabled: boolean;
  isLoading?: boolean;
  isThinking?: boolean;
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
  isLoading = false,
  isThinking = false,
  recommendations,
  onGenerateRecommendations
}) => {
  return (
    <Box>
      <RecommendationForm
        loanPurpose={loanPurpose}
        loanAmount={loanAmount}
        additionalContext={additionalContext}
        onLoanPurposeChange={onLoanPurposeChange}
        onLoanAmountChange={onLoanAmountChange}
        onAdditionalContextChange={onAdditionalContextChange}
        onGenerateRecommendations={onGenerateRecommendations}
        isEnabled={isEnabled}
        isLoading={isLoading || isThinking}
      />

      <ThinkingProcess isVisible={isThinking} />
      
      {isThinking && !recommendations.length && (
        <FundingCardSkeleton count={3} />
      )}

      {recommendations.length > 0 && !isThinking && (
        <FundingComparisonTable recommendations={recommendations} />
      )}
    </Box>
  );
};

export default LoanRecommendationSection; 