import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, CircularProgress, Alert, Button, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import TrendingTopics from '../components/dashboard/TrendingTopics';
import TopicGrowthChart from '../components/charts/TopicGrowthChart';
import { getStats, getTrendingTopics, Topic, Stats } from '../services/api';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<Topic[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      if (loading) {
        // Initial load
        setLoading(true);
      } else {
        // Refresh action
        setRefreshing(true);
      }
      setError(null);
      
      // Fetch stats and trending topics in parallel
      const [statsData, trendingData] = await Promise.all([
        getStats(),
        getTrendingTopics(5) // Get top 5 trending topics
      ]);
      
      setStats(statsData);
      setTrendingTopics(trendingData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Transform data for the dashboard summary
  const summaryStats = {
    topicCount: stats?.topic_count || 0,
    totalMentions: stats?.total_mentions || 0,
    trendingTopics: trendingTopics.filter(topic => topic.growth_percentage > 0).length,
    opportunities: trendingTopics.filter(topic => 
      topic.opportunity_scores && topic.opportunity_scores.total_score >= 70
    ).length,
  };

  // Transform trending topics for the component
  const formattedTrendingTopics = trendingTopics.map(topic => ({
    id: topic.id,
    name: topic.name,
    category: topic.category,
    growthPercentage: topic.growth_percentage,
    mentionCount: topic.mention_count
  }));

  // Select top 3 trending topics for the chart
  const topicsForChart = trendingTopics.slice(0, 3).map(topic => ({
    id: topic.id,
    name: topic.name,
    trendData: topic.trend_data
  }));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Reddit Radar Dashboard
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={fetchDashboardData} 
              disabled={loading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      ) : (
        <>
          <DashboardSummary stats={summaryStats} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TopicGrowthChart 
                topics={topicsForChart} 
                title="Trending Topics Growth" 
                loading={refreshing}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TrendingTopics topics={formattedTrendingTopics} />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard; 