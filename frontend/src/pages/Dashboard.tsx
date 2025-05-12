import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Menu,
  MenuItem,
  useTheme,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Assessment,
  Add,
  Edit,
  Lightbulb,
  Download,
  InfoOutlined,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Types
interface FinancialMetric {
  title: string;
  value: string;
  change: string;
  icon: React.ReactElement;
  color: string;
}

interface ChartData {
  name: string;
  revenue: number;
  expenses: number;
  budget: number;
}

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  recommendations?: string[];
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [reportAnchorEl, setReportAnchorEl] = useState<null | HTMLElement>(null);
  const [metrics] = useState<FinancialMetric[]>([
    {
      title: 'Financial Health Score',
      value: '85/100',
      change: '+5',
      icon: <Assessment />,
      color: '#4CAF50'
    },
    {
      title: 'Monthly Revenue',
      value: '$25,000',
      change: '+12.5%',
      icon: <TrendingUp />,
      color: '#2196F3'
    },
    {
      title: 'Monthly Expenses',
      value: '$18,500',
      change: '-2.1%',
      icon: <TrendingDown />,
      color: '#FF9800'
    },
    {
      title: 'Cash Balance',
      value: '$45,000',
      change: '+8.4%',
      icon: <AccountBalance />,
      color: '#9C27B0'
    }
  ]);

  const [chartData] = useState<ChartData[]>([
    { name: 'Jan', revenue: 25000, expenses: 18500, budget: 20000 },
    { name: 'Feb', revenue: 28000, expenses: 19000, budget: 20000 },
    { name: 'Mar', revenue: 30000, expenses: 19500, budget: 20000 },
    { name: 'Apr', revenue: 32000, expenses: 20000, budget: 20000 },
    { name: 'May', revenue: 35000, expenses: 21000, budget: 20000 },
    { name: 'Jun', revenue: 38000, expenses: 22000, budget: 20000 },
  ]);

  // Budget Planner State
  const [categories, setCategories] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: 'Operations',
      allocated: 8000,
      spent: 7200,
      recommendations: ['Consider bulk purchasing for supplies', 'Review utility usage patterns']
    },
    {
      id: '2',
      name: 'Marketing',
      allocated: 5000,
      spent: 4500,
      recommendations: ['Focus on digital marketing channels', 'Optimize ad spend']
    },
    {
      id: '3',
      name: 'Staff',
      allocated: 12000,
      spent: 12000,
      recommendations: ['Consider flexible staffing during peak periods']
    },
    {
      id: '4',
      name: 'Equipment',
      allocated: 3000,
      spent: 2800,
      recommendations: ['Plan equipment maintenance schedule']
    }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  const [newAllocation, setNewAllocation] = useState('');

  const handleOpenDialog = (category: BudgetCategory) => {
    setSelectedCategory(category);
    setNewAllocation(category.allocated.toString());
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
    setNewAllocation('');
  };
  const handleUpdateBudget = () => {
    if (selectedCategory && newAllocation) {
      setCategories(categories.map(cat =>
        cat.id === selectedCategory.id
          ? { ...cat, allocated: Number(newAllocation) }
          : cat
      ));
      handleCloseDialog();
    }
  };

  const handleReportClick = (event: React.MouseEvent<HTMLElement>) => {
    setReportAnchorEl(event.currentTarget);
  };
  const handleReportClose = () => {
    setReportAnchorEl(null);
  };
  const handleDownloadReport = (type: string) => {
    // Implement report download logic
    console.log(`Downloading ${type} report...`);
    handleReportClose();
  };

  const getUtilizationPercentage = (spent: number, allocated: number) => {
    return (spent / allocated) * 100;
  };
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 90) return 'error';
    if (percentage > 75) return 'warning';
    return 'success';
  };

  const healthScore = 85;
  const healthScoreData = [
    { name: 'Score', value: healthScore },
    { name: 'Remaining', value: 100 - healthScore },
  ];
  const healthScoreColors = ['#4CAF50', '#23263a'];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, bgcolor: '#11131a', minHeight: '100vh', borderRadius: 3, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
          Financial Dashboard
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleReportClick}
            sx={{ background: '#1976d2', color: '#fff', '&:hover': { background: '#1565c0' }, mr: 2 }}
          >
            Download Reports
          </Button>
          <Menu
            anchorEl={reportAnchorEl}
            open={Boolean(reportAnchorEl)}
            onClose={handleReportClose}
          >
            <MenuItem onClick={() => handleDownloadReport('monthly')}>Monthly Report</MenuItem>
            <MenuItem onClick={() => handleDownloadReport('quarterly')}>Quarterly Report</MenuItem>
            <MenuItem onClick={() => handleDownloadReport('annual')}>Annual Report</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Health Score Ring Chart */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ position: 'relative', height: '100%', background: 'linear-gradient(145deg, #181a23 0%, #23263a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#bfc7d5' }}>
                Financial Health Score
              </Typography>
              <Tooltip title="A score representing your overall financial health based on various metrics.">
                <InfoOutlined fontSize="small" sx={{ color: '#bfc7d5', cursor: 'pointer' }} />
              </Tooltip>
            </Box>
            <PieChart width={120} height={120}>
              <Pie
                data={healthScoreData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={55}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                {healthScoreData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={healthScoreColors[idx]} />
                ))}
              </Pie>
            </PieChart>
            <Box sx={{ position: 'absolute', top: 80, left: 0, width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>{healthScore}</Typography>
              <Typography variant="caption" sx={{ color: '#bfc7d5' }}>out of 100</Typography>
            </Box>
          </Card>
        </Grid>
        {/* Other Metrics with Tooltips */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(145deg, #181a23 0%, #23263a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#bfc7d5' }}>
                  Monthly Revenue
                </Typography>
                <Tooltip title="Total income generated in the selected period.">
                  <InfoOutlined fontSize="small" sx={{ color: '#bfc7d5', cursor: 'pointer' }} />
                </Tooltip>
              </Box>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>$25,000</Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50' }}>+12.5% from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(145deg, #181a23 0%, #23263a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#bfc7d5' }}>
                  Monthly Expenses
                </Typography>
                <Tooltip title="Total costs incurred in the selected period.">
                  <InfoOutlined fontSize="small" sx={{ color: '#bfc7d5', cursor: 'pointer' }} />
                </Tooltip>
              </Box>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>$18,500</Typography>
              <Typography variant="body2" sx={{ color: '#FF5252' }}>-2.1% from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(145deg, #181a23 0%, #23263a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#bfc7d5' }}>
                  Cash Balance
                </Typography>
                <Tooltip title="Current available cash in your business accounts.">
                  <InfoOutlined fontSize="small" sx={{ color: '#bfc7d5', cursor: 'pointer' }} />
                </Tooltip>
              </Box>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>$45,000</Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50' }}>+8.4% from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart & Reports Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3,
              height: '100%',
              background: 'linear-gradient(145deg, #181a23 0%, #23263a 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#fff' }}>
              Revenue vs Expenses
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33364a" />
                  <XAxis dataKey="name" stroke="#bfc7d5" />
                  <YAxis stroke="#bfc7d5" />
                  <RechartsTooltip contentStyle={{ background: '#23263a', border: 'none', color: '#fff' }} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2196F3" 
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#FF9800" 
                    name="Expenses"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="budget" 
                    stroke="#4CAF50" 
                    name="Budget"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: 'linear-gradient(145deg, #181a23 0%, #23263a 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#fff' }}>
              Financial Reports
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card sx={{ background: 'none', boxShadow: 'none', color: '#fff', border: '1px solid #33364a', mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">Profit & Loss Statement</Typography>
                    <Button variant="outlined" fullWidth sx={{ mt: 2, color: '#2196F3', borderColor: '#2196F3' }}>
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ background: 'none', boxShadow: 'none', color: '#fff', border: '1px solid #33364a', mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">Cash Flow Statement</Typography>
                    <Button variant="outlined" fullWidth sx={{ mt: 2, color: '#2196F3', borderColor: '#2196F3' }}>
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ background: 'none', boxShadow: 'none', color: '#fff', border: '1px solid #33364a' }}>
                  <CardContent>
                    <Typography variant="h6">Balance Sheet</Typography>
                    <Button variant="outlined" fullWidth sx={{ mt: 2, color: '#2196F3', borderColor: '#2196F3' }}>
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Budget Planner & Recommendations Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, background: 'linear-gradient(145deg, #181a23 0%, #23263a 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
                Budget Planner
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {/* Implement add category */}}
                sx={{ background: '#1976d2', color: '#fff', '&:hover': { background: '#1565c0' } }}
              >
                Add Category
              </Button>
            </Box>
            <List>
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  sx={{
                    mb: 2,
                    border: '1px solid',
                    borderColor: '#33364a',
                    borderRadius: 1,
                    bgcolor: '#23263a',
                    color: '#fff',
                  }}
                >
                  <ListItemIcon>
                    {category.spent > category.allocated ? (
                      <TrendingUp color="error" />
                    ) : (
                      <TrendingDown color="success" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ color: '#fff', fontWeight: 500 }}>{category.name}</span>}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#bfc7d5' }}>
                            Spent: ${category.spent.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#bfc7d5' }}>
                            Budget: ${category.allocated.toLocaleString()}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(getUtilizationPercentage(category.spent, category.allocated), 100)}
                          color={getUtilizationColor(getUtilizationPercentage(category.spent, category.allocated))}
                          sx={{ height: 8, borderRadius: 4, bgcolor: '#181a23' }}
                        />
                      </Box>
                    }
                  />
                  <IconButton onClick={() => handleOpenDialog(category)}>
                    <Edit sx={{ color: '#bfc7d5' }} />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: 'linear-gradient(145deg, #181a23 0%, #23263a 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#fff', display: 'flex', alignItems: 'center' }}>
              <Lightbulb sx={{ mr: 1, color: 'warning.main' }} />
              Smart Recommendations
            </Typography>
            <List>
              {categories.map((category) => (
                category.recommendations?.map((rec, index) => (
                  <ListItem key={`${category.id}-${index}`} sx={{ py: 1 }}>
                    <ListItemText
                      primary={<span style={{ color: '#fff' }}>{rec}</span>}
                      secondary={<span style={{ color: '#bfc7d5' }}>{category.name}</span>}
                    />
                  </ListItem>
                ))
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Budget Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Adjust Budget Allocation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Budget Amount"
            type="number"
            fullWidth
            value={newAllocation}
            onChange={(e) => setNewAllocation(e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateBudget} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;