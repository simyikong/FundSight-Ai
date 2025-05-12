import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  Stack
} from '@mui/material';
import { FiInfo } from 'react-icons/fi';
import MultiFileUpload from '../FileUpload/MultiFileUpload';

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        elevation={1}
        sx={{ p: 4, borderRadius: 2 }}
      >
        <Stack spacing={3}>
          <Typography variant="h5" component="h2" gutterBottom>
            Loan Application
          </Typography>
          
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Funding Goal
            </Typography>
            <TextField
              select
              fullWidth
              value={fundingGoal}
              onChange={(e) => setFundingGoal(e.target.value)}
              placeholder="Select funding purpose"
              variant="outlined"
              size="small"
            >
              <MenuItem value="">
                <em>Select funding purpose</em>
              </MenuItem>
              {fundingGoalOptions.map((option) => (
                <MenuItem key={option} value={option.toLowerCase()}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <FiInfo size={12} style={{ marginRight: '4px', color: '#757575' }} />
              <Typography variant="caption" color="text.secondary">
                Select the primary purpose for this loan
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Preferred Amount
            </Typography>
            <TextField 
              type="number" 
              placeholder="Enter amount in USD" 
              fullWidth
              variant="outlined"
              size="small"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <FiInfo size={12} style={{ marginRight: '4px', color: '#757575' }} />
              <Typography variant="caption" color="text.secondary">
                Amount in USD
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Upload Financial Documents
            </Typography>
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
          </Box>

          <Typography variant="subtitle1" fontWeight="bold">
            OR
          </Typography>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Financial Summary
            </Typography>
            <TextField 
              placeholder="Enter financial details if not uploading documents" 
              multiline
              rows={5}
              fullWidth
              variant="outlined"
              value={financialSummary}
              onChange={(e) => setFinancialSummary(e.target.value)}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <FiInfo size={12} style={{ marginRight: '4px', color: '#757575' }} />
              <Typography variant="caption" color="text.secondary">
                Please provide details about your business finances
              </Typography>
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Checkbox 
                checked={showIslamicOnly}
                onChange={(e) => setShowIslamicOnly(e.target.checked)}
              />
            }
            label={
              <Typography fontWeight="bold">
                Show Islamic Options Only
              </Typography>
            }
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ mt: 2 }}
          >
            Find Loan Options
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LoanForm; 