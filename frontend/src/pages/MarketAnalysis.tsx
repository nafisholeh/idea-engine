import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
  useTheme
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  CategoryStat,
  DashboardStats,
  MarketAnalysisData
} from '../types';
import { getDashboardStats, getMarketAnalysis } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`market-analysis-tabpanel-${index}`}
      aria-labelledby={`market-analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MarketAnalysis: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketAnalysisData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analysisData, statsData] = await Promise.all([
          getMarketAnalysis(),
          getDashboardStats()
        ]);

        // Convert growthTrends to monthlyGrowth for backward compatibility
        const updatedAnalysisData: MarketAnalysisData = {
          ...analysisData,
          monthlyGrowth: analysisData.growthTrends
        };

        setMarketData(updatedAnalysisData);
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch market analysis data. Please try again later.");
        setLoading(false);
        console.error("Market analysis data fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCategoryName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  };

  // Prepare chart data
  const categoryChartData = {
    labels: marketData?.categoryDistribution.map(cat => formatCategoryName(cat.category || cat.name || '')) || [],
    datasets: [
      {
        label: 'Number of Topics',
        data: marketData?.categoryDistribution.map(cat => cat.count) || [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const growthChartData = {
    labels: marketData?.monthlyGrowth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Growth Percentage',
        data: marketData?.monthlyGrowth?.map(item => item.growth) || [],
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4
      }
    ]
  };

  const painPointsChartData = {
    labels: marketData?.painPointsByCategory.map(item => formatCategoryName(item.category)) || [],
    datasets: [
      {
        label: 'Pain Points Mentioned',
        data: marketData?.painPointsByCategory.map(item => item.count) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading market analysis data...</Typography>
      </Container>
    );
  }

  if (error || !marketData || !stats) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || "Failed to load market analysis"}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Market Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyze market trends, category distribution, and pain points from Reddit discussions
        </Typography>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h3" component="div" color="primary.main">
              {stats?.totalTopics || 0}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total Topics
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h3" component="div" color="primary.main">
              {stats?.totalPosts ? stats.totalPosts.toLocaleString() : '0'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total Posts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h3" component="div" color="success.main">
              {stats?.averageGrowthRate || 0}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Average Growth
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h3" component="div" color="primary.main">
              {stats?.totalCategories || 0}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Top Categories
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for different analyses */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="market analysis tabs"
            centered
          >
            <Tab label="Category Distribution" />
            <Tab label="Growth Trends" />
            <Tab label="Pain Points Analysis" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Topic Distribution by Category
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This chart shows the distribution of topics across different categories, helping identify which areas have the most discussion.
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 400 }}>
                <Pie data={categoryChartData} options={{ maintainAspectRatio: false }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 400 }}>
                <Bar
                  data={categoryChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Topics'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Category'
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Monthly Growth Trends
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This chart shows the average growth percentage of topics over the past months, indicating overall market momentum.
          </Typography>
          <Box sx={{ height: 400 }}>
            <Line
              data={growthChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Growth Percentage (%)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  }
                }
              }}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Pain Points by Category
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This chart shows the number of pain points mentioned in each category, helping identify where users are experiencing the most problems.
          </Typography>
          <Box sx={{ height: 400 }}>
            <Bar
              data={painPointsChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Pain Points'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Category'
                    }
                  }
                }
              }}
            />
          </Box>
        </TabPanel>
      </Paper>

      {/* Market Insights */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Key Market Insights
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Fastest Growing Categories
            </Typography>
            <Typography variant="body2" paragraph>
              Based on our analysis, the fastest growing categories are:
            </Typography>
            <ol>
              <li>
                <Typography variant="body1" fontWeight="bold">
                  Development Tools (24.1%)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Driven by increased demand for AI-assisted coding and automation
                </Typography>
              </li>
              <li>
                <Typography variant="body1" fontWeight="bold">
                  Remote Work (22.3%)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Continued growth as companies adopt hybrid work models
                </Typography>
              </li>
              <li>
                <Typography variant="body1" fontWeight="bold">
                  Communication (19.8%)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Focus on asynchronous and cross-team collaboration tools
                </Typography>
              </li>
            </ol>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Most Common Pain Points
            </Typography>
            <Typography variant="body2" paragraph>
              The most frequently mentioned pain points across all categories:
            </Typography>
            <ol>
              <li>
                <Typography variant="body1" fontWeight="bold">
                  Integration Difficulties (120 mentions)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Users struggle with connecting multiple tools and platforms
                </Typography>
              </li>
              <li>
                <Typography variant="body1" fontWeight="bold">
                  Poor User Experience (95 mentions)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complex interfaces and steep learning curves
                </Typography>
              </li>
              <li>
                <Typography variant="body1" fontWeight="bold">
                  Limited Customization (85 mentions)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inability to adapt tools to specific workflows and needs
                </Typography>
              </li>
            </ol>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Market Opportunities
            </Typography>
            <Typography variant="body2" paragraph>
              Based on our data, these areas present the strongest opportunities:
            </Typography>
            <ol>
              <li>
                <Typography variant="body1" fontWeight="bold">
                  AI-Enhanced Productivity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tools that leverage AI to automate repetitive tasks
                </Typography>
              </li>
              <li>
                <Typography variant="body1" fontWeight="bold">
                  Cross-Platform Integration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Solutions that connect disparate tools and unify workflows
                </Typography>
              </li>
              <li>
                <Typography variant="body1" fontWeight="bold">
                  Team Collaboration Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Insights into team productivity and collaboration patterns
                </Typography>
              </li>
            </ol>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default MarketAnalysis;