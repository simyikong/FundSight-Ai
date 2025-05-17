import React, { useState, useEffect } from 'react';
import {
  Typography,
  Divider,
  Paper,
  Container,
  Box,
  Grid,
  Button,
  CircularProgress,
  useTheme
} from '@mui/material';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  LoanRecommendationSection,
  ProfileCompletionCheck
} from '../components/FundingRecommendations';
import { useLocation } from 'react-router-dom';
import { LoadingState, ErrorState } from '../components/common/ui';
import FundingOptionCard from '../components/FundingRecommendations/FundingOptionCard';
import { LoanRecommendation } from '../components/types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const FundingRecommendations: React.FC = () => {
  // Loan recommendation state
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [recommendations, setRecommendations] = useState<LoanRecommendation[]>([]);
  const [isRecommendationEnabled, setIsRecommendationEnabled] = useState(false);
  
  // Profile status state
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const location = useLocation();

  // Handle loan data from chatbot
  useEffect(() => {
    const loanData = location.state?.loanData;
    console.log('Location state:', location.state);
    console.log('Loan data from location:', loanData);
    
    if (loanData) {
      console.log('Processing loan data:', loanData);
      
      // Handle funding purpose
      if (loanData.funding_purpose) {
        const purpose = loanData.funding_purpose.toLowerCase();
        console.log('Setting loan purpose to:', purpose);
        setLoanPurpose(purpose);
      }
      
      // Handle requested amount
      if (loanData.requested_amount) {
        const amount = loanData.requested_amount.toString();
        console.log('Setting loan amount to:', amount);
        setLoanAmount(amount);
      }
      
      // Enable recommendations
      console.log('Enabling recommendations');
      setIsRecommendationEnabled(true);
      
      // Generate recommendations automatically when loan data is received
      // generateRecommendations();
    }
  }, [location.state]);

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

  const fetchRecommendations = () => {
    setLoading(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      // Sample data - this would come from your API
      const sampleRecommendations: LoanRecommendation[] = [
        {
          id: 1,
          name: 'SME Working Capital Loan',
          provider: 'Bank Negara Malaysia',
          amount: 'Up to RM500,000',
          interestRate: '4.00% - 7.00% p.a.',
          eligibilitySummary: 'Malaysian SMEs with minimum 2 years of operation',
          applicationUrl: 'https://www.bnm.gov.my/sme-financing',
          objective: 'To assist Malaysian SMEs in meeting their working capital requirements and daily operational expenditure.',
          coverage: 'Working capital, operational expenditures, and business growth.',
          eligibilityRequirements: [
            'Business must be registered in Malaysia with minimum 51% Malaysian ownership',
            'Business must have been in operation for at least 2 years',
            'Annual sales turnover not exceeding RM50 million OR full-time employees not exceeding 200 workers',
            'Able to provide latest 6 months bank statements and latest 2 years financial statements'
          ],
          financingAmount: [
            'Minimum: RM50,000',
            'Maximum: RM500,000'
          ],
          tenure: 'Up to 7 years',
          financingRate: [
            'For Bumiputera SMEs: 4.00% p.a.',
            'For other SMEs: 5.00% - 7.00% p.a.'
          ],
          reasons: [
            'Your business has been operating for 3 years, meeting the minimum requirement',
            'Based on your profile, you qualify as an SME under Bank Negara guidelines',
            'Your financial statements indicate a need for working capital'
          ]
        },
        {
          id: 2,
          name: 'Industry Digitalization Grant',
          provider: 'MDEC',
          amount: 'Up to RM200,000',
          interestRate: '0% (Grant)',
          eligibilitySummary: 'Tech SMEs focusing on digital transformation',
          applicationUrl: 'https://mdec.my/digital-economy-initiatives',
          objective: 'To accelerate digitalization among SMEs in Malaysia, enhancing productivity and business sustainability.',
          coverage: 'Digital transformation projects, technology adoption, and skills development.',
          eligibilityRequirements: [
            'SME with minimum 60% Malaysian shareholding',
            'In operation for at least 1 year with proper business registration',
            'Annual sales turnover between RM300,000 and RM50 million',
            'Project must demonstrate clear digital adoption objectives',
            'Must not have received similar grant from other government agencies'
          ],
          financingAmount: [
            'Tier 1 (Basic Digitalization): Up to RM50,000',
            'Tier 2 (Comprehensive Digital Transformation): Up to RM200,000'
          ],
          tenure: 'One-time grant with 12 months implementation period',
          financingRate: [
            '50% matching grant (you cover 50%, grant covers 50%)',
            'Reimbursement basis upon completion of specific milestones'
          ],
          reasons: [
            'Your business qualifies as an SME under MDEC guidelines',
            'Based on your financial data, you meet the minimum annual sales requirement',
            'Your industry sector is prioritized under the current grant cycle'
          ]
        },
        {
          id: 3,
          name: 'Business Expansion Loan',
          provider: 'SME Bank',
          amount: 'RM250,000 - RM1,000,000',
          interestRate: '4.75% - 6.50% p.a.',
          eligibilitySummary: 'Growing SMEs looking to expand operations',
          applicationUrl: 'https://www.smebank.com.my/en/business-financing',
          objective: 'To finance business expansion activities for established SMEs with proven track record.',
          coverage: 'Purchase of machinery/equipment, factory/office renovation, facility expansion, and market expansion.',
          eligibilityRequirements: [
            'Malaysian-owned business (at least 51% Malaysian shareholding)',
            'Business in operation for minimum 3 years',
            'Profitable for at least 2 of the last 3 years',
            'No adverse records with CTOS, CCRIS or any financial institution',
            'Debt Service Coverage Ratio (DSCR) of at least 1.5x'
          ],
          financingAmount: [
            'Minimum: RM250,000',
            'Maximum: RM1,000,000',
            'Up to 80% of total project cost'
          ],
          tenure: '5 to 7 years',
          financingRate: [
            'Base Rate + 1.00% to 2.75% p.a.',
            'Effective rate: 4.75% - 6.50% p.a.'
          ],
          reasons: [
            'Your business has shown consistent growth for the past 3 years',
            'Your debt-to-equity ratio meets the bank\'s requirements',
            'Your financial projections demonstrate ability to service the loan'
          ]
        }
      ];
      
      console.log('Setting recommendations:', sampleRecommendations);
      setRecommendations(sampleRecommendations);
      setLoading(false);
    }, 1500); // 1.5 second delay to simulate API call
  };

  const handleCompanyProfileClick = () => {
    window.location.href = '/company-profile';
  };

  if (loading) {
    return (
      <LoadingState 
        title="Funding Recommendations" 
        subtitle="Checking profile status..." 
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Funding Recommendations"
        subtitle="Error checking profile"
        errorMessage={error}
        buttonText="Go to Company Profile"
        onButtonClick={handleCompanyProfileClick}
      />
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
          <ProfileCompletionCheck 
            missingFields={missingFields}
            onCompleteProfileClick={handleCompanyProfileClick}
          />
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
            onGenerateRecommendations={fetchRecommendations}
          />
        )}
      </Paper>
    </Layout>
  );
};

export default FundingRecommendations; 