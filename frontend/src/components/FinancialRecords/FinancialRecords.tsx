import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Warning,
  Delete,
  Visibility,
  Edit,
  Refresh,
  Description,
  ArrowForward,
  Dashboard
} from '@mui/icons-material';

// Types
interface FinancialDocument {
  id: string;
  type: string;
  fileName: string;
  uploadDate: Date;
  month: number;
  year: number;
  status: 'uploaded' | 'processing' | 'extracted' | 'extraction_failed';
  fileUrl?: string;
}

interface FinancialMetrics {
  month: number;
  year: number;
  revenue: number;
  expenses: number;
  netProfit: number;
  cashBalance: number;
  payroll?: number;
  taxAmount?: number;
  status: 'complete' | 'partial' | 'pending';
  lastUpdated: Date;
}

// Document types
const documentTypes = [
  { id: 'plStatement', name: 'P&L Statement', required: true },
  { id: 'bankStatement', name: 'Bank Statement', required: true },
  { id: 'invoices', name: 'Invoices', required: false },
  { id: 'taxReturn', name: 'Tax Return', required: false },
  { id: 'otherDocs', name: 'Other Documents', required: false }
];

// Months for selector
const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

// Format currency
const formatCurrency = (value: number): string => {
  return `RM ${value.toLocaleString()}`;
};

// Format date as DD/MM/YYYY
const formatDate = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

// Get the month name
const getMonthName = (month: number): string => {
  return months.find(m => m.value === month)?.label || '';
};

