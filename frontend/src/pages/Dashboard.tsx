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
  Tab,
  Tabs,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  MoreVert,
  Download,
  Assessment,
  Add,
  Edit,
  Lightbulb,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Types
interface FinancialMetric {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
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
  const [activeTab, setActiveTab] = useState(0);

  // Sample data - Replace with actual data from your backend
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

  const [categories] = useState<BudgetCategory[]>([
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getUtilizationPercentage = (spent: number, allocated: number) => {
    return (spent / allocated) * 100;
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage > 90) return 'error';
    if (percentage > 75) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Financial Dashboard
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleReportClick}
            sx={{ mr: 2 }}
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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Budget Planning" />
          <Tab label="Reports" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
          {/* Financial Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {metrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          {metric.title}
                        </Typography>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {metric.value}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: metric.change.startsWith('+') ? 'success.main' : 'error.main',
                            fontWeight: 'medium'
                          }}
                        >
                          {metric.change} from last month
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          backgroundColor: `${metric.color}15`,
                          borderRadius: '50%',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {React.cloneElement(metric.icon as React.ReactElement, { 
                          sx: { color: metric.color, fontSize: 28 } 
                        })}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 3,
                  height: '100%',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Revenue vs Expenses
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
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
          </Grid>
        </>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Budget Categories */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Budget Categories
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {/* Implement add category */}}
                >
                  Add Category
                </Button>
              </Box>
              {categories.map((category) => (
                <Paper
                  key={category.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {category.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Typography variant="body2">
                          Spent: ${category.spent.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Budget: ${category.allocated.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton>
                      <Edit />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Paper>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                <Lightbulb sx={{ mr: 1, color: 'warning.main' }} />
                Smart Recommendations
              </Typography>
              {categories.map((category) => (
                category.recommendations?.map((rec, index) => (
                  <Paper
                    key={`${category.id}-${index}`}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {rec}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.name}
                    </Typography>
                  </Paper>
                ))
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Financial Reports
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Profit & Loss Statement</Typography>
                      <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Cash Flow Statement</Typography>
                      <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Balance Sheet</Typography>
                      <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
);
};

export default Dashboard;