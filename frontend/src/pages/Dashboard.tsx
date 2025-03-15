import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExploreIcon from '@mui/icons-material/Explore';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { DashboardStats, RedditTopic } from '../types';
import { getDashboardStats, getTopTrendingTopics, testApiConnection } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<RedditTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Test API connection first
        try {
          const testResult = await testApiConnection();
          console.log('API connection test result:', testResult);
        } catch (testError) {
          console.error('API connection test failed:', testError);
        }

        setLoading(true);
        const [statsData, topicsData] = await Promise.all([
          getDashboardStats(),
          getTopTrendingTopics()
        ]);
        
        setStats(statsData);
        setTrendingTopics(topicsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard data. Please try again later.");
        setLoading(false);
        console.error("Dashboard data fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const formatCategoryName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Container>
    );
  }

  if (error || !stats) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || "Failed to load dashboard"}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Idea Engine Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover trending topics, pain points, and SaaS opportunities from Reddit discussions
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h3" component="div" color="primary.main">
              {stats.totalTopics || stats.total_topics || 0}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tracked Topics
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h3" component="div" color="primary.main">
              {(stats.total_mentions ? stats.total_mentions.toLocaleString() : '0')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total Mentions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h3" component="div" color="success.main">
                {stats.averageGrowthRate || stats.avg_growth || 0}%
              </Typography>
              <TrendingUpIcon color="success" sx={{ ml: 1, fontSize: 28 }} />
            </Box>
            <Typography variant="body1" color="text.secondary">
              Average Growth
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h3" component="div" color="primary.main">
              {stats.totalCategories || (stats.top_categories && stats.top_categories.length) || 0}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Categories
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Access Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ExploreIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Topic Explorer</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Browse all tracked topics and their insights
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={RouterLink} 
                to="/topics" 
                size="small" 
                fullWidth
              >
                Explore Topics
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Market Analysis</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View market trends and category distribution
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={RouterLink} 
                to="/market-analysis" 
                size="small" 
                fullWidth
              >
                View Analysis
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Opportunity Finder</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Discover high-potential SaaS opportunities
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={RouterLink} 
                to="/opportunities" 
                size="small" 
                fullWidth
              >
                Find Opportunities
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LightbulbOutlinedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Submit Idea</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Submit your own SaaS idea for validation
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={RouterLink} 
                to="/submit-idea" 
                size="small" 
                fullWidth
              >
                Submit Idea
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Trending Topics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Top Trending Topics
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {trendingTopics.map((topic) => (
            <Grid item xs={12} sm={6} md={3} key={topic.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom noWrap>
                    {topic.name || topic.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={formatCategoryName(topic.category)} 
                      color="primary" 
                      size="small" 
                    />
                    {topic.opportunity_scores?.total_score && (
                      <Chip
                        label={`Score: ${topic.opportunity_scores.total_score}`}
                        color={topic.opportunity_scores.total_score > 80 ? "success" : "default"}
                        size="small"
                      />
                    )}
                    {topic.opportunity_score && (
                      <Chip
                        label={`Score: ${topic.opportunity_score}`}
                        color={topic.opportunity_score > 80 ? "success" : "default"}
                        size="small"
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {(topic.mention_count ? topic.mention_count.toLocaleString() : '0')} mentions
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {topic.growth_percentage || topic.growthRate || 0}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    component={RouterLink} 
                    to={`/topics/${topic.id}`} 
                    size="small" 
                    fullWidth
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