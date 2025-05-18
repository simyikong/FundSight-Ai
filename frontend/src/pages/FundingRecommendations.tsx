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
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import RestoreIcon from '@mui/icons-material/Restore';
import CloseIcon from '@mui/icons-material/Close';
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

interface RecommendationHistory {
  id: number;
  funding_purpose: string;
  requested_amount: number;
  additional_context?: string;
  created_at: string;
  recommendations?: LoanRecommendation[];
}

const FundingRecommendations: React.FC = () => {
  // Loan recommendation state
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [recommendations, setRecommendations] = useState<LoanRecommendation[]>([]);
  const [isRecommendationEnabled, setIsRecommendationEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  // History state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recommendationHistory, setRecommendationHistory] = useState<RecommendationHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Profile status state
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);

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
      if (loanData.suggest_loan) {
        setTimeout(() => fetchRecommendations(), 500); // Add delay to ensure state is updated
      }
    }
  }, [location.state]);

  // Automatically fetch recommendations when component mounts if we have default values
  useEffect(() => {
    // If we have default values and no recommendations yet, fetch them
    if (loanPurpose && loanAmount && recommendations.length === 0 && !isGenerating) {
      console.log("Using default values to fetch recommendations");
      setTimeout(() => fetchRecommendations(), 1000);
    }
  }, [companyId]); // Only run when companyId is available

  // Check if user has completed their profile using the API
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/company/status`);
        
        setHasCompletedProfile(response.data.isComplete);
        setMissingFields(response.data.missingFields || []);
        setIsRecommendationEnabled(response.data.isComplete);
        setCompanyId(response.data.companyId || 1); // Default to 1 for testing if not available
        setLoading(false);
        
        // If profile is complete, try to fetch existing recommendations
        if (response.data.isComplete && response.data.companyId) {
          fetchExistingRecommendations(response.data.companyId);
        }
      } catch (err) {
        console.error('Error checking profile status:', err);
        setError('Could not check profile completion status');
        setLoading(false);
      }
    };
    
    checkProfileStatus();
  }, []);

  // Fetch existing recommendations for the company
  const fetchExistingRecommendations = async (companyId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/funding/recommendations/${companyId}`);
      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
        setLoanPurpose(response.data.funding_purpose || '');
        setLoanAmount(response.data.requested_amount?.toString() || '');
        setAdditionalContext(response.data.additional_context || '');
      }
    } catch (err) {
      console.log('No existing recommendations found or error fetching them');
      // This is not a critical error, so we don't set the error state
    }
  };

  // Fetch recommendations with simulated thinking process
  const fetchRecommendations = async () => {
    if (!companyId) {
      setError('Company profile not found');
      return;
    }

    // Always use the current state values
    const currentLoanPurpose = loanPurpose || 'Working Capital';
    const currentLoanAmount = loanAmount || '50000';

    // Start the thinking process
    setIsThinking(true);
    setIsGenerating(true);
    setError(null);

    // Clear previous recommendations to show the thinking process
    if (recommendations.length > 0) {
      setRecommendations([]);
    }
    
    try {
      console.log(`Fetching recommendations with purpose: ${currentLoanPurpose}, amount: ${currentLoanAmount}`);
      
      // Simulate thinking for demo purposes - total time about 9 seconds
      const thinkingTime = 9000;
      
      // Make the actual API call
      const response = await axios.post(`${API_BASE_URL}/funding/recommendations`, {
        company_id: companyId,
        funding_purpose: currentLoanPurpose,
        requested_amount: parseFloat(currentLoanAmount),
        additional_context: additionalContext || undefined
      });
      
      // Continue showing thinking process even after API returns
      // This ensures we show all stages of the thinking visualization
      setTimeout(() => {
        if (response.data && response.data.recommendations) {
          console.log(`Received ${response.data.recommendations.length} recommendations`);
          
          // Finally set recommendations and end thinking
          setRecommendations(response.data.recommendations);
          setIsThinking(false);
          setIsGenerating(false);
        } else {
          setError('Received an invalid response from the server');
          setIsThinking(false);
          setIsGenerating(false);
        }
      }, thinkingTime);
      
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.detail || 'Failed to generate recommendations');
      setIsThinking(false);
      setIsGenerating(false);
    }
  };

  const fetchRecommendationHistory = async () => {
    if (!companyId) return;
    
    setIsLoadingHistory(true);
    try {
      // Call the history API endpoint
      const response = await axios.get(`${API_BASE_URL}/funding/history/${companyId}`);
      setRecommendationHistory(response.data || []);
    } catch (err) {
      console.error('Error fetching recommendation history:', err);
      setRecommendationHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleHistoryOpen = () => {
    setHistoryOpen(true);
    fetchRecommendationHistory();
  };

  const handleHistoryClose = () => {
    setHistoryOpen(false);
  };

  const restoreRecommendation = (item: RecommendationHistory) => {
    setLoanPurpose(item.funding_purpose);
    setLoanAmount(item.requested_amount.toString());
    setAdditionalContext(item.additional_context || '');
    
    // If recommendations are included in history, use them directly
    if (item.recommendations && item.recommendations.length > 0) {
      setRecommendations(item.recommendations);
    } else {
      // Otherwise fetch recommendations
      setTimeout(() => {
        fetchRecommendations();
      }, 100);
    }
    
    setHistoryOpen(false);
  };

  const handleCompanyProfileClick = () => {
    window.location.href = '/company-profile';
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Funding Options</Typography>
          {hasCompletedProfile && (
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={handleHistoryOpen}
              size="small"
            >
              History
            </Button>
          )}
        </Box>
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
            isLoading={isGenerating}
            isThinking={isThinking}
            recommendations={recommendations}
            onGenerateRecommendations={fetchRecommendations}
          />
        )}
      </Paper>

      {/* History Dialog */}
      <Dialog 
        open={historyOpen} 
        onClose={handleHistoryClose} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Recommendation History</Typography>
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={handleHistoryClose} 
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {isLoadingHistory ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : recommendationHistory.length > 0 ? (
            <List>
              {recommendationHistory.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {item.funding_purpose} - RM{item.requested_amount.toLocaleString()}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {item.additional_context || "No additional context"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(item.created_at)}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="restore"
                      onClick={() => restoreRecommendation(item)}
                      title="Restore these inputs"
                    >
                      <RestoreIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box py={2} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                No recommendation history available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHistoryClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default FundingRecommendations; 
