import React, { useState, useEffect } from 'react';
import {
  Typography,
  Divider,
  Paper,
  Button
} from '@mui/material';
import Layout from '../components/Layout';
import { LoanRecommendationSection } from '../components/FundingRecommendations';

const FundingRecommendations: React.FC = () => {
  // Loan recommendation state
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRecommendationEnabled, setIsRecommendationEnabled] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  // Simulate checking if user has completed their profile
  useEffect(() => {
    // In a real application, you would check with the backend if the user
    // has completed their profile and uploaded required documents
    const checkProfileStatus = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll assume they have a completed profile
      setHasCompletedProfile(true);
      setIsRecommendationEnabled(true);
    };
    
    checkProfileStatus();
  }, []);

  // Generate funding recommendations
  const generateRecommendations = () => {
    // Simulate API call to get recommendations
    setTimeout(() => {
      const sampleRecommendations = [
        {
          id: 1,
          name: 'SME Working Capital Loan',
          provider: 'Bank Negara',
          amount: 'RM 100,000 - RM 500,000',
          interestRate: '3.5% - 5.0%',
          eligibilitySummary: 'Based on your P&L statements and registration documents, your business qualifies for this loan option.',
          reasons: ['Revenue exceeds minimum threshold', 'Operational for more than 2 years', 'Good profit margin']
        },
        {
          id: 2,
          name: 'Industry Digitalization Grant',
          provider: 'MDEC',
          amount: 'Up to RM 200,000',
          interestRate: 'Not applicable (Grant)',
          eligibilitySummary: 'Your F&B business qualifies for digitalization support under this grant program.',
          reasons: ['SME in targeted industry sector', 'Meets employment size requirements']
        },
        {
          id: 3,
          name: 'Business Expansion Loan',
          provider: 'SME Bank',
          amount: 'RM 50,000 - RM 300,000',
          interestRate: '4.0% - 6.0%',
          eligibilitySummary: 'Your business profile and financial history make you eligible for expansion financing.',
          reasons: ['Consistent revenue growth', 'Strong cash flow position', 'Good credit history']
        }
      ];
      
      setRecommendations(sampleRecommendations);
    }, 1500);
  };

  const handleCompanyProfileClick = () => {
    window.location.href = '/company-profile';
  };

  return (
    <Layout
      title="Funding Recommendations"
      subtitle="Discover personalized funding options for your business"
    >
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>Funding Options</Typography>
        <Divider sx={{ mb: 3 }} />
        
        {!hasCompletedProfile ? (
          <div>
            <Typography variant="body1" paragraph>
              To get personalized funding recommendations, you need to complete your company profile and upload the required documents.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCompanyProfileClick}
            >
              Complete Your Profile
            </Button>
          </div>
        ) : (
          <LoanRecommendationSection 
            loanPurpose={loanPurpose}
            loanAmount={loanAmount}
            onLoanPurposeChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanPurpose(e.target.value)}
            onLoanAmountChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
            isEnabled={isRecommendationEnabled}
            recommendations={recommendations}
            onGenerateRecommendations={generateRecommendations}
          />
        )}
      </Paper>
    </Layout>
  );
};

export default FundingRecommendations; 