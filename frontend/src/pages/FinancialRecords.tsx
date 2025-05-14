import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Chip,
  Link,
  Stack,
  Button,
  CircularProgress
} from '@mui/material';
import Layout from '../components/Layout';
import { BulkUploadSection } from '../components/FinancialRecords';
import { PictureAsPdf, AttachMoney, ShowChart, Refresh } from '@mui/icons-material';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Interface for documents by month
interface MonthlyDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  metrics: {
    revenue?: number;
    expenses?: number;
    profit?: number;
    cashFlow?: number;
  };
}

// Sample data (in a real app, this would come from an API)
const INITIAL_SAMPLE_DOCS: Record<string, MonthlyDocument[]> = {
  'January': [
    { 
      id: 'jan1', 
      fileName: 'Jan2024_BankStatement.pdf', 
      fileUrl: '#',
      metrics: { revenue: 45000, expenses: 32000, profit: 13000, cashFlow: 15000 }
    }
  ],
  'March': [
    { 
      id: 'mar1', 
      fileName: 'Q1_PLStatement.pdf', 
      fileUrl: '#',
      metrics: { revenue: 150000, expenses: 120000, profit: 30000 }
    },
    { 
      id: 'mar2', 
      fileName: 'March_BankStatement.pdf', 
      fileUrl: '#',
      metrics: { cashFlow: 25000 }
    }
  ],
  'April': [
    { 
      id: 'apr1', 
      fileName: 'April_Invoice_Summary.pdf', 
      fileUrl: '#',
      metrics: { revenue: 58000 }
    }
  ]
};

const FinancialRecords: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyDocuments, setMonthlyDocuments] = useState(INITIAL_SAMPLE_DOCS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Years for selection (current year and 2 years back)
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
  
  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(Number(event.target.value));
  };

  // Format currency helper
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(value);
  };

  // In a real app, this would be an API call to fetch the latest documents
  const refreshDocuments = () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, you would fetch updated data from the server
      // Here we're just simulating by adding a random document to May
      const newDocId = `may-${Date.now()}`;
      const mayDocs = monthlyDocuments['May'] || [];
      
      setMonthlyDocuments({
        ...monthlyDocuments,
        'May': [
          ...mayDocs,
          {
            id: newDocId,
            fileName: `May_Report_${newDocId.substring(0, 5)}.pdf`,
            fileUrl: '#',
            metrics: { 
              revenue: Math.floor(Math.random() * 50000) + 30000,
              expenses: Math.floor(Math.random() * 30000) + 20000,
              profit: Math.floor(Math.random() * 20000) + 10000,
              cashFlow: Math.floor(Math.random() * 20000) + 5000
            }
          }
        ]
      });
      
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <Layout
      title="Financial Records"
      subtitle="Upload, organize, and analyze your financial documents"
    >
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <BulkUploadSection />
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Financial Documents by Month</Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={isRefreshing ? <CircularProgress size={20} /> : <Refresh />}
              variant="outlined"
              size="small"
              onClick={refreshDocuments}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="year-select-label">Year</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={selectedYear}
                label="Year"
                onChange={handleYearChange}
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                <TableCell>Month</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Expenses</TableCell>
                <TableCell align="right">Profit</TableCell>
                <TableCell align="right">Cash Flow</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MONTHS.map((month) => {
                const docsForMonth = monthlyDocuments[month] || [];
                
                // Calculate combined metrics from all documents for this month
                const monthMetrics = docsForMonth.reduce((acc, doc) => {
                  return {
                    revenue: (acc.revenue || 0) + (doc.metrics.revenue || 0),
                    expenses: (acc.expenses || 0) + (doc.metrics.expenses || 0),
                    profit: (acc.profit || 0) + (doc.metrics.profit || 0),
                    cashFlow: (acc.cashFlow || 0) + (doc.metrics.cashFlow || 0)
                  };
                }, { revenue: 0, expenses: 0, profit: 0, cashFlow: 0 });
                
                // Only display if there are documents or metrics
                const hasData = docsForMonth.length > 0 || 
                               Object.values(monthMetrics).some(val => val > 0);
                
                const rowColor = hasData ? '' : 'rgba(0,0,0,0.04)';
                
                return (
                  <TableRow key={month} hover sx={{ backgroundColor: rowColor }}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body1">{month}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedYear}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {docsForMonth.length > 0 ? (
                        <Stack direction="column" spacing={1}>
                          {docsForMonth.map(doc => (
                            <Chip 
                              key={doc.id}
                              icon={<PictureAsPdf fontSize="small" />}
                              label={doc.fileName}
                              component="a"
                              href={doc.fileUrl}
                              target="_blank"
                              clickable
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No documents uploaded
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(monthMetrics.revenue || undefined)}</TableCell>
                    <TableCell align="right">{formatCurrency(monthMetrics.expenses || undefined)}</TableCell>
                    <TableCell align="right">{formatCurrency(monthMetrics.profit || undefined)}</TableCell>
                    <TableCell align="right">{formatCurrency(monthMetrics.cashFlow || undefined)}</TableCell>
                    <TableCell align="center">
                      {hasData ? (
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<AttachMoney />}
                            disabled={!hasData}
                          >
                            View
                          </Button>
                          <Button 
                            size="small"
                            variant="contained"
                            startIcon={<ShowChart />}
                            disabled={!hasData}
                          >
                            Analyze
                          </Button>
                        </Stack>
                      ) : (
                        <Button
                          size="small"
                          disabled
                        >
                          No data
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Layout>
  );
};

export default FinancialRecords; 