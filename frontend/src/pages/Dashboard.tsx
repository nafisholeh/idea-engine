import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  Chip,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Insights as InsightsIcon,
  Category as CategoryIcon,
  Lightbulb as LightbulbIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { getDashboardStats, getTrendingTopics, getDataCollectionStatus } from '../utils/api';
import { DashboardStats, RedditTopic } from '../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<RedditTopic[]>([]);
  const [collectionStatus, setCollectionStatus] = useState<{
    last_run: string;
    status: string;
    topics_collected: number;
    next_scheduled_run: string;
  } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, topicsData, statusData] = await Promise.all([
          getDashboardStats(),
          getTrendingTopics(5),
          getDataCollectionStatus()
        ]);
        
        setStats(statsData);
        setTrendingTopics(topicsData);
        setCollectionStatus(statusData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [statsData, topicsData, statusData] = await Promise.all([
        getDashboardStats(),
        getTrendingTopics(5),
        getDataCollectionStatus()
      ]);
      
      setStats(statsData);
      setTrendingTopics(topicsData);
      setCollectionStatus(statusData);
      setError(null);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Chart data for topic growth over time
  const growthChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Topic Mentions',
        data: [65, 78, 90, 120, 150, 180],
        fill: true,
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
    ],
  };

  // Chart data for category distribution
  const categoryChartData = {
    labels: stats?.category_distribution.map(cat => cat.category) || [],
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
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for monthly trends
  const monthlyTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Topics',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: theme.palette.primary.main,
      },
      {
        label: 'Growing Topics',
        data: [8, 15, 12, 20, 17, 25],
        backgroundColor: theme.palette.secondary.main,
      },
    ],
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={refreshData} startIcon={<RefreshIcon />}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refreshData}
        >
          Refresh
        </Button>
      </Box>

      {collectionStatus && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Last data collection: {new Date(collectionStatus.last_run).toLocaleString()}
            {' | '}
            Status: {collectionStatus.status}
            {' | '}
            Topics collected: {collectionStatus.topics_collected}
            {' | '}
            Next scheduled run: {new Date(collectionStatus.next_scheduled_run).toLocaleString()}
          </Typography>
        </Alert>
      )}

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            }}
            className="dashboard-card"
          >
            <Typography component="h2" variant="h6" color="inherit" gutterBottom>
              Total Topics
            </Typography>
            <Typography component="p" variant="h3" color="inherit">
              {stats?.total_topics || 0}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              Across {stats?.category_distribution.length || 0} categories
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              bgcolor: 'secondary.light',
              color: 'secondary.contrastText',
            }}
            className="dashboard-card"
          >
            <Typography component="h2" variant="h6" color="inherit" gutterBottom>
              Trending Topics
            </Typography>
            <Typography component="p" variant="h3" color="inherit">
              {stats?.trending_topics_count || 0}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              Growing more than 10% this month
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              bgcolor: 'success.light',
              color: 'success.contrastText',
            }}
            className="dashboard-card"
          >
            <Typography component="h2" variant="h6" color="inherit" gutterBottom>
              Opportunities
            </Typography>
            <Typography component="p" variant="h3" color="inherit">
              {stats?.opportunity_count || 0}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              High-potential SaaS ideas
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              bgcolor: 'info.light',
              color: 'info.contrastText',
            }}
            className="dashboard-card"
          >
            <Typography component="h2" variant="h6" color="inherit" gutterBottom>
              Total Mentions
            </Typography>
            <Typography component="p" variant="h3" color="inherit">
              {stats?.total_mentions.toLocaleString() || 0}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              From Reddit discussions
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ mb: 0 }}>
                Topic Growth Over Time
              </Typography>
              <Tooltip title="Shows the trend of topic mentions over the past 6 months">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <Line
                  data={growthChartData}
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
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ mb: 0 }}>
                Category Distribution
              </Typography>
              <Tooltip title="Distribution of topics across different categories">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <Doughnut
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
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Trends */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 350,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ mb: 0 }}>
                Monthly Trends
              </Typography>
              <Tooltip title="New and growing topics by month">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <Bar
                  data={monthlyTrendsData}
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
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Trending Topics */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            <TrendingUpIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Trending Topics
          </Typography>
          <Button component={Link} to="/topics" variant="outlined">
            View All
          </Button>
        </Box>
        <Grid container spacing={3}>
          {trendingTopics.map((topic) => (
            <Grid item xs={12} sm={6} md={4} key={topic.id}>
              <Card sx={{ height: '100%' }} className="topic-card">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {topic.name}
                    </Typography>
                    <Chip
                      label={`+${topic.growth_percentage}%`}
                      color="success"
                      size="small"
                      icon={<TrendingUpIcon />}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={topic.category}
                      size="small"
                      icon={<CategoryIcon />}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`${topic.mention_count} mentions`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {topic.pain_points && topic.pain_points.length > 0
                      ? topic.pain_points[0].text
                      : 'No pain points identified yet.'}
                  </Typography>
                  {topic.app_ideas && topic.app_ideas.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LightbulbIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="body2" fontWeight="medium">
                        {topic.app_ideas[0].text}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    to={`/topics/${topic.id}`}
                    endIcon={<InsightsIcon />}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 