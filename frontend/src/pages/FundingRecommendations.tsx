import React, { useState, useEffect } from 'react';
import {
  Typography,
  Divider,
  Paper,
  Button,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import axios from 'axios';
import Layout from '../components/Layout';
import { LoanRecommendationSection } from '../components/FundingRecommendations';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const FundingRecommendations: React.FC = () => {
  // Loan recommendation state
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRecommendationEnabled, setIsRecommendationEnabled] = useState(false);
  
  // Profile status state
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has completed their profile using the API
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/company/status`);
        
        setHasCompletedProfile(response.data.isComplete);
        setMissingFields(response.data.missingFields || []);
        setIsRecommendationEnabled(response.data.isComplete);
        setLoading(false);
      } catch (err) {
        console.error('Error checking profile status:', err);
        setError('Could not check profile completion status');
        setLoading(false);
      }
    };
    
    checkProfileStatus();
  }, []);

  // Generate funding recommendations
  const generateRecommendations = () => {
    // Simulate API call to get recommendations
    setRecommendations([]);
    
    // TODO: Replace with actual API call to the backend, passing user context
    // The additionalContext would be sent to the backend to help generate better
    // personalized recommendations based on the user's specific situation
    console.log('Additional context provided:', additionalContext);
    
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

  if (loading) {
    return (
      <Layout
        title="Funding Recommendations"
        subtitle="Checking profile status..."
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Funding Recommendations"
        subtitle="Error checking profile"
      >
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCompanyProfileClick}
          sx={{ mt: 2 }}
        >
          Go to Company Profile
        </Button>
      </Layout>
    );
  }

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
              To get personalized funding recommendations, you need to complete your company profile with the following required fields:
            </Typography>
            
            {missingFields.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Missing information:</Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </Alert>
            )}
            
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
            additionalContext={additionalContext}
            onLoanPurposeChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanPurpose(e.target.value)}
            onLoanAmountChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
            onAdditionalContextChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdditionalContext(e.target.value)}
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