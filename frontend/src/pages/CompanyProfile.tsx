import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import Layout from '../components/Layout';
import { 
  CompanyProfileSection, 
  CompanyProfile as CompanyProfileType
} from '../components/CompanyProfile';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const CompanyProfile: React.FC = () => {
  // Company profile state
  const [profile, setProfile] = useState<CompanyProfileType>({
    companyName: '',
    registrationNumber: '',
    companyType: '',
    industry: '',
    location: '',
    yearsOfOperation: '',
    employees: '',
    description: ''
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Notification states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch company profile data on component mount
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/company`);
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching company profile:', err);
        setError('Failed to load company profile data');
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  // Update profile field
  const handleProfileChange = (field: keyof CompanyProfileType, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  // Save profile to database
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/company/update`, profile);
      console.log('Profile saved successfully:', response.data);
      
      setSaving(false);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error saving company profile:', err);
      setError('Failed to save company profile');
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
    setError(null);
  };

  if (loading) {
    return (
      <Layout
        title="Company Profile"
        subtitle="Loading company information..."
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout
      title="Company Profile"
      subtitle="Complete your company profile information"
    >
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Company Information</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <CompanyProfileSection 
          profile={profile}
          onProfileChange={handleProfileChange}
        />
      </Paper>

      {/* Success notification */}
      <Snackbar 
        open={saveSuccess} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Company profile saved successfully!
        </Alert>
      </Snackbar>

      {/* Error notification */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default CompanyProfile; 