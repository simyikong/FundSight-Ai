import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Divider,
  TextField,
  MenuItem,
  Paper,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import { CompanyProfileSection, DocumentUploadSection, LoanRecommendationSection } from './index';
import { AccountBalance, Business } from '@mui/icons-material';
import { 
  CompanyProfile, 
  UploadedDocument
} from './types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      style={{ paddingTop: '24px' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const ProfileApplyForm: React.FC = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Company profile state
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    registrationNumber: '',
    companyType: '',
    industry: '',
    location: '',
    yearsOfOperation: '',
    employees: '',
    revenue: '',
    netProfit: '',
    taxStatus: ''
  });

  // Document upload state
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  // Loan recommendation state
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRecommendationEnabled, setIsRecommendationEnabled] = useState(false);

  // Handle document upload
  const handleDocumentUpload = (type: string, file: File) => {
    const newDocument: UploadedDocument = {
      id: Date.now().toString(),
      type,
      file,
      fileName: file.name,
      uploadDate: new Date(),
      status: 'uploaded',
      isActive: true, // Make new uploads active by default
    };
    
    // If this is a new active document, deactivate other documents of the same type
    const updatedDocuments = documents.map(doc => {
      if (doc.type === type && doc.isActive) {
        return { ...doc, isActive: false };
      }
      return doc;
    });
    
    setDocuments([...updatedDocuments, newDocument]);
    
    // Simulate document processing and data extraction
    setTimeout(() => {
      processDocument(newDocument.id);
    }, 1500);
  };

  // Process uploaded document (simulate OCR and data extraction)
  const processDocument = (documentId: string) => {
    setDocuments(prevDocuments => 
      prevDocuments.map(doc => {
        if (doc.id === documentId) {
          return { ...doc, status: 'processing' };
        }
        return doc;
      })
    );

    // Simulate API call to process document
    setTimeout(() => {
      setDocuments(prevDocuments => 
        prevDocuments.map(doc => {
          if (doc.id === documentId) {
            // Simulate extracted data based on document type
            let extractedData = {};
            
            if (doc.type === 'ssmCertificate') {
              extractedData = {
                companyName: 'Ali Maju Cafe Enterprise',
                registrationNumber: '0023456789-A',
                companyType: 'Sole Proprietorship',
                industry: 'Food & Beverage'
              };
            } else if (doc.type === 'plStatement') {
              extractedData = {
                revenue: '450000',
                netProfit: '65000'
              };
            } else if (doc.type === 'bankStatement') {
              extractedData = {
                accountBalance: '34500'
              };
            }
            
            // Only update profile fields if they're empty or if this is an active document
            if (doc.isActive) {
              setProfile(prev => ({
                ...prev,
                ...extractedData
              }));
            }
            
            return { 
              ...doc, 
              status: 'completed',
              extractedData
            };
          }
          return doc;
        })
      );
      
      // Enable recommendation if we have enough data
      checkRecommendationEligibility();
    }, 2000);
  };

  // Update profile field
  const handleProfileChange = (field: keyof CompanyProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
    checkRecommendationEligibility();
  };

  // Set a document as active
  const handleSetActiveDocument = (documentId: string) => {
    const targetDoc = documents.find(doc => doc.id === documentId);
    if (!targetDoc) return;
    
    setDocuments(prevDocs => 
      prevDocs.map(doc => {
        // Deactivate all documents of the same type
        if (doc.type === targetDoc.type) {
          return { ...doc, isActive: doc.id === documentId };
        }
        return doc;
      })
    );
    
    // If the activated document has extracted data, update the profile
    if (targetDoc.extractedData) {
      setProfile(prev => ({
        ...prev,
        ...targetDoc.extractedData
      }));
    }
    
    checkRecommendationEligibility();
  };
  
  // Delete a document
  const handleDeleteDocument = (documentId: string) => {
    const targetDoc = documents.find(doc => doc.id === documentId);
    if (!targetDoc) return;
    
    // If deleting an active document, activate the most recent one of the same type
    if (targetDoc.isActive) {
      const sameTypeDocuments = documents
        .filter(doc => doc.type === targetDoc.type && doc.id !== documentId)
        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
      
      if (sameTypeDocuments.length > 0) {
        const newActiveDoc = sameTypeDocuments[0];
        handleSetActiveDocument(newActiveDoc.id);
      }
    }
    
    // Remove the document
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
    
    checkRecommendationEligibility();
  };

  // Check if we have enough data to enable recommendations
  const checkRecommendationEligibility = () => {
    // At minimum, we need company name, registration number, and at least one document
    const hasBasicInfo = Boolean(profile.companyName && profile.registrationNumber);
    const hasDocument = documents.some(doc => doc.status === 'completed' && doc.isActive);
    
    setIsRecommendationEnabled(hasBasicInfo && hasDocument);
  };

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
        }
      ];
      
      setRecommendations(sampleRecommendations);
    }, 1500);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="profile tabs"
          variant="fullWidth"
        >
          <Tab 
            icon={<Business />} 
            iconPosition="start" 
            label="Company Profile" 
            {...a11yProps(0)} 
          />
          <Tab 
            icon={<AccountBalance />} 
            iconPosition="start" 
            label="Funding" 
            {...a11yProps(1)} 
          />
        </Tabs>
      </Box>

      {/* Company Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>Company Profile</Typography>
          <Divider sx={{ mb: 3 }} />
          
          <CompanyProfileSection 
            profile={profile}
            onProfileChange={handleProfileChange}
          />
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Company Documents</Typography>
            <DocumentUploadSection 
              documents={documents}
              onDocumentUpload={handleDocumentUpload}
              onSetActiveDocument={handleSetActiveDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          </Box>
        </Paper>
      </TabPanel>

      {/* Funding Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>Funding Recommendation</Typography>
          <Divider sx={{ mb: 3 }} />
          
          <LoanRecommendationSection 
            loanPurpose={loanPurpose}
            loanAmount={loanAmount}
            onLoanPurposeChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanPurpose(e.target.value)}
            onLoanAmountChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
            isEnabled={isRecommendationEnabled}
            recommendations={recommendations}
            onGenerateRecommendations={generateRecommendations}
          />
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default ProfileApplyForm; 