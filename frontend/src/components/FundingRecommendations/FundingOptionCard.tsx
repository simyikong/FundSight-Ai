import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
  Stack,
  styled,
  useTheme,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  ArrowForward, 
  Check, 
  ExpandMore, 
  AttachMoney, 
  Schedule,
  Description,
  SupportAgent,
  ExpandLess,
  Launch,
  CheckCircle,
  ThumbUp
} from '@mui/icons-material';
import { LoanRecommendation } from '../../components/types';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Constants for section heights to ensure alignment
const SECTION_HEIGHTS = {
  header: 140,
  applyButton: 150,
  objective: 400,
  coverage: 400,
  financingAmount: 400,
  interestRate: 300,
  tenure: 240,
  eligibility: 1000,
  qualify: 1100,
  button: 120
};

// Styled components for a more premium look
const ComparisonCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.10)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)'
  },
  overflow: 'hidden'
}));

const CardHeaderStyled = styled(CardHeader)(({ theme }) => ({
  textAlign: 'center',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
  background: 'linear-gradient(145deg, rgba(66, 66, 120, 0.08) 0%, rgba(28, 28, 50, 0.15) 100%)',
  height: `${SECTION_HEIGHTS.header}px`,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
}));

const ApplyButtonContainer = styled(Box)(({ theme }) => ({
  height: `${SECTION_HEIGHTS.applyButton + 60}px`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
}));

const SectionContainer = styled(Box)<{ 
  height: number; 
  isEven: boolean;
  sx?: any;
}>(({ theme, height, isEven, sx }) => ({
  height: `${height}px`,
  padding: theme.spacing(5, 6),
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: isEven ? 'transparent' : 'rgba(0, 0, 0, 0.02)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  ...sx
}));

const FeatureLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textAlign: 'left',
  marginBottom: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  height: '30px',
  fontSize: '1.1rem'
}));

const FeatureContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  paddingBottom: theme.spacing(3)
}));

const FeatureValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: theme.palette.text.primary,
  lineHeight: 2,
  fontWeight: 500
}));

const ApplyButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: `${theme.spacing(1.2)} ${theme.spacing(3)}`,
  fontWeight: 600,
}));

const SuccessButton = styled(IconButton)<{success?: boolean}>(({ theme, success }) => ({
  borderRadius: '50%',
  width: 44,
  height: 44,
  backgroundColor: success ? theme.palette.success.main : 'transparent',
  border: `2px solid ${success ? theme.palette.success.main : theme.palette.divider}`,
  color: success ? theme.palette.success.contrastText : theme.palette.primary.main,
  '&:hover': {
    backgroundColor: success ? theme.palette.success.dark : theme.palette.action.hover,
  }
}));

const SuccessBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontWeight: 'bold',
    fontSize: '0.75rem'
  }
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  boxShadow: 'none',
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    padding: theme.spacing(2, 2),
    minHeight: '64px',
    '&.Mui-expanded': {
      minHeight: '64px',
    }
  },
  '& .MuiAccordionSummary-content': {
    margin: theme.spacing(1),
    '&.Mui-expanded': {
      margin: theme.spacing(1),
    }
  },
  '& .MuiAccordionDetails-root': {
    padding: theme.spacing(3, 1),
  }
}));

interface FundingOptionCardProps {
  recommendation: LoanRecommendation;
  isExpanded?: boolean;
}

