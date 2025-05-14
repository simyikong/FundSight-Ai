import React, { useEffect, useState } from 'react';
import { Box, Grid, TextField, MenuItem, Typography, Chip, Tooltip, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { 
  CompanyProfile, 
  FinancialMetrics, 
  COMPANY_TYPES,
  INDUSTRIES, 
  TAX_STATUSES,
  formatCurrency 
} from './types';

interface CompanyProfileSectionProps {
  profile: CompanyProfile;
  onProfileChange: (field: keyof CompanyProfile, value: string) => void;
}

const CompanyProfileSection: React.FC<CompanyProfileSectionProps> = ({
  profile,
  onProfileChange
}) => {
  // State for financial data
  const [financialData, setFinancialData] = useState<{
    revenue: number;
    netProfit: number;
    dataSource: string;
    hasData: boolean;
  }>({
    revenue: 0,
    netProfit: 0,
    dataSource: "",
    hasData: false
  });

  // Fetch financial data on component mount
  useEffect(() => {
    // Simulate fetching data from the FinancialRecords component or API
    const fetchFinancialData = async () => {
      try {
        // In a real app, this would be an API call to get aggregated financial data
        // For now, we'll simulate some data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - would come from an actual API in a real app
        const mockData = {
          revenue: 850000,
          netProfit: 120000,
          dataSource: "Financial Records (Jan 2024 - Apr 2024)",
          hasData: true
        };
        
        setFinancialData(mockData);
        
        // Update the profile with the financial data
        if (mockData.hasData) {
          onProfileChange('revenue', mockData.revenue.toString());
          onProfileChange('netProfit', mockData.netProfit.toString());
        }
      } catch (error) {
        console.error("Error fetching financial data:", error);
        setFinancialData({
          revenue: 0,
          netProfit: 0,
          dataSource: "",
          hasData: false
        });
      }
    };
    
    fetchFinancialData();
  }, [onProfileChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onProfileChange(name as keyof CompanyProfile, value);
  };

  return (
    <Box component="form">
      {financialData.hasData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Financial data has been automatically imported from your uploaded financial records.
        </Alert>
      )}
      
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
      
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>Financial Information</Typography>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Data source: 
        </Typography>
        <Chip 
          size="small" 
          label={financialData.hasData ? financialData.dataSource : "No data available"} 
          color={financialData.hasData ? "success" : "default"}
          sx={{ ml: 1 }}
        />
        <Tooltip title="Financial data is automatically calculated from your uploaded financial records. Upload your monthly financial documents in the Financial Records section to update this data.">
          <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
        </Tooltip>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Annual Revenue (RM)"
            name="revenue"
            value={financialData.hasData ? formatCurrency(profile.revenue) : profile.revenue}
            InputProps={{
              readOnly: financialData.hasData,
            }}
            onChange={handleChange}
            variant="outlined"
            placeholder="Auto-calculated from financial records"
            helperText={financialData.hasData ? "Auto-calculated from financial records" : "Will be calculated from financial records"}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Net Profit (RM)"
            name="netProfit"
            value={financialData.hasData ? formatCurrency(profile.netProfit) : profile.netProfit}
            InputProps={{
              readOnly: financialData.hasData,
            }}
            onChange={handleChange}
            variant="outlined"
            placeholder="Auto-calculated from financial records"
            helperText={financialData.hasData ? "Auto-calculated from financial records" : "Will be calculated from financial records"}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Tax Status"
            name="taxStatus"
            value={profile.taxStatus}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem value="">
              <em>Select tax status</em>
            </MenuItem>
            {TAX_STATUSES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompanyProfileSection; 