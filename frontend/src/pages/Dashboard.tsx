import React, { useState, useEffect } from 'react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { dashboardApi } from '../services/api';

// Types
interface FinancialMetric {
  title: string;
  value: string;
  change: string;
  icon: React.ReactElement;
  color: string;
  tooltip: string;
}

interface ChartData {
  name: string;
  revenue: number;
  profit: number;
  cash_inflow: number;
  cash_outflow: number;
}

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  recommendations?: string[];
}

interface BudgetSuggestion {
  id: string;
  suggested: number;
}

// Mock data for Burn Rate vs MRR
const burnRateMRRData = [
  { name: 'Jan', burnRate: 12000, mrr: 14000 },
  { name: 'Feb', burnRate: 13000, mrr: 14500 },
  { name: 'Mar', burnRate: 13500, mrr: 15000 },
  { name: 'Apr', burnRate: 14000, mrr: 15500 },
  { name: 'May', burnRate: 15000, mrr: 16000 },
  { name: 'Jun', burnRate: 16000, mrr: 16500 },
];

// Mock recommendations
const smartRecommendations = [
{ text: 'Consider bulk purchasing for supplies and inventory', category: 'Operations' },
{ text: 'Review utility usage patterns and reduce waste', category: 'Operations' },
{ text: 'Focus on digital marketing channels for better outreach', category: 'Marketing' },
{ text: 'Optimize ad spend for maximum ROI', category: 'Marketing' },
{ text: 'Consider flexible staffing during peak periods and holidays', category: 'Staff' },
{ text: 'Plan equipment maintenance schedule to avoid downtime', category: 'Equipment' },
];

const getGaugeColor = (score: number) => {
  if (score >= 80) return '#43a047'; // green
  if (score >= 60) return '#fbc02d'; // yellow
  return '#e53935'; // red
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [reportAnchorEl, setReportAnchorEl] = useState<null | HTMLElement>(null);
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [healthScore, setHealthScore] = useState(0);
  const [infoString, setInfoString] = useState<string>('');

  // Calculated summary values for cards and bars
  const totalBudget = categories.reduce((a, c) => a + c.allocated, 0);
  const totalSpent = categories.reduce((a, c) => a + c.spent, 0);
  const difference = totalBudget - totalSpent;
  const percentBudget = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0.0';
  const maxBudget = Math.max(...categories.map(c => c.allocated), 1);
  const maxExpense = Math.max(...categories.map(c => c.spent), 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsData, chartData, budgetCategories] = await Promise.all([
          dashboardApi.getMetrics(),
          dashboardApi.getChartData(),
          dashboardApi.getBudgetCategories()
        ]);

        // Transform metrics data
        if (metricsData && Array.isArray(metricsData)) {
          setMetrics(metricsData.map(m => ({
            title: m.title,
            value: `RM${m.value.toLocaleString()}`,
            change: `${m.change > 0 ? '+' : ''}${m.change.toFixed(1)}%`,
            icon: m.title.includes('Revenue') ? <TrendingUp /> :
                  m.title.includes('Profit') ? <TrendingUp /> :
                  m.title.includes('MRR') ? <AccountBalance /> :
                  <Assessment />,
            color: m.color,
            tooltip: m.title === 'Monthly Revenue' ? 
              "This month's revenue rose by 7.1%, continuing a positive trend after a brief dip in August. The uptick reflects stronger client acquisition or improved billing cycles contributing to consistent top-line growth." :
              m.title === 'Net Profit' ?
              "A net profit of RM14,978.32 was recorded, maintaining profitability for the ninth consecutive month. This reflects disciplined expense control, especially in payroll and marketing, while sustaining revenue growth." :
              m.title === 'Monthly Recurring Revenue' ?
              "MRR dropped by 4.8%, reversing the prior month's gains. This shows a potential decline in active subscriptions or downgrades, prompting a need to review retention strategies and customer engagement." :
              m.tooltip
          })));
        }

        // Transform chart data
        if (chartData && chartData.historical && chartData.forecast) {
          const historicalData = chartData.historical.dates.map((date: string, index: number) => ({
            name: new Date(date).toLocaleDateString('en-US', { month: 'short' }),
            revenue: chartData.historical.revenue[index],
            profit: chartData.historical.profit[index],
            cash_inflow: chartData.historical.cash_inflow[index],
            cash_outflow: chartData.historical.cash_outflow[index]
          }));

          const forecastData = chartData.forecast.dates.map((date: string, index: number) => ({
            name: new Date(date).toLocaleDateString('en-US', { month: 'short' }),
            revenue: chartData.forecast.revenue[index],
            profit: chartData.forecast.profit[index],
            cash_inflow: chartData.forecast.cash_inflow[index],
            cash_outflow: chartData.forecast.cash_outflow[index]
          }));

          setChartData([...historicalData, ...forecastData]);
        }

        // Transform budget categories
        if (budgetCategories && Array.isArray(budgetCategories)) {
          setCategories(budgetCategories.map((cat, index) => ({
            id: (index + 1).toString(),
            name: cat.name,
            allocated: cat.budget,
            spent: cat.spent,
            recommendations: []
          })));
        }

        // Fetch health score
        fetch('http://localhost:8000/api/v1/dashboard/health-score-simple')
          .then(res => res.json())
          .then(data => setHealthScore(data.score ?? 0))
          .catch(() => setHealthScore(0));

      } catch (error) {
        console.error('Error fetching data:', error);
        // Set default empty states
        setMetrics([]);
        setChartData([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleReportClick = async () => {
    try {
      // Create a link element
      const a = document.createElement('a');
      // Set the href to the static PDF file in public directory
      a.href = '/Executive_Summary_Report_2024.pdf';
      // Set the download attribute with the desired filename
      a.download = 'Executive_Summary_Report_2024.pdf';
      // Append to body
      document.body.appendChild(a);
      // Trigger click
      a.click();
      // Clean up
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const getUtilizationPercentage = (spent: number, allocated: number) => {
    return (spent / allocated) * 100;
  };
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 90) return 'error';
    if (percentage > 75) return 'warning';
    return 'success';
  };

  const healthScoreData = [
    { name: 'Score', value: healthScore },
    { name: 'Remaining', value: 100 - healthScore },
  ];
  const healthScoreColors = ['#4CAF50', '#23263a'];

  const handleAISuggestions = () => {
    if (!budgetGoal || isNaN(Number(budgetGoal)) || Number(budgetGoal) <= 0) return;
    const total = Number(budgetGoal);
    if (categories.length === 0) return;
    // Generate random percentages that sum to 1
    const randoms = Array.from({ length: categories.length }, () => Math.random());
    const sum = randoms.reduce((a, b) => a + b, 0);
    const percentages = randoms.map(r => r / sum);
    // Calculate allocations
    let remaining = total;
    const allocations = percentages.map((p, idx) => {
      // For last category, assign all remaining to avoid floating point issues
      if (idx === categories.length - 1) return remaining;
      const alloc = Math.round(p * total * 100) / 100;
      remaining -= alloc;
      return alloc;
    });
    setCategories(categories.map((cat, idx) => ({
      ...cat,
      allocated: allocations[idx]
    })));
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
          borderRadius: 1,
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
        
          setCategories(prev => prev.filter(c => c.id !== cat.id));

      }}>
        <DeleteOutlineIcon sx={{ color: theme.palette.text.secondary }} />
      </IconButton>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, bgcolor: theme.palette.background.default, minHeight: '100vh', borderRadius: 3, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
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
        </Box>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} mb={2}>
        {/* Financial Health Score Card - FIRST CARD */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, position: 'relative' }}>
            <Box display="flex" alignItems="center" justifyContent="center" width="100%" mb={1} position="relative">
              <Typography variant="subtitle2" sx={{ width: '100%', textAlign: 'center', fontWeight: 600 , color: theme.palette.text.secondary}}>
                Financial Health Score
              </Typography>
              <Tooltip
                title={
                  <Box>
                    <span style={{ fontSize: 14, lineHeight: 1.5, color: '#fff' }}>
                      This score suggests a stable financial position with moderate strength in core metrics. Profitability contributes positively, reflecting sound cost control and revenue generation. Cash inflow consistently exceeds outflow, with an average ratio of 1.22, indicating healthy operational cash management. Liquidity levels show capacity to cover approximately 6.68 months of expenses, suggesting short-term resilience and prudent reserve planning.
                    </span>
                    <Box mt={2} display="flex" justifyContent="flex-end">
                      <button
                        style={{
                          background: '#4F8EF7',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 18px',
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(79,142,247,0.10)',
                        }}
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('open-ai-chatbot', {
                            detail: {
                              input: 'Based on the current financial health score of 69.17%, provide a brief analysis and suggest specific improvements based on overall financial info.'
                            }
                          }));
                        }}
                      >
                        Ask AI
                      </button>
                    </Box>
                  </Box>
                }
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: '#23263a',
                      color: '#fff',
                      p: 2,
                      borderRadius: 1,
                      boxShadow: 6,
                      maxWidth: 320,
                      fontSize: 14,
                      lineHeight: 1.6,
                      letterSpacing: 0.1,
                    }
                  }
                }}
                arrow
              >
                <InfoOutlined
                  fontSize="small"
                  sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', color: 'inherit', cursor: 'pointer' }}
                />
              </Tooltip>
            </Box>
            <Box sx={{ width: 140, height: 100, position: 'relative', mb: 1 }}>
              <RadialBarChart
                width={140}
                height={140}
                cx={70}
                cy={70}
                innerRadius={60}
                outerRadius={75}
                barSize={12}
                data={[
                  { value: 100, fill: '#23263a' },
                  { value: healthScore, fill: getGaugeColor(healthScore) }
                ]}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background
                  dataKey="value"
                />
              </RadialBarChart>
              <Box
                sx={{
                  position: 'absolute',
                  top: 48,
                  left: 0,
                  width: '100%',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  {healthScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  out of 100
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" width="100%" px={2}>
              <Typography variant="caption" color="#43a047">LOW</Typography>
              <Typography variant="caption" color="#e53935">HIGH</Typography>
            </Box>
          </Paper>
        </Grid>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', background: theme.palette.background.paper, boxShadow: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
              <CardContent sx={{ width: '100%', p: '0 !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative', mb: 3 , mt: -10, minHeight: 32 }}>
                  <Typography variant="subtitle2" sx={{ width: '100%', textAlign: 'center', fontWeight: 600, color: theme.palette.text.secondary, lineHeight: '32px' }}>
                    {metric.title}
                  </Typography>
                  <Tooltip
                    title={
                      <Box>
                        <span style={{ 
                          fontSize: 14, 
                          lineHeight: 1.5, 
                          color: '#fff',
                          whiteSpace: 'pre-wrap',
                          display: 'block'
                        }}>
                          {metric.tooltip.replace(/###/g, '')}
                        </span>
                        <Box mt={2} display="flex" justifyContent="flex-end">
                          <button
                            style={{
                              background: '#4F8EF7',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 18px',
                              fontWeight: 600,
                              fontSize: 14,
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(79,142,247,0.10)',
                            }}
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('open-ai-chatbot', {
                                detail: {
                                  input: `Based on the current ${metric.title} of ${metric.value}, provide a brief analysis and suggest specific improvements based on overall financial info.`
                                }
                              }));
                            }}
                          >
                            Ask AI
                          </button>
                        </Box>
                      </Box>
                    }
                    componentsProps={{
                      tooltip: {
                        sx: {
                          bgcolor: '#23263a',
                          color: '#fff',
                          p: 2,
                          borderRadius: 1,
                          boxShadow: 6,
                          maxWidth: 320,
                          fontSize: 14,
                          lineHeight: 1.6,
                          letterSpacing: 0.1,
                        }
                      }
                    }}
                    arrow
                  >
                    <InfoOutlined
                      fontSize="small"
                      sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', color: theme.palette.text.secondary, cursor: 'pointer' }}
                    />
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' , mb:  - 19 }}>
                  <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', textAlign: 'center' , mb : 2 }}>
                    {metric.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: metric.change.startsWith('+') ? theme.palette.success.main : theme.palette.error.main,
                      textAlign: 'center',
                      mt: 0.5
                    }}
                  >
                    {metric.change} from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
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
                borderRadius: 1
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
                      dataKey="cash_outflow" 
                      stroke={theme.palette.warning.main} 
                      name="Expenses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke={theme.palette.success.main} 
                      name="Profit"
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
        {/* Right column: Monthly Expense Breakdown and Burn Rate vs MRR stacked */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Monthly Expense Breakdown */}
            <Paper sx={{ p: 3, background: theme.palette.background.paper, boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Monthly Expense Breakdown
              </Typography>
              <Box sx={{ height: 200, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={categories.map(cat => ({
                        name: cat.name,
                        value: cat.spent
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }) => {
                        // Position label outside arc
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 18;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        const colorPalette = [
                          '#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#A020F0', '#FF5252', '#43a047', '#FFD600', '#e53935', '#fbc02d', '#2d2553', '#6fc7a3', '#23263a'
                        ];
                        return (
                          <text
                            x={x}
                            y={y}
                            fill={colorPalette[index % colorPalette.length]}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            fontSize={16}
                            fontWeight={600}
                          >
                            {value > 0 ? value.toLocaleString() : ''}
                          </text>
                        );
                      }}
                      isAnimationActive={false}
                    >
                      {categories.map((_, index) => {
                        const colorPalette = [
                          '#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#A020F0', '#FF5252', '#43a047', '#FFD600', '#e53935', '#fbc02d', '#2d2553', '#6fc7a3', '#23263a'
                        ];
                        return <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />;
                      })}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length && payload[0]) {
                          const data = payload[0];
                          return (
                            <Paper
                              sx={{
                                p: 1.5,
                                background: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                                borderRadius: 2,
                                boxShadow: 3,
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                {data.name}
                              </Typography>
                              <Typography variant="body2">
                                Spent: <span style={{ color: data.color, fontWeight: 600 }}>{typeof data.value === 'number' ? data.value.toLocaleString() : ''}</span>
                              </Typography>
                            </Paper>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend on hover */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                  id="expense-legend-hover"
                />
              </Box>
            </Paper>
            {/* Burn Rate vs MRR */}
            <Paper sx={{ p: 3, background: theme.palette.background.paper, boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
                Burn Rate vs MRR
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={burnRateMRRData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip contentStyle={{ background: theme.palette.background.paper, border: 'none', color: theme.palette.text.primary }} />
                    <Bar dataKey="burnRate" fill="#FF5252" name="Burn Rate" barSize={24} />
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
                InputProps={{
                  inputProps: { min: 0, style: { MozAppearance: 'textfield' } },
                  sx: {
                    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                    '& input[type=number]': {
                      MozAppearance: 'textfield',
                    },
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAISuggestions}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Get AI Suggestions
              </Button>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0,
                '&::-webkit-scrollbar': {
                  width: 8,
                  background: '#18192a',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#23263a',
                  borderRadius: 8,
                },
                scrollbarColor: '#23263a #18192a',
                scrollbarWidth: 'thin',
              }}
            >
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
                              Spent: RM{category.spent.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Budget: RM{category.allocated.toLocaleString()}
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
                      
                        setCategories(prev => prev.filter(cat => cat.id !== category.id));
                      
                    }}>
                      <DeleteOutlineIcon sx={{ color: theme.palette.text.secondary }} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: theme.palette.background.paper, color: theme.palette.text.primary, boxShadow: 3, borderRadius: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LightbulbIcon sx={{ color: '#FFD600', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">Smart Recommendations</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 40px)' }}>
              {smartRecommendations.map((rec, idx) => (
                <Box key={idx} mb={0.5} sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="body1">{rec.text}</Typography>
                  <Typography variant="body2" color="text.secondary">{rec.category}</Typography>
                </Box>
              ))}
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
              startAdornment: <Typography sx={{ mr: 1 }}>RM</Typography>
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
            InputProps={{
              inputProps: { min: 0, style: { MozAppearance: 'textfield' } },
              sx: {
                '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
                '& input[type=number]': {
                  MozAppearance: 'textfield',
                },
              }
            }}
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
    </Container>
  );
};

export default Dashboard;