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
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import Layout from '../components/Layout';
import { BulkUploadSection } from '../components/FinancialRecords';
import { PictureAsPdf, AttachMoney, ShowChart, Refresh } from '@mui/icons-material';
import { metricsApi } from '../services';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Interface for monthly financial data
interface MonthData {
  hasData: boolean;
  documents: {
    id: string | number;
    filename: string;
  }[];
  metrics: {
    revenue: number;
    expenses: number;
    profit: number;
    cashFlow: number;
  };
  lastAnalysisDate: string | null;
}

interface YearlyData {
  year: number;
  months: Record<string, MonthData>;
}

const FinancialRecords: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearlyData, setYearlyData] = useState<YearlyData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // Years for selection (current year and 2 years back)
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
  
  // Fetch data when year changes
  useEffect(() => {
    fetchYearlyData(selectedYear);
  }, [selectedYear]);
  
  // Function to fetch yearly data from API
  const fetchYearlyData = async (year: number) => {
    setIsLoading(true);
    try {
      const data = await metricsApi.getYearlyTable(year);
      setYearlyData(data);
    } catch (error) {
      console.error(`Error fetching data for year ${year}:`, error);
      // If API fails, set empty data structure
      setYearlyData({
        year,
        months: MONTHS.reduce((acc, month) => {
          acc[month] = {
            hasData: false,
            documents: [],
            metrics: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0 },
            lastAnalysisDate: null
          };
          return acc;
        }, {} as Record<string, MonthData>)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(Number(event.target.value));
  };

  // Format currency helper
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(value);
  };

  // Refresh data from the server
  const refreshDocuments = async () => {
    setIsRefreshing(true);
    try {
      await fetchYearlyData(selectedYear);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Analyze financial metrics for a specific month
  const handleAnalyzeMonth = async (month: string) => {
    try {
      // Convert month name to number (1-12)
      const monthIndex = MONTHS.indexOf(month) + 1;
      
      if (!yearlyData || !yearlyData.months[month]) return;
      
      const monthData = yearlyData.months[month];
      const documentIds = monthData.documents.map(doc => Number(doc.id));
      
      if (documentIds.length === 0) {
        showSnackbar("No documents available for analysis for this month", "warning");
        return;
      }
      
      setIsRefreshing(true);
      await metricsApi.analyzeFinancialMetrics(selectedYear, monthIndex, documentIds);
      
      // Refresh the data to show new analysis
      await fetchYearlyData(selectedYear);
      showSnackbar(`Analysis for ${month} ${selectedYear} completed successfully`, "success");
    } catch (error) {
      console.error(`Error analyzing ${month} ${selectedYear}:`, error);
      showSnackbar(`Error analyzing ${month} ${selectedYear}`, "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle documents added to records - auto trigger force analyze
  const handleDocumentsAddedToRecords = async (documents: { id: string | number, year?: number, month?: number }[]) => {
    if (documents.length === 0) return;
    
    setIsRefreshing(true);
    try {
      // Group documents by year/month
      const periodGroups: Record<string, { year: number, month: number, ids: number[] }> = {};
      
      for (const doc of documents) {
        if (doc.year && doc.month) {
          const key = `${doc.year}-${doc.month}`;
          if (!periodGroups[key]) {
            periodGroups[key] = { year: doc.year, month: doc.month, ids: [] };
          }
          // Convert id to number if it's a string
          periodGroups[key].ids.push(typeof doc.id === 'string' ? parseInt(doc.id) : doc.id);
        }
      }
      
      // Process each group
      for (const key in periodGroups) {
        const group = periodGroups[key];
        await metricsApi.forceAnalyze(group.year, group.month, group.ids);
        showSnackbar(`Documents for ${MONTHS[group.month-1]} ${group.year} have been analyzed`, "success");
      }
      
      // Refresh the table data
      await fetchYearlyData(selectedYear);
    } catch (error) {
      console.error('Error auto-analyzing documents:', error);
      showSnackbar('Failed to auto-analyze some documents', "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show snackbar helper
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Layout
      title="Financial Records"
      subtitle="Upload, organize, and analyze your financial documents"
    >
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <BulkUploadSection onDocumentsAddedToRecords={handleDocumentsAddedToRecords} />
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

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
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
                  // Get data for this month from API response
                  const monthData = yearlyData?.months[month] || {
                    hasData: false,
                    documents: [],
                    metrics: { revenue: 0, expenses: 0, profit: 0, cashFlow: 0 },
                    lastAnalysisDate: null
                  };
                  
                  const hasData = monthData.hasData;
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
                        {monthData.documents.length > 0 ? (
                          <Stack direction="column" spacing={1}>
                            {monthData.documents.map(doc => (
                              <Chip 
                                key={doc.id}
                                icon={<PictureAsPdf fontSize="small" />}
                                label={doc.filename}
                                component="a"
                                href={`/api/v1/documents/${doc.id}/download`} // Assuming you'll add a download endpoint
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
                      <TableCell align="right">{formatCurrency(monthData.metrics.revenue || undefined)}</TableCell>
                      <TableCell align="right">{formatCurrency(monthData.metrics.expenses || undefined)}</TableCell>
                      <TableCell align="right">{formatCurrency(monthData.metrics.profit || undefined)}</TableCell>
                      <TableCell align="right">{formatCurrency(monthData.metrics.cashFlow || undefined)}</TableCell>
                      <TableCell align="center">
                        {monthData.documents.length > 0 ? (
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button 
                              size="small" 
                              variant="outlined" 
                              startIcon={<AttachMoney />}
                              disabled={monthData.documents.length === 0}
                            >
                              View
                            </Button>
                            <Button 
                              size="small"
                              variant="contained"
                              startIcon={<ShowChart />}
                              disabled={monthData.documents.length === 0}
                              onClick={() => handleAnalyzeMonth(month)}
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
        )}
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default FinancialRecords; 