const FundingOptionCard: React.FC<FundingOptionCardProps> = ({ recommendation, isExpanded = false }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(isExpanded);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [feedbackSnackbarOpen, setFeedbackSnackbarOpen] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [isSuccessfulFunding, setIsSuccessfulFunding] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleApplyClick = () => {
    if (recommendation.applicationUrl) {
      window.open(recommendation.applicationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSuccessClick = () => {
    // For hackathon demo: Always show the success dialog regardless of previous feedback
    setSuccessDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSuccessDialogOpen(false);
  };

  const handleSuccessConfirm = async () => {
    try {
      setSubmittingFeedback(true);
      
      // For hackathon demo: Just simulate an API call with a timeout
      setTimeout(() => {
        console.log('Success feedback simulated for recommendation:', recommendation.id);
        
        // No localStorage saving - just update UI state for the current session
        setIsSuccessfulFunding(true);
        setFeedbackSnackbarOpen(true);
        setSubmittingFeedback(false);
        setSuccessDialogOpen(false);
      }, 1000); // Simulate 1 second API call
    } catch (error) {
      console.error('Error simulating feedback:', error);
      setSubmittingFeedback(false);
      setSuccessDialogOpen(false);
    }
  };

  // Function to get appropriate content based on what's available
  const getAmount = () => {
    if (recommendation.financingAmount && recommendation.financingAmount.length > 0) {
      return (
        <List dense disablePadding>
          {recommendation.financingAmount.map((amount, idx) => (
            <ListItem key={idx} disablePadding sx={{ py: 2 }}>
              <ListItemIcon sx={{ minWidth: 45 }}>
                <Check sx={{ color: theme.palette.success.main, fontSize: 24 }} />
              </ListItemIcon>
              <ListItemText 
                primary={amount} 
                primaryTypographyProps={{ fontSize: '1.05rem', lineHeight: 1.8 }} 
              />
            </ListItem>
          ))}
        </List>
      );
    }
    return recommendation.amount || 'Not specified';
  };

  const getInterestRate = () => {
    if (recommendation.financingRate && recommendation.financingRate.length > 0) {
      return (
        <List dense disablePadding>
          {recommendation.financingRate.map((rate, idx) => (
            <ListItem key={idx} disablePadding sx={{ py: 2 }}>
              <ListItemIcon sx={{ minWidth: 45 }}>
                <Check sx={{ color: theme.palette.success.main, fontSize: 24 }} />
              </ListItemIcon>
              <ListItemText 
                primary={rate} 
                primaryTypographyProps={{ fontSize: '1.05rem', lineHeight: 1.8 }} 
              />
            </ListItem>
          ))}
        </List>
      );
    }
    return recommendation.interestRate || 'Not specified';
  };
  
  return (
    <SuccessBadge 
      badgeContent={isSuccessfulFunding ? "SUCCESS" : 0} 
      color="success"
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      invisible={!isSuccessfulFunding}
    >
      <ComparisonCard sx={isSuccessfulFunding ? { borderColor: 'success.main', borderWidth: 2, borderStyle: 'solid' } : {}}>
        {/* Header */}
        <CardHeaderStyled
          title={
            <Typography variant="h6" fontWeight="bold">
              {recommendation.name}
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {recommendation.provider}
            </Typography>
          }
        />
        
        {/* Apply Now button at top */}
        <ApplyButtonContainer>
          <Box display="flex" alignItems="center" width="100%" justifyContent="center"> 
            <Tooltip title={isSuccessfulFunding ? "You've already reported success with this funding" : "Mark as successful when you receive this funding"}>
              <SuccessButton
                color="success"
                onClick={handleSuccessClick}
                success={isSuccessfulFunding}
              >
                <CheckCircle />
              </SuccessButton>
            </Tooltip>
            <Typography variant="body2" ml={1} color={isSuccessfulFunding ? "success.main" : "text.secondary"}>
              I Got This!
            </Typography>
          </Box>
          <ApplyButton
            variant="contained"
            color="primary"
            endIcon={<ArrowForward />}
            onClick={handleApplyClick}
            disabled={!recommendation.applicationUrl}
            fullWidth
          >
            Apply Now
          </ApplyButton>
        </ApplyButtonContainer>
        
        {/* Sections with fixed heights */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Objective */}
          <SectionContainer height={SECTION_HEIGHTS.objective} isEven={false}>
            <FeatureLabel variant="subtitle2">
              <Description fontSize="small" sx={{ mr: 1 }} /> Objective
            </FeatureLabel>
            <FeatureContent>
              {recommendation.objective ? (
                <FeatureValue>{recommendation.objective}</FeatureValue>
              ) : (
                <FeatureValue sx={{ color: 'text.disabled' }}>Not specified</FeatureValue>
              )}
            </FeatureContent>
          </SectionContainer>

          {/* Coverage */}
          <SectionContainer height={SECTION_HEIGHTS.coverage} isEven={true} sx={{ paddingTop: theme.spacing(4), paddingBottom: theme.spacing(4) }}>
            <FeatureLabel variant="subtitle2">
              <SupportAgent fontSize="small" sx={{ mr: 1 }} /> Coverage
            </FeatureLabel>
            <FeatureContent>
              {recommendation.coverage ? (
                <FeatureValue>{recommendation.coverage}</FeatureValue>
              ) : (
                <FeatureValue sx={{ color: 'text.disabled' }}>Not specified</FeatureValue>
              )}
            </FeatureContent>
          </SectionContainer>
          
          {/* Financing Amount */}
          <SectionContainer height={SECTION_HEIGHTS.financingAmount} isEven={false} sx={{ paddingTop: theme.spacing(4), paddingBottom: theme.spacing(4) }}>
            <FeatureLabel variant="subtitle2">
              <AttachMoney fontSize="small" sx={{ mr: 1 }} /> Financing Amount
            </FeatureLabel>
            <FeatureContent>
              <Box>{getAmount()}</Box>
            </FeatureContent>
          </SectionContainer>
          
          {/* Interest Rate */}
          <SectionContainer height={SECTION_HEIGHTS.interestRate} isEven={true}>
            <FeatureLabel variant="subtitle2">
              <AttachMoney fontSize="small" sx={{ mr: 1 }} /> Interest Rate
            </FeatureLabel>
            <FeatureContent>
              <Box>{getInterestRate()}</Box>
            </FeatureContent>
          </SectionContainer>

          {/* Tenure */}
          <SectionContainer height={SECTION_HEIGHTS.tenure} isEven={false} sx={{ paddingTop: theme.spacing(4), paddingBottom: theme.spacing(4) }}>
            <FeatureLabel variant="subtitle2">
              <Schedule fontSize="small" sx={{ mr: 1 }} /> Tenure
            </FeatureLabel>
            <FeatureContent>
              {recommendation.tenure ? (
                <FeatureValue>{recommendation.tenure}</FeatureValue>
              ) : (
                <FeatureValue sx={{ color: 'text.disabled' }}>Not specified</FeatureValue>
              )}
            </FeatureContent>
          </SectionContainer>
          
          {/* Eligibility - Always Expanded */}
          <SectionContainer height={SECTION_HEIGHTS.eligibility} isEven={true} sx={{ paddingTop: theme.spacing(5), paddingBottom: theme.spacing(5) }}>
            <FeatureLabel variant="subtitle2">
              <Check fontSize="small" sx={{ mr: 1 }} /> Eligibility
            </FeatureLabel>
            <FeatureContent sx={{ paddingTop: theme.spacing(2) }}>
              {recommendation.eligibilityRequirements && recommendation.eligibilityRequirements.length > 0 ? (
                <Box sx={{ pl: 1 }}>
                  <List dense disablePadding>
                    {recommendation.eligibilityRequirements.map((req, idx) => (
                      <ListItem key={idx} sx={{ py: 2 }}>
                        <ListItemIcon sx={{ minWidth: 45 }}>
                          <Check sx={{ color: theme.palette.success.main, fontSize: 24 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={req} 
                          primaryTypographyProps={{ fontSize: '1.05rem', lineHeight: 1.8 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : recommendation.eligibilitySummary ? (
                <FeatureValue>{recommendation.eligibilitySummary}</FeatureValue>
              ) : (
                <FeatureValue sx={{ color: 'text.disabled' }}>Not specified</FeatureValue>
              )}
            </FeatureContent>
          </SectionContainer>
          
          {/* Why You Qualify - With Extra Space */}
          <SectionContainer height={SECTION_HEIGHTS.qualify} isEven={false} sx={{ paddingTop: theme.spacing(6), paddingBottom: theme.spacing(6) }}>
            <FeatureLabel variant="subtitle2">
              <Check fontSize="small" sx={{ mr: 1 }} /> Why You Qualify
            </FeatureLabel>
            <FeatureContent sx={{ paddingTop: theme.spacing(3), paddingLeft: theme.spacing(1) }}>
              {recommendation.reasons && recommendation.reasons.length > 0 ? (
                <List dense disablePadding>
                  {recommendation.reasons.map((reason, idx) => (
                    <ListItem key={idx} disablePadding sx={{ py: 3 }}>
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <Check sx={{ color: theme.palette.success.main, fontSize: 28 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={reason}
                        primaryTypographyProps={{ fontSize: '1.1rem', lineHeight: 2, fontWeight: 400 }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <FeatureValue sx={{ color: 'text.disabled' }}>Information not available</FeatureValue>
              )}
            </FeatureContent>
          </SectionContainer>
        </Box>

        {/* Success Confirmation Dialog */}
        <Dialog
          open={successDialogOpen}
          onClose={handleDialogClose}
        >
          <DialogTitle>Confirm Grant Success</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Congratulations on securing the "{recommendation.name}" funding! 
              This feedback helps us improve our recommendations for you and others.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary" disabled={submittingFeedback}>
              Cancel
            </Button>
            <Button 
              onClick={handleSuccessConfirm} 
              color="success" 
              variant="contained"
              disabled={submittingFeedback}
              startIcon={submittingFeedback ? <CircularProgress size={20} /> : null}
            >
              {submittingFeedback ? 'Submitting...' : 'Confirm Success'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Feedback Snackbar */}
        <Snackbar 
          open={feedbackSnackbarOpen} 
          autoHideDuration={4000} 
          onClose={() => setFeedbackSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setFeedbackSnackbarOpen(false)} 
            severity="success" 
            elevation={6}
            variant="filled"
          >
            Thank you for your feedback! We'll use this to improve recommendations.
          </Alert>
        </Snackbar>
      </ComparisonCard>
    </SuccessBadge>
  );
};

export default FundingOptionCard; 