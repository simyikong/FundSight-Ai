import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  Stack,
  Divider,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import MultiFileUpload from '../FileUpload/MultiFileUpload';
import FormField from './FormField';

interface FileWithPreview extends File {
  preview: string;
}

const fundingGoalOptions = [
  "Equipment",
  "Payroll",
  "Expansion",
  "Inventory",
  "Working Capital",
  "Debt Refinancing",
  "Other"
];

const LoanForm: React.FC = () => {
  const theme = useTheme();
  const [showIslamicOnly, setShowIslamicOnly] = useState(false);
  const [fundingGoal, setFundingGoal] = useState('');
  const [amount, setAmount] = useState('');
  const [financialSummary, setFinancialSummary] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      fundingGoal,
      amount,
      financialSummary,
      showIslamicOnly,
      uploadedFiles: uploadedFiles.map(file => file.name) // Just logging names for simplicity
    });
  };

  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 2, 
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}
        >
          Loan Application
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormField
              label="Funding Goal"
              select
              value={fundingGoal}
              onChange={(e) => setFundingGoal(e.target.value)}
              placeholder="Select funding purpose"
              helperText="Select the primary purpose for this loan"
            >
              <MenuItem value="">
                <em>Select funding purpose</em>
              </MenuItem>
              {fundingGoalOptions.map((option) => (
                <MenuItem key={option} value={option.toLowerCase()}>
                  {option}
                </MenuItem>
              ))}
            </FormField>
            
            <FormField
              label="Preferred Amount"
              type="number" 
              placeholder="Enter amount in USD" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText="Enter the loan amount you're seeking in US Dollars"
              startAdornment={
                <Typography variant="body1" sx={{ mr: 1, color: 'text.secondary' }}>
                  $
                </Typography>
              }
            />

            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1.5, 
                  color: 'text.primary' 
                }}
              >
                Upload Financial Documents
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }}
              >
                <MultiFileUpload 
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024} // 10MB
                  acceptTypes="PDF, DOC, DOCX, XLS, XLSX, CSV"
                  accept={{
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                    'application/vnd.ms-excel': ['.xls', '.csv'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                  }}
                  onFilesChange={setUploadedFiles}
                />
              </Paper>
            </Box>

            <Divider>
              <Typography 
                variant="body2" 
                sx={{ 
                  px: 2, 
                  fontWeight: 500,
                  color: 'text.secondary'
                }}
              >
                OR
              </Typography>
            </Divider>

            <FormField
              label="Financial Summary"
              placeholder="Enter financial details if not uploading documents" 
              multiline
              rows={5}
              value={financialSummary}
              onChange={(e) => setFinancialSummary(e.target.value)}
              helperText="Please provide details about your business finances, including revenue, profit margins, and existing debt"
            />

            <FormControlLabel
              control={
                <Checkbox 
                  checked={showIslamicOnly}
                  onChange={(e) => setShowIslamicOnly(e.target.checked)}
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontWeight: 500 }}>
                  Show Islamic Finance Options Only
                </Typography>
              }
              sx={{ mt: 1 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ 
                  minWidth: 200,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px 0 rgba(0,0,0,0.15)',
                  }
                }}
              >
                Find Loan Options
              </Button>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoanForm; 