const FinancialRecords: React.FC = () => {
  // Current date
  const currentDate = new Date();
  
  // State for selected month/year
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [extracting, setExtracting] = useState(false);
  
  // Document state - initially empty
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  
  // File input refs
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  // Get documents for selected month
  const getDocumentsForMonth = (month: number, year: number) => {
    return documents.filter(doc => doc.month === month && doc.year === year);
  };

  // Handle file input click
  const handleUploadClick = (docType: string) => {
    fileInputRefs.current[docType]?.click();
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // Show uploading indicator
      setUploading(prev => ({ ...prev, [docType]: true }));
      
      // Simulate upload and processing
      setTimeout(() => {
        setUploading(prev => ({ ...prev, [docType]: false }));
        
        // Add document to state (in a real app, this would come from the server)
        const newDoc: FinancialDocument = {
          id: Date.now().toString(),
          type: docType,
          fileName: file.name,
          uploadDate: new Date(),
          month: selectedMonth,
          year: selectedYear,
          status: 'uploaded'
        };
        
        setDocuments(prevDocs => [...prevDocs, newDoc]);
        
        // Simulate document processing after upload
        setTimeout(() => {
          setDocuments(prevDocs => 
            prevDocs.map(doc => 
              doc.id === newDoc.id 
                ? { ...doc, status: 'extracted' } 
                : doc
            )
          );
        }, 2000);
      }, 1500);
    }
  };

  // Handle extract data
  const handleExtractData = () => {
    setExtracting(true);
    // Simulate extraction
    setTimeout(() => {
      setExtracting(false);
      
      // Generate metrics from uploaded documents
      const currentDocs = getDocumentsForMonth(selectedMonth, selectedYear);
      if (currentDocs.length > 0) {
        // In a real app, this would be calculated from actual document data
        setMetrics({
          month: selectedMonth,
          year: selectedYear,
          revenue: Math.floor(Math.random() * 100000) + 50000,
          expenses: Math.floor(Math.random() * 70000) + 30000,
          netProfit: Math.floor(Math.random() * 40000) + 10000,
          cashBalance: Math.floor(Math.random() * 50000) + 20000,
          status: 'complete',
          lastUpdated: new Date()
        });
      }
    }, 2000);
  };

  // Render document upload cards for the selected month
  const renderDocumentCards = () => {
    const currentDocs = getDocumentsForMonth(selectedMonth, selectedYear);
    
    return (
      <Grid container spacing={2}>
        {documentTypes.map(docType => {
          const doc = currentDocs.find(d => d.type === docType.id);
          const isUploading = uploading[docType.id] || false;
          
          return (
            <Grid item xs={12} md={6} key={docType.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Description sx={{ mr: 1 }} />
                      {docType.name}
                      {docType.required && (
                        <Chip size="small" label="Required" color="primary" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                    {doc ? (
                      <Chip
                        size="small"
                        icon={doc.status === 'extracted' ? <CheckCircle fontSize="small" /> : <Warning fontSize="small" />}
                        label={doc.status === 'extracted' ? 'Extracted' : 'Pending Extraction'}
                        color={doc.status === 'extracted' ? 'success' : 'warning'}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="Missing"
                        color="default"
                      />
                    )}
                  </Box>
                  
                  {doc ? (
                    <Box>
                      <Typography variant="body2">
                        {doc.fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Uploaded: {formatDate(doc.uploadDate)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No {docType.name.toLowerCase()} uploaded for {getMonthName(selectedMonth)} {selectedYear}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  {isUploading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2">Uploading...</Typography>
                    </Box>
                  ) : doc ? (
                    <>
                      <Button 
                        size="small" 
                        startIcon={<Visibility />}
                        onClick={() => {/* View document */}}
                      >
                        View
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<CloudUpload />}
                        onClick={() => handleUploadClick(docType.id)}
                      >
                        Replace
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CloudUpload />}
                      onClick={() => handleUploadClick(docType.id)}
                    >
                      Upload
                    </Button>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, docType.id)}
                    ref={(element) => {
                      fileInputRefs.current[docType.id] = element;
                    }}
                  />
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Render extracted metrics table
  const renderExtractedMetrics = () => {
    if (!metrics) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          No financial data has been extracted for {getMonthName(selectedMonth)} {selectedYear}. 
          Upload documents and click "Extract Data" to generate financial metrics.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Extracted Financial Metrics
          </Typography>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={() => {/* Edit metrics */}}
          >
            Edit
          </Button>
        </Box>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Revenue</TableCell>
                <TableCell align="right">{formatCurrency(metrics.revenue)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Expenses</TableCell>
                <TableCell align="right">{formatCurrency(metrics.expenses)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Net Profit</TableCell>
                <TableCell align="right">{formatCurrency(metrics.netProfit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cash Balance</TableCell>
                <TableCell align="right">{formatCurrency(metrics.cashBalance)}</TableCell>
              </TableRow>
              {metrics.payroll && (
                <TableRow>
                  <TableCell>Payroll</TableCell>
                  <TableCell align="right">{formatCurrency(metrics.payroll)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {formatDate(metrics.lastUpdated)}
          </Typography>
          <Chip
            size="small"
            label={metrics.status === 'complete' ? 'Complete' : 'Partial Data'}
            color={metrics.status === 'complete' ? 'success' : 'warning'}
          />
        </Box>
      </Box>
    );
  };

  // Get the documents status
  const hasRequiredDocs = () => {
    const currentDocs = getDocumentsForMonth(selectedMonth, selectedYear);
    const requiredTypes = documentTypes.filter(dt => dt.required).map(dt => dt.id);
    return requiredTypes.every(type => currentDocs.some(doc => doc.type === type));
  };

  // Render action buttons
  const renderActions = () => {
    const currentDocs = getDocumentsForMonth(selectedMonth, selectedYear);
    const hasDocuments = currentDocs.length > 0;
    
    return (
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!hasDocuments || extracting}
          startIcon={extracting ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
          onClick={handleExtractData}
        >
          {extracting ? 'Extracting...' : 'Extract Data'}
        </Button>
        
        <Box>
          {metrics && (
            <Button
              variant="outlined"
              startIcon={<Dashboard />}
              sx={{ mr: 1 }}
              onClick={() => {/* Navigate to dashboard */}}
            >
              View in Dashboard
            </Button>
          )}
          
          {hasRequiredDocs() && (
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={() => {/* Navigate to loans */}}
            >
              Get Funding Recommendations
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  // Get available years - current year and two years back
  const getAvailableYears = () => {
    const currentYear = currentDate.getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Financial Records</Typography>
        <Typography variant="body2" color="text.secondary">
          Upload your financial documents organized by month to power your dashboard and get accurate funding recommendations.
        </Typography>
      </Box>
      
      {/* Month selector */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              fullWidth
              variant="outlined"
              size="small"
            >
              {months.map(month => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              fullWidth
              variant="outlined"
              size="small"
            >
              {getAvailableYears().map(year => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>
      
      {/* Month status */}
      <Box sx={{ mb: 3 }}>
        {documents.length > 0 ? (
          <Alert 
            severity={
              hasRequiredDocs() ? 'success' : 'warning'
            }
          >
            {hasRequiredDocs() 
              ? `All required documents uploaded for ${getMonthName(selectedMonth)} ${selectedYear}.` 
              : `Missing required documents for ${getMonthName(selectedMonth)} ${selectedYear}.`
            }
          </Alert>
        ) : (
          <Alert severity="info">
            No documents uploaded yet for {getMonthName(selectedMonth)} {selectedYear}. Upload the required documents to continue.
          </Alert>
        )}
      </Box>
      
      {/* Document upload cards */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Documents for {getMonthName(selectedMonth)} {selectedYear}
        </Typography>
        {renderDocumentCards()}
      </Box>
      
      {/* Extracted metrics */}
      {renderExtractedMetrics()}
      
      {/* Action buttons */}
      {renderActions()}
    </Box>
  );
};

export default FinancialRecords; 