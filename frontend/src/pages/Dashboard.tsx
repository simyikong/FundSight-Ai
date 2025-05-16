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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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
  const [budgetGoal, setBudgetGoal] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number | null>(null);
  const [loadingAISuggestion, setLoadingAISuggestion] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [addCategoryError, setAddCategoryError] = useState('');

  // Calculated summary values for cards and bars
  const totalBudget = categories.reduce((a, c) => a + c.allocated, 0);
  const totalSpent = categories.reduce((a, c) => a + c.spent, 0);
  const difference = totalBudget - totalSpent;
  const percentBudget = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0.0';
  const maxBudget = Math.max(...categories.map(c => c.allocated), 1);
  const maxExpense = Math.max(...categories.map(c => c.spent), 1);

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

  const handleAISuggestions = () => {
    // TODO: Replace this logic with real AI-powered budget allocation
    if (!budgetGoal || isNaN(Number(budgetGoal)) || Number(budgetGoal) <= 0) return;
    const newGoal = Number(budgetGoal);
    const perCat = Math.round(newGoal / categories.length);
    const newCategories: BudgetCategory[] = categories.map(cat => ({ ...cat, allocated: perCat }));
    setCategories(newCategories);
  };

  // Helper function for rendering a row in Budget/Expense card
  const renderBudgetExpenseRow = (
    cat: BudgetCategory,
    cardType: 'budget' | 'expense',
    editingId: string | null,
    editValue: number | null,
    setEditingId: (id: string | null) => void,
    setEditValue: (val: number | null) => void,
    setCategories: React.Dispatch<React.SetStateAction<BudgetCategory[]>>
  ) => (
    <Box
      key={cat.id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: 40,
        mb: 1,
        gap: 1
      }}
    >
      <Typography variant="caption" sx={{ minWidth: 90 }}>{cat.name}</Typography>
      <Box sx={{ flex: 1, mx: 1 }}>
        <Box sx={{
          width: '100%',
          height: 8,
          bgcolor: cardType === 'budget' ? '#e0f2ef' : '#e3e3f7',
          borderRadius: 2,
          position: 'relative'
        }}>
          <Box sx={{
            width: `${Math.min((cardType === 'budget' ? cat.allocated : cat.spent) / (cardType === 'budget' ? maxBudget : maxExpense) * 100, 100)}%`,
            height: '100%',
            bgcolor: cardType === 'budget' ? '#6fc7a3' : '#2d2553',
            borderRadius: 2,
            position: 'absolute',
            left: 0,
            top: 0
          }} />
        </Box>
      </Box>
      <Typography variant="caption" sx={{ minWidth: 50, textAlign: 'right' }}>
        {cardType === 'budget' ? cat.allocated.toLocaleString() : cat.spent.toLocaleString()}
      </Typography>
      {cardType === 'budget' && (
        editingId === cat.id ? (
          <>
            <input
              type="number"
              value={editValue ?? cat.allocated}
              onChange={e => setEditValue(Number(e.target.value))}
              style={{ width: 60, marginRight: 4 }}
            />
            <IconButton
              size="small"
              onClick={() => {
                setCategories(cats =>
                  cats.map(c =>
                    c.id === cat.id ? { ...c, allocated: editValue ?? cat.allocated } : c
                  )
                );
                setEditingId(null);
                setEditValue(null);
              }}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                setEditingId(null);
                setEditValue(null);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <IconButton
            size="small"
            onClick={() => {
              setEditingId(cat.id);
              setEditValue(cat.allocated);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )
      )}
      <IconButton onClick={() => {
        if (window.confirm(`Delete category "${cat.name}"?`)) {
          setCategories(prev => prev.filter(c => c.id !== cat.id));
        }
      }}>
        <DeleteOutlineIcon sx={{ color: theme.palette.text.secondary }} />
      </IconButton>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, bgcolor: theme.palette.background.default, minHeight: '100vh', borderRadius: 3, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          Financial Dashboard
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleReportClick}
            sx={{ background: theme.palette.primary.main, color: theme.palette.primary.contrastText, '&:hover': { background: theme.palette.primary.dark }, mr: 2 }}
          >
            Download AI Insights
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
          <Card sx={{ position: 'relative', height: '100%', background: theme.palette.background.paper, boxShadow: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                Financial Health Score
              </Typography>
              <Tooltip title="A score representing your overall financial health based on various metrics.">
                <InfoOutlined fontSize="small" sx={{ color: theme.palette.text.secondary, cursor: 'pointer' }} />
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
                <Cell key="cell-0" fill={theme.palette.success.main} />
                <Cell key="cell-1" fill={theme.palette.background.paper} />
              </Pie>
            </PieChart>
            <Box sx={{ position: 'absolute', top: 80, left: 0, width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
              <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>{healthScore}</Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>out of 100</Typography>
            </Box>
          </Card>
        </Grid>
        {/* Other Metrics with Tooltips */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: theme.palette.background.paper, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                  Monthly Revenue
                </Typography>
                <Tooltip title="Total income generated in the selected period.">
                  <InfoOutlined fontSize="small" sx={{ color: theme.palette.text.secondary, cursor: 'pointer' }} />
                </Tooltip>
              </Box>
              <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>$25,000</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.success.main }}>+12.5% from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: theme.palette.background.paper, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                  Monthly Expenses
                </Typography>
                <Tooltip title="Total costs incurred in the selected period.">
                  <InfoOutlined fontSize="small" sx={{ color: theme.palette.text.secondary, cursor: 'pointer' }} />
                </Tooltip>
              </Box>
              <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>$18,500</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.error.main }}>-2.1% from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: theme.palette.background.paper, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                  Cash Balance
                </Typography>
                <Tooltip title="Current available cash in your business accounts.">
                  <InfoOutlined fontSize="small" sx={{ color: theme.palette.text.secondary, cursor: 'pointer' }} />
                </Tooltip>
              </Box>
              <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>$45,000</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.success.main }}>+8.4% from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart & Reports Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left column: Revenue vs Expenses and Profit Margin & Growth Trends */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper 
              sx={{ 
                p: 3,
                background: theme.palette.background.paper,
                boxShadow: 3,
                borderRadius: 2
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Revenue vs Expenses
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip contentStyle={{ background: theme.palette.background.paper, border: 'none', color: theme.palette.text.primary }} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={theme.palette.primary.main} 
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke={theme.palette.warning.main} 
                      name="Expenses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="budget" 
                      stroke={theme.palette.success.main} 
                      name="Budget"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
            <Paper sx={{ p: 3, background: theme.palette.background.paper, boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Profit Margin & Growth Trends
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Jan', profitMargin: 22, revenueGrowth: 5 },
                    { name: 'Feb', profitMargin: 24, revenueGrowth: 7 },
                    { name: 'Mar', profitMargin: 23, revenueGrowth: 6 },
                    { name: 'Apr', profitMargin: 25, revenueGrowth: 8 },
                    { name: 'May', profitMargin: 27, revenueGrowth: 10 },
                    { name: 'Jun', profitMargin: 28, revenueGrowth: 12 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} unit="%" />
                    <RechartsTooltip contentStyle={{ background: theme.palette.background.paper, border: 'none', color: theme.palette.text.primary }} />
                    <Bar dataKey="profitMargin" fill={theme.palette.success.main} name="Profit Margin %" />
                    <Bar dataKey="revenueGrowth" fill={theme.palette.primary.main} name="Revenue Growth %" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>
        </Grid>
        {/* Right column: Monthly Expense Breakdown and Burn Rate vs MRR */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 3, background: theme.palette.background.paper, boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Monthly Expense Breakdown
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={[
                        { name: 'Payroll', value: 9000 },
                        { name: 'Marketing', value: 3500 },
                        { name: 'R&D', value: 2000 },
                        { name: 'Rent', value: 2500 },
                        { name: 'Logistics', value: 1200 },
                        { name: 'Miscellaneous', value: 800 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      fill={theme.palette.primary.main}
                      label
                    >
                      <Cell fill="#6fc7a3" />
                      <Cell fill="#2d2553" />
                      <Cell fill="#fbc02d" />
                      <Cell fill="#ff7043" />
                      <Cell fill="#42a5f5" />
                      <Cell fill="#bdbdbd" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
            <Paper sx={{ p: 3, background: theme.palette.background.paper, boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb:3, color: theme.palette.text.primary }}>
                Burn Rate vs MRR
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Jan', burn: 12000, mrr: 15000 },
                    { name: 'Feb', burn: 13000, mrr: 15500 },
                    { name: 'Mar', burn: 14000, mrr: 16000 },
                    { name: 'Apr', burn: 14500, mrr: 17000 },
                    { name: 'May', burn: 15000, mrr: 18000 },
                    { name: 'Jun', burn: 15500, mrr: 19000 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip contentStyle={{ background: theme.palette.background.paper, border: 'none', color: theme.palette.text.primary }} />
                    <Bar dataKey="burn" fill={theme.palette.error.main} name="Burn Rate" />
                    <Line type="monotone" dataKey="mrr" stroke={theme.palette.success.main} name="MRR" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Budget Planner & Recommendations Row */}
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 3, height: 635, background: theme.palette.background.paper, color: theme.palette.text.primary, boxShadow: 3, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                Budget Planner
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddCategoryOpen(true)}
                sx={{ background: theme.palette.primary.main, color: theme.palette.primary.contrastText, '&:hover': { background: theme.palette.primary.dark } }}
              >
                Add Category
              </Button>
            </Box>

            {/* Budget Goal Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <TextField
                label="Budget Goal"
                type="number"
                value={budgetGoal}
                onChange={e => setBudgetGoal(e.target.value)}
                size="small"
                sx={{ maxWidth: 180 }}
              />
              <Button
                variant="outlined"
                onClick={handleAISuggestions}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Get AI Suggestions
              </Button>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <List>
                {categories.map((category) => (
                  <ListItem
                    key={category.id}
                    sx={{
                      mb: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
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
                      primary={<span style={{ color: theme.palette.text.primary, fontWeight: 500 }}>{category.name}</span>}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Spent: ${category.spent.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Budget: ${category.allocated.toLocaleString()}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(getUtilizationPercentage(category.spent, category.allocated), 100)}
                            color={getUtilizationColor(getUtilizationPercentage(category.spent, category.allocated))}
                            sx={{ height: 8, borderRadius: 4, bgcolor: theme.palette.background.paper }}
                          />
                        </Box>
                      }
                    />
                    <IconButton onClick={() => handleOpenDialog(category)}>
                      <Edit sx={{ color: theme.palette.text.secondary }} />
                    </IconButton>
                    <IconButton onClick={() => {
                      if (window.confirm(`Delete category "${category.name}"?`)) {
                        setCategories(prev => prev.filter(cat => cat.id !== category.id));
                      }
                    }}>
                      <DeleteOutlineIcon sx={{ color: theme.palette.text.secondary }} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 3, height: 635, background: theme.palette.background.paper, color: theme.palette.text.primary, boxShadow: 3, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.text.primary, display: 'flex', alignItems: 'center' }}>
              <Lightbulb sx={{ mr: 1, color: theme.palette.warning.main }} />
              Smart Recommendations
            </Typography>
            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <List>
                {categories.map((category) => (
                  category.recommendations?.map((rec, index) => (
                    <ListItem key={`${category.id}-${index}`} sx={{ py: 1 }}>
                      <ListItemText
                        primary={<span style={{ color: theme.palette.text.primary }}>{rec}</span>}
                        secondary={<span style={{ color: theme.palette.text.secondary }}>{category.name}</span>}
                      />
                    </ListItem>
                  ))
                ))}
              </List>
            </Box>
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

      {/* Add Category Dialog */}
      <Dialog open={addCategoryOpen} onClose={() => setAddCategoryOpen(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Budget"
            type="number"
            fullWidth
            value={newCategoryBudget}
            onChange={e => setNewCategoryBudget(e.target.value)}
          />
          {addCategoryError && <Typography color="error" sx={{ mt: 1 }}>{addCategoryError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCategoryOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!newCategoryName.trim() || !newCategoryBudget.trim() || isNaN(Number(newCategoryBudget)) || Number(newCategoryBudget) <= 0) {
                setAddCategoryError('Please enter a valid name and positive budget.');
                return;
              }
              setCategories(prev => ([
                ...prev,
                {
                  id: (Date.now() + Math.random()).toString(),
                  name: newCategoryName.trim(),
                  allocated: Number(newCategoryBudget),
                  spent: 0,
                  recommendations: []
                }
              ]));
              setNewCategoryName('');
              setNewCategoryBudget('');
              setAddCategoryError('');
              setAddCategoryOpen(false);
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- TABLE AND SUMMARY SECTION --- */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Table Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0, overflow: 'hidden', height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
            <Table size="small" sx={{ height: '100%', tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#2d2553' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Budget</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Actual</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Difference</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>% of Budget</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((cat, idx) => {
                  const diff = cat.allocated - cat.spent;
                  const percent = (cat.spent / Math.max(cat.allocated, 1)) * 100;
                  return (
                    <TableRow key={cat.id} sx={{ height: `${200 / categories.length - 10}px` }}>
                      <TableCell sx={{ verticalAlign: 'middle' }}>{cat.name}</TableCell>
                      <TableCell sx={{ verticalAlign: 'middle' }}>{cat.allocated.toLocaleString()}</TableCell>
                      <TableCell sx={{ verticalAlign: 'middle' }}>{cat.spent.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: diff < 0 ? '#d32f2f' : '#2d2553', fontWeight: 500, verticalAlign: 'middle' }}>
                        {diff < 0 ? '-' : ''}{Math.abs(diff).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'middle' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 80, height: 8, bgcolor: '#e3e3f7', borderRadius: 2, mr: 1, position: 'relative' }}>
                            <Box sx={{
                              width: `${Math.min(percent, 100)}%`,
                              height: '100%',
                              bgcolor: percent > 100 ? '#d32f2f' : '#2d2553',
                              borderRadius: 2,
                              position: 'absolute',
                              left: 0,
                              top: 0
                            }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: percent > 100 ? '#d32f2f' : '#2d2553', fontWeight: 600 }}>{percent.toFixed(0)}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        {/* Summary Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 0, overflow: 'hidden', height: '100%' }}>
            <Box sx={{ height: 200, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
              <Box sx={{ borderRight: '1px solid #eee', borderBottom: '1px solid #eee', textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight={700}>{totalBudget.toLocaleString()}</Typography>
                <Typography>Total Budget</Typography>
              </Box>
              <Box sx={{ borderBottom: '1px solid #eee', textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight={700}>{totalSpent.toLocaleString()}</Typography>
                <Typography>Total Expenses</Typography>
              </Box>
              <Box sx={{ borderRight: '1px solid #eee', textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight={700}>{difference.toLocaleString()}</Typography>
                <Typography>Difference ($)</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight={700}>{percentBudget}%</Typography>
                <Typography>% of Budget</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;