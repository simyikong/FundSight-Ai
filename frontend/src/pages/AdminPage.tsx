import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Link,
  Tab,
  Tabs,
  Chip
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Delete as DeleteIcon, 
  PlayArrow as RunIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  DataArray as DataIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Table {
  name: string;
  row_count: number;
}

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any) => string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AdminPage = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [queryColumns, setQueryColumns] = useState<Column[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<{ table: string; id: number } | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
  const [analyzeYear, setAnalyzeYear] = useState(new Date().getFullYear());
  const [analyzeMonth, setAnalyzeMonth] = useState(new Date().getMonth() + 1);
  
  // Fetch tables on component mount
  useEffect(() => {
    fetchTables();
  }, []);

  // Fetch table data when a table is selected
  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable, page + 1, rowsPerPage);
    }
  }, [selectedTable, page, rowsPerPage]);

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/admin/tables');
      setTables(response.data.tables);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error fetching database tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName: string, page: number, pageSize: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/admin/table/${tableName}`, {
        params: { page, page_size: pageSize }
      });
      
      // Convert columns to the format expected by the table
      const columnData: Column[] = response.data.columns.map((col: string) => ({
        id: col,
        label: col,
        minWidth: 100
      }));
      
      setColumns(columnData);
      setTableData(response.data.data);
      setTotalCount(response.data.pagination.total_count);
    } catch (err: any) {
      setError(err.response?.data?.detail || `Error fetching data from table ${tableName}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    setPage(0);
  };

  const handleSqlQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSqlQuery(event.target.value);
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/admin/execute-query', {
        query: sqlQuery
      });
      
      // Convert columns to the format expected by the table
      if (response.data.columns && response.data.columns.length > 0) {
        const columnData: Column[] = response.data.columns.map((col: string) => ({
          id: col,
          label: col,
          minWidth: 100
        }));
        
        setQueryColumns(columnData);
        setQueryResult(response.data.data);
      } else {
        setQueryColumns([]);
        setQueryResult([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error executing SQL query');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow = (tableName: string, rowId: number) => {
    setRowToDelete({ table: tableName, id: rowId });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRow = async () => {
    if (!rowToDelete) return;
    
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:8000/api/v1/admin/table/${rowToDelete.table}/row/${rowToDelete.id}`);
      
      // Refresh table data
      if (selectedTable === rowToDelete.table) {
        fetchTableData(selectedTable, page + 1, rowsPerPage);
      }
      
      // Close dialog
      setDeleteDialogOpen(false);
      setRowToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || `Error deleting row ${rowToDelete.id} from table ${rowToDelete.table}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteRow = () => {
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const openAnalyzeDialog = () => {
    setAnalyzeDialogOpen(true);
  };

  const closeAnalyzeDialog = () => {
    setAnalyzeDialogOpen(false);
  };

  const handleForceAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`http://localhost:8000/api/v1/admin/force-analyze/${analyzeYear}/${analyzeMonth}`);
      closeAnalyzeDialog();
    } catch (err: any) {
      setError(err.response?.data?.detail || `Error analyzing period ${analyzeMonth}/${analyzeYear}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Database Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your SQLite database directly through this interface. View tables, run queries, and manage records.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Tables" />
            <Tab label="SQL Query" />
            <Tab label="Tools" />
          </Tabs>
        </Box>

        {/* Tables Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Database Tables</Typography>
                <Tooltip title="Refresh Tables">
                  <IconButton onClick={fetchTables} size="small" color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Paper 
                elevation={2} 
                sx={{ 
                  overflow: 'auto', 
                  maxHeight: 'calc(100vh - 300px)',
                  minHeight: '200px'
                }}
              >
                {tables.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    {loading ? (
                      <LinearProgress />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No tables found
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                    {tables.map((table) => (
                      <Box
                        component="li"
                        key={table.name}
                        sx={{
                          p: 2,
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                          cursor: 'pointer',
                          backgroundColor: selectedTable === table.name ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                          },
                        }}
                        onClick={() => handleTableClick(table.name)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">{table.name}</Typography>
                          <Chip
                            label={`${table.row_count} rows`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={9}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {selectedTable ? `Table: ${selectedTable}` : 'Select a table to view data'}
                </Typography>
              </Box>
              <Paper 
                elevation={2}
                sx={{ 
                  width: '100%', 
                  overflow: 'hidden',
                  minHeight: '200px',
                  maxHeight: 'calc(100vh - 300px)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {loading && <LinearProgress />}
                
                {selectedTable ? (
                  <>
                    <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                      <Table stickyHeader aria-label="data table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Actions</TableCell>
                            {columns.map((column) => (
                              <TableCell
                                key={column.id}
                                style={{ minWidth: column.minWidth }}
                              >
                                {column.label}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tableData.map((row, index) => (
                            <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                              <TableCell>
                                <Tooltip title="Delete row">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleDeleteRow(selectedTable, row.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                              {columns.map((column) => {
                                const value = row[column.id];
                                return (
                                  <TableCell key={column.id}>
                                    {column.format ? column.format(value) : 
                                      value === null ? "NULL" : 
                                      typeof value === 'object' ? JSON.stringify(value) : 
                                      String(value)}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[10, 20, 50]}
                      component="div"
                      count={totalCount}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </>
                ) : (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '100%',
                      p: 3
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Select a table from the left panel to view its data
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* SQL Query Tab */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">SQL Query</Typography>
                <Typography variant="body2" color="text.secondary">
                  Run custom SQL queries (SELECT only)
                </Typography>
              </Box>
              <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <TextField
                  label="SQL Query"
                  placeholder="SELECT * FROM documents LIMIT 10"
                  multiline
                  rows={4}
                  value={sqlQuery}
                  onChange={handleSqlQueryChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleExecuteQuery}
                  startIcon={<RunIcon />}
                  disabled={!sqlQuery.trim()}
                >
                  Execute Query
                </Button>
              </Paper>
              
              <Paper 
                elevation={2}
                sx={{ 
                  width: '100%', 
                  overflow: 'hidden',
                  minHeight: '200px',
                  maxHeight: 'calc(100vh - 450px)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {loading && <LinearProgress />}
                
                {queryColumns.length > 0 ? (
                  <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
                    <Table stickyHeader aria-label="query result table">
                      <TableHead>
                        <TableRow>
                          {queryColumns.map((column) => (
                            <TableCell
                              key={column.id}
                              style={{ minWidth: column.minWidth }}
                            >
                              {column.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {queryResult.map((row, index) => (
                          <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                            {queryColumns.map((column) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id}>
                                  {column.format ? column.format(value) : 
                                    value === null ? "NULL" : 
                                    typeof value === 'object' ? JSON.stringify(value) : 
                                    String(value)}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '100%',
                      p: 3
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Execute a query to see results
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tools Tab */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DataIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Force Analyze Monthly Metrics</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Force the system to associate documents with a specific month/year for financial metrics.
                    This can help fix issues with missing data in the financial table.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={openAnalyzeDialog}
                    startIcon={<CheckIcon />}
                  >
                    Force Analyze Period
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={cancelDeleteRow}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete row ID {rowToDelete?.id} from table '{rowToDelete?.table}'?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDeleteRow} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDeleteRow} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Force Analyze Dialog */}
        <Dialog
          open={analyzeDialogOpen}
          onClose={closeAnalyzeDialog}
          aria-labelledby="analyze-dialog-title"
        >
          <DialogTitle id="analyze-dialog-title">
            Force Analyze Period
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Select the year and month to force analyze. This will associate all documents tagged with this period
              to the financial metrics.
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Year"
                  type="number"
                  value={analyzeYear}
                  onChange={(e) => setAnalyzeYear(parseInt(e.target.value))}
                  fullWidth
                  inputProps={{ min: 1900, max: 2100 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Month"
                  type="number"
                  value={analyzeMonth}
                  onChange={(e) => setAnalyzeMonth(parseInt(e.target.value))}
                  fullWidth
                  inputProps={{ min: 1, max: 12 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAnalyzeDialog} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={handleForceAnalyze} 
              color="primary" 
              variant="contained"
              autoFocus
            >
              Force Analyze
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminPage; 