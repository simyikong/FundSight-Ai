import React, { useState } from 'react';
import { Box, Grid, TextField, MenuItem, Typography, Divider, Chip, Button, Paper, Alert, CircularProgress, IconButton, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { 
  CompanyProfile, 
  COMPANY_TYPES,
  INDUSTRIES
} from '../../components/types';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Gender options for dropdown
const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say'
];

// Ethnicity options for dropdown
const ETHNICITY_OPTIONS = [
  'Malay',
  'Chinese',
  'Indian',
  'Indigenous',
  'Other'
];

// Special category options
const SPECIAL_CATEGORIES = [
  'Woman-owned Business',
  'Youth Entrepreneur',
  'Disabled Person-owned Business',
  'Rural Enterprise',
  'B40 Entrepreneur',
  'None of the above'
];

// Grant types that the company might be interested in
const GRANT_TYPES = [
  'Digital Transformation',
  'Business Expansion',
  'Research & Development',
  'Sustainability & Green Technology',
  'Skills Development',
  'Export Development',
  'Product Innovation'
];

interface CompanyProfileSectionProps {
  profile: CompanyProfile;
  onProfileChange: (field: keyof CompanyProfile, value: string | string[]) => void;
}

const CompanyProfileSection: React.FC<CompanyProfileSectionProps> = ({
  profile,
  onProfileChange
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onProfileChange(name as keyof CompanyProfile, value);
  };

  const handleMultiSelectChange = (field: keyof CompanyProfile, value: string) => {
    const currentValues = profile[field] as string[] || [];
    let newValues: string[];
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(item => item !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    onProfileChange(field, newValues);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadSuccess(false);
      setUploadError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    // Only allow PDF files
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        'http://localhost:8000/api/v1/company/upload-document',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Store the extracted data
      const extractedInfo = response.data.data;
      setExtractedData(extractedInfo);
      
      // Try to apply extracted data automatically
      applyExtractedData(extractedInfo);

      setUploadSuccess(true);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('company-document-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload and process the document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Function to apply extracted data
  const applyExtractedData = (data: Record<string, any>, override = false) => {
    // Log the data to help with debugging
    console.log('Applying extracted data:', data);
    console.log('Current profile before update:', profile);
    
    if (!data || Object.keys(data).length === 0) {
      console.log('No data to apply');
      return;
    }
    
    // Create a new profile object with updates
    const updatedProfile = { ...profile };
    let updatesMade = false;
    
    // Clean up specific fields to match dropdown options
    if (data.companyType) {
      // Try to match extracted company type with available options
      const extractedType = data.companyType.toLowerCase();
      const matchedType = COMPANY_TYPES.find(type => 
        extractedType.includes(type.toLowerCase()) || 
        type.toLowerCase().includes(extractedType.split(' ')[0])
      );
      
      if (matchedType) {
        data.companyType = matchedType;
        console.log(`Matched company type: ${extractedType} -> ${matchedType}`);
      }
    }
    
    if (data.industry) {
      // Try to match extracted industry with available options
      const extractedIndustry = data.industry.toLowerCase();
      const matchedIndustry = INDUSTRIES.find(industry => 
        extractedIndustry.includes(industry.toLowerCase()) || 
        industry.toLowerCase().includes(extractedIndustry.split(' ')[0])
      );
      
      if (matchedIndustry) {
        data.industry = matchedIndustry;
        console.log(`Matched industry: ${extractedIndustry} -> ${matchedIndustry}`);
      }
    }
    
    // Handle ethnicity matching if needed
    if (data.founderEthnicity) {
      const extractedEthnicity = data.founderEthnicity.toLowerCase();
      const matchedEthnicity = ETHNICITY_OPTIONS.find(ethnicity => 
        extractedEthnicity.includes(ethnicity.toLowerCase())
      );
      
      if (matchedEthnicity) {
        data.founderEthnicity = matchedEthnicity;
        console.log(`Matched ethnicity: ${extractedEthnicity} -> ${matchedEthnicity}`);
      }
    }
    
    // Handle gender matching
    if (data.founderGender) {
      const extractedGender = data.founderGender.toLowerCase();
      const matchedGender = GENDER_OPTIONS.find(gender => 
        extractedGender.includes(gender.toLowerCase())
      );
      
      if (matchedGender) {
        data.founderGender = matchedGender;
        console.log(`Matched gender: ${extractedGender} -> ${matchedGender}`);
      }
    }
    
    // Handle special category matching
    if (data.specialCategory) {
      const extractedCategory = data.specialCategory.toLowerCase();
      const matchedCategory = SPECIAL_CATEGORIES.find(category => 
        extractedCategory.includes(category.toLowerCase())
      );
      
      if (matchedCategory) {
        data.specialCategory = matchedCategory;
        console.log(`Matched special category: ${extractedCategory} -> ${matchedCategory}`);
      }
    }
    
    Object.keys(data).forEach((key) => {
      // Skip if the field doesn't exist in our profile type
      if (!Object.prototype.hasOwnProperty.call(profile, key)) {
        console.log(`Skipping field ${key} as it doesn't exist in the profile`);
        return;
      }
      
      const fieldKey = key as keyof CompanyProfile;
      const value = data[key];
      
      // Skip empty values
      if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        console.log(`Skipping empty value for field ${fieldKey}`);
        return;
      }
      
      // Apply if value exists and either override is true or the field is empty
      const currentValue = profile[fieldKey];
      const isEmpty = !currentValue || 
                     (typeof currentValue === 'string' && currentValue.trim() === '') ||
                     (Array.isArray(currentValue) && currentValue.length === 0);
                     
      if (override || isEmpty) {
        console.log(`Updating field ${fieldKey}: ${currentValue} -> ${value}`);
        updatedProfile[fieldKey] = value;
        updatesMade = true;
      } else {
        console.log(`Skipping field ${fieldKey} because it already has a value: ${currentValue}`);
      }
    });
    
    // Only update the profile if changes were made
    if (updatesMade) {
      console.log('Updated profile:', updatedProfile);
      
      // Use direct DOM manipulation to ensure fields are updated
      Object.keys(updatedProfile).forEach(key => {
        const fieldKey = key as keyof CompanyProfile;
        const newValue = updatedProfile[fieldKey];
        
        if (newValue !== undefined) {
          // First try to update using the React state function
          try {
            onProfileChange(fieldKey, newValue as string | string[]);
          } catch (err) {
            console.error(`Error updating field ${fieldKey}:`, err);
          }
          
          // Also try to update the form field directly to ensure visual update
          try {
            const inputElement = document.querySelector(`input[name="${fieldKey}"], textarea[name="${fieldKey}"]`) as HTMLInputElement | HTMLTextAreaElement;
            if (inputElement && typeof newValue === 'string') {
              inputElement.value = newValue;
              
              // For select fields, we need to trigger Material-UI's select change
              if (inputElement.getAttribute('role') === 'combobox' || 
                  fieldKey === 'companyType' || 
                  fieldKey === 'industry' || 
                  fieldKey === 'founderGender' || 
                  fieldKey === 'founderEthnicity' || 
                  fieldKey === 'specialCategory') {
                // Find the select element and trigger change
                const selectElement = document.querySelector(`[name="${fieldKey}"]`) as HTMLElement;
                if (selectElement) {
                  // Force React state update for select elements
                  onProfileChange(fieldKey, newValue);
                }
              } else {
                // Trigger change event to ensure React picks up the change
                const event = new Event('change', { bubbles: true });
                Object.defineProperty(event, 'target', { writable: false, value: { name: fieldKey, value: newValue } });
                inputElement.dispatchEvent(event);
              }
            }
          } catch (err) {
            console.log(`Could not directly update field ${fieldKey} in DOM:`, err);
          }
        }
      });
      
      // Force parent component to update by dispatching a custom event
      try {
        const event = new CustomEvent('profileDataExtracted', { 
          detail: { profile: updatedProfile } 
        });
        document.dispatchEvent(event);
      } catch (err) {
        console.error('Error dispatching custom event:', err);
      }
      
      console.log('Profile update complete');
    } else {
      console.log('No updates made to profile');
    }
  };

  // Function to forcefully apply all extracted data
  const handleApplyAllData = () => {
    applyExtractedData(extractedData, true);
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setUploadError(null);
    // Reset file input
    const fileInput = document.getElementById('company-document-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Box component="form">
      {/* Document Upload Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          border: '1px dashed', 
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Upload Company Document
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Upload your company registration document, business plan, or other company information document to automatically fill in your profile details.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            disabled={isUploading}
            sx={{ mr: 2 }}
          >
            Select PDF
            <input
              id="company-document-upload"
              type="file"
              hidden
              accept=".pdf"
              onChange={handleFileChange}
            />
          </Button>
          
          {selectedFile && (
            <>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: 'background.default',
                borderRadius: 1,
                py: 0.5,
                px: 1,
                mr: 1,
                flex: 1
              }}>
                <DescriptionIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                  {selectedFile.name}
                </Typography>
              </Box>
              
              <IconButton 
                size="small" 
                onClick={handleCancelUpload}
                sx={{ mr: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              
              <Button
                variant="contained"
                onClick={handleFileUpload}
                disabled={isUploading}
              >
                {isUploading ? <CircularProgress size={24} /> : 'Extract Data'}
              </Button>
            </>
          )}
        </Box>
        
        {uploadError && (
          <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>
        )}
        
        {uploadSuccess && (
          <Alert 
            icon={<CheckCircleIcon fontSize="inherit" />}
            severity="success" 
            sx={{ mt: 2 }}
          >
            Document processed successfully! Form fields have been updated with extracted information.
          </Alert>
        )}
        
        {/* Extracted Data Panel */}
        {uploadSuccess && Object.keys(extractedData).length > 0 && (
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="extracted-data-content"
              id="extracted-data-header"
            >
              <Typography>View Extracted Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" paragraph>
                Below is the information extracted from your document. Click "Apply All Data" to fill in the form with this information.
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleApplyAllData}
                sx={{ mb: 2 }}
              >
                Apply All Data
              </Button>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Field</strong></TableCell>
                      <TableCell><strong>Extracted Value</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(extractedData).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{typeof value === 'string' ? value : JSON.stringify(value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Copy all extracted data:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={JSON.stringify(extractedData, null, 2)}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mt: 1, fontFamily: 'monospace' }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Paper>

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Basic Company Information</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            required
            label="Company Name"
            name="companyName"
            value={profile.companyName || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., Ali Maju Cafe Enterprise"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            label="Registration Number"
            name="registrationNumber"
            value={profile.registrationNumber || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., 0023456789-A"
            helperText="This should match your SSM Certificate"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Website"
            name="website"
            value={profile.website || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., https://www.yourcompany.com"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            required
            label="Company Type"
            name="companyType"
            value={profile.companyType || ''}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem value="">
              <em>Select company type</em>
            </MenuItem>
            {COMPANY_TYPES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            required
            label="Industry"
            name="industry"
            value={profile.industry || ''}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem value="">
              <em>Select industry</em>
            </MenuItem>
            {INDUSTRIES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Business Location"
            name="location"
            value={profile.location || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., Kuala Lumpur"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Business Details</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            required
            label="Years of Operation"
            name="yearsOfOperation"
            value={profile.yearsOfOperation || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., 5"
            type="number"
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Registration Year"
            name="registrationYear"
            value={profile.registrationYear || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., 2018"
            type="number"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Number of Employees"
            name="employees"
            value={profile.employees || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., 12"
            type="number"
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Founder Information</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Founder Gender"
            name="founderGender"
            value={profile.founderGender || ''}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem value="">
              <em>Select founder gender</em>
            </MenuItem>
            {GENDER_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Founder Ethnicity"
            name="founderEthnicity"
            value={profile.founderEthnicity || ''}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem value="">
              <em>Select founder ethnicity</em>
            </MenuItem>
            {ETHNICITY_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Special Category (if applicable)"
            name="specialCategory"
            value={profile.specialCategory || ''}
            onChange={handleChange}
            variant="outlined"
            helperText="Select if your business belongs to any special category"
          >
            <MenuItem value="">
              <em>Select category (if applicable)</em>
            </MenuItem>
            {SPECIAL_CATEGORIES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Company Mission & Description</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Mission Statement"
            name="missionStatement"
            value={profile.missionStatement || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="Briefly describe your company's mission"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Company Description"
            name="description"
            value={profile.description || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="Describe your company's business, products/services, and values"
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Funding & Grants</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Previous Grants Received"
            name="previousGrantsReceived"
            value={profile.previousGrantsReceived || ''}
            onChange={handleChange}
            variant="outlined"
            placeholder="List any previous grants or funding your company has received"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Interested Grant Types
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {GRANT_TYPES.map((grant) => (
              <Chip
                key={grant}
                label={grant}
                color={profile.interestedGrantTypes?.includes(grant) ? "primary" : "default"}
                onClick={() => handleMultiSelectChange('interestedGrantTypes', grant)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompanyProfileSection; 