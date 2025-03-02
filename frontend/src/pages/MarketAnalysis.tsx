import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { getMarketAnalysis, getDashboardStats } from '../utils/api';
import { DashboardStats, CategoryStat } from '../types';

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
      id={`market-tabpanel-${index}`}
      aria-labelledby={`market-tab-${index}`}
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

const a11yProps = (index: number) => {
  return {
    id: `market-tab-${index}`,
    'aria-controls': `market-tabpanel-${index}`,
  };
};

const MarketAnalysis: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, marketAnalysisData] = await Promise.all([
          getDashboardStats(),
          getMarketAnalysis()
        ]);
        
        setStats(statsData);
        setMarketData(marketAnalysisData);
        setError(null);
      } catch (err) {
        console.error('Error fetching market analysis data:', err);
        setError('Failed to load market analysis data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Chart data for category distribution
  const categoryChartData = {
    labels: stats?.category_distribution.map(cat => formatCategoryName(cat.category)) || [],
    datasets: [
      {
        data: stats?.category_distribution.map(cat => cat.count) || [],
        backgroundColor: [
          '#3f51b5',
          '#f50057',
          '#4caf50',
          '#ff9800',
          '#2196f3',
          '#9c27b0',
          '#607d8b',
          '#e91e63',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for monthly growth
  const monthlyGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Topic Growth',
        data: [5, 12, 18, 23, 29, 35],
        fill: true,
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
    ],
  };

  // Chart data for pain points by category
  const painPointsData = {
    labels: ['Tech', 'Productivity', 'Finance', 'Health', 'Entertainment', 'Education'],
    datasets: [
      {
        label: 'Pain Points',
        data: [65, 45, 38, 54, 28, 32],
        backgroundColor: theme.palette.primary.main,
      },
      {
        label: 'Solution Requests',
        data: [45, 35, 28, 41, 18, 25],
        backgroundColor: theme.palette.secondary.main,
      },
    ],
  };

  const formatCategoryName = (category: string): string => {
    if (!category) return 'Uncategorized';
    
    // Handle specific categories
    switch (category.toLowerCase()) {
      case 'tech':
        return 'Technology';
      case 'productivity':
        return 'Productivity';
      case 'finance':
        return 'Finance';
      case 'health':
        return 'Health & Wellness';
      case 'entertainment':
        return 'Entertainment';
      default:
        // Capitalize first letter of each word
        return category
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Market Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Explore market trends, category distribution, and growth patterns to identify promising SaaS opportunities.
        </Typography>
      </Box>

      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="market analysis tabs"
            variant="fullWidth"
          >
            <Tab label="Category Distribution" {...a11yProps(0)} />
            <Tab label="Growth Trends" {...a11yProps(1)} />
            <Tab label="Pain Points Analysis" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  Topic Distribution by Category
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pie
                    data={categoryChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', minHeight: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Category Insights
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Top Categories
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {stats?.category_distribution
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map((cat, index) => (
                        <Box component="li" key={index} sx={{ mb: 1 }}>
                          <Typography variant="body1">
                            {formatCategoryName(cat.category)}: {cat.count} topics ({cat.percentage.toFixed(1)}%)
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Market Opportunities
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The {formatCategoryName(stats?.category_distribution[0]?.category || '')} category shows the highest 
                    number of topics and user discussions, indicating strong market demand for solutions in this space.
                  </Typography>
                  <Typography variant="body2">
                    Emerging categories with rapid growth include 
                    {stats?.category_distribution
                      .slice(1, 3)
                      .map(cat => ` ${formatCategoryName(cat.category)}`)
                      .join(' and ')}, 
                    which may represent untapped opportunities.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, height: '100%', minHeight: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Growth Trends
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 400 }}>
                  <Line
                    data={monthlyGrowthData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Growth Analysis
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Topic growth has been steadily increasing over the past 6 months, with a 
                    significant acceleration in the most recent 2 months. This indicates growing 
                    user interest and potential market opportunities.
                  </Typography>
                  <Typography variant="body2">
                    The fastest growing topics are primarily in the technology and productivity 
                    categories, suggesting these areas may offer the most promising opportunities 
                    for new SaaS products.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, height: '100%', minHeight: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Pain Points by Category
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 400 }}>
                  <Bar
                    data={painPointsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Pain Points Analysis
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Technology and Health categories show the highest number of pain points mentioned 
                    in discussions, indicating significant user frustration and unmet needs in these areas.
                  </Typography>
                  <Typography variant="body2">
                    The ratio of pain points to solution requests is highest in the Technology category, 
                    suggesting that users are actively seeking solutions but not finding adequate options 
                    in the current market.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default MarketAnalysis; 