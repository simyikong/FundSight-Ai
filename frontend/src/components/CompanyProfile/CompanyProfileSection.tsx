import React from 'react';
import { Box, Grid, TextField, MenuItem, Typography } from '@mui/material';
import { 
  CompanyProfile, 
  COMPANY_TYPES,
  INDUSTRIES
} from '../../components/types';

interface CompanyProfileSectionProps {
  profile: CompanyProfile;
  onProfileChange: (field: keyof CompanyProfile, value: string) => void;
}

const CompanyProfileSection: React.FC<CompanyProfileSectionProps> = ({
  profile,
  onProfileChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onProfileChange(name as keyof CompanyProfile, value);
  };

  return (
    <Box component="form">
      <Typography variant="subtitle1" gutterBottom>Company Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Company Name"
            name="companyName"
            value={profile.companyName}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., Ali Maju Cafe Enterprise"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Registration Number"
            name="registrationNumber"
            value={profile.registrationNumber}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., 0023456789-A"
            helperText="This should match your SSM Certificate"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Company Description"
            name="description"
            value={profile.description}
            onChange={handleChange}
            variant="outlined"
            placeholder="Describe your company's business, mission, and values"
            helperText="Optional - Provide a brief overview of your company"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            required
            label="Company Type"
            name="companyType"
            value={profile.companyType}
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
            value={profile.industry}
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
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Business Location"
            name="location"
            value={profile.location}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., Kuala Lumpur"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Years of Operation"
            name="yearsOfOperation"
            value={profile.yearsOfOperation}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., 5"
            type="number"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Number of Employees"
            name="employees"
            value={profile.employees}
            onChange={handleChange}
            variant="outlined"
            placeholder="e.g., 12"
            type="number"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompanyProfileSection; 