import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import { getDashboardStats, getTopTrendingTopics, getTopicById } from '../services/api';
import { DashboardStats, RedditTopic } from '../types';
import PainPointsComponent from '../components/PainPointsComponent';
import SolutionRequestsComponent from '../components/SolutionRequestsComponent';
import AppIdeasComponent from '../components/AppIdeasComponent';

// Interface for the tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`topic-tabpanel-${index}`}
      aria-labelledby={`topic-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<RedditTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for topic details
  const [topicDetails, setTopicDetails] = useState<Record<number, RedditTopic>>({});
  const [loadingTopics, setLoadingTopics] = useState<Record<number, boolean>>({});
  const [tabValues, setTabValues] = useState<Record<number, number>>({});

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, topicsData] = await Promise.all([
          getDashboardStats(),
          getTopTrendingTopics(10)
        ]);
        setStats(statsData);
        setTrendingTopics(topicsData);
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

  // Fetch topic details for all trending topics
  useEffect(() => {
    const fetchAllTopicDetails = async () => {
      if (trendingTopics.length === 0) return;
      
      // Create a map of topic IDs to track loading state
      const loadingMap: Record<number, boolean> = {};
      trendingTopics.forEach(topic => {
        loadingMap[topic.id] = true;
      });
      
      setLoadingTopics(loadingMap);
      
      // Initialize tab values for all topics
      const initialTabValues: Record<number, number> = {};
      trendingTopics.forEach(topic => {
        initialTabValues[topic.id] = 0;
      });
      
      setTabValues(initialTabValues);
      
      // Fetch details for all topics in parallel
      try {
        const detailsPromises = trendingTopics.map(topic => getTopicById(topic.id));
        const topicsDetailsArray = await Promise.all(detailsPromises);
        
        // Convert array of topic details to a record object
        const topicsDetailsRecord: Record<number, RedditTopic> = {};
        topicsDetailsArray.forEach(topicDetail => {
          topicsDetailsRecord[topicDetail.id] = topicDetail;
        });
        
        setTopicDetails(topicsDetailsRecord);
      } catch (err) {
        console.error('Error fetching topic details:', err);
        setError('Failed to load some topic details. Please try again later.');
      } finally {
        // Set all topics as loaded
        const completedLoadingMap: Record<number, boolean> = {};
        trendingTopics.forEach(topic => {
          completedLoadingMap[topic.id] = false;
        });
        
        setLoadingTopics(completedLoadingMap);
      }
    };
    
    fetchAllTopicDetails();
  }, [trendingTopics]);

  // Handle tab change
  const handleTabChange = (topicId: number, newValue: number) => {
    setTabValues({
      ...tabValues,
      [topicId]: newValue
    });
  };

  // Navigate to topic detail page
  const handleViewFullDetails = (topicId: number) => {
    navigate(`/topics/${topicId}`);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading dashboard data...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Idea Engine Dashboard
      </Typography>
      
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Topics
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PieChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {stats?.totalTopics || stats?.total_topics || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Trending Topics
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {stats?.trendingTopics || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CategoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {stats?.totalCategories || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Growth Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShowChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {stats?.averageGrowthRate || stats?.avg_growth || 0}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Trending Topics with Detailed Information */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Trending Topics with Insights
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Explore trending topics with their pain points, solution requests, and app ideas all in one place.
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {trendingTopics.length > 0 ? (
          <Grid container spacing={3}>
            {trendingTopics.map((topic) => (
              <Grid item xs={12} key={topic.id}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    {/* Topic Header */}
                    <Box sx={{ mb: 2 }}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6">
                            {topic.title || topic.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Chip 
                            label={topic.category} 
                            size="small" 
                            color="secondary" 
                            sx={{ mr: 1 }}
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUpIcon color="primary" sx={{ mr: 0.5, fontSize: '1rem' }} />
                            <Typography variant="body2">
                              {topic.growth_percentage || topic.growthRate || 0}% growth
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    {/* Topic Content */}
                    {loadingTopics[topic.id] ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={30} />
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                          <Tabs 
                            value={tabValues[topic.id] || 0} 
                            onChange={(_, newValue) => handleTabChange(topic.id, newValue)}
                            variant={isMobile ? "scrollable" : "fullWidth"}
                            scrollButtons={isMobile ? "auto" : undefined}
                          >
                            <Tab label="Pain Points" />
                            <Tab label="Solution Requests" />
                            <Tab label="App Ideas" />
                          </Tabs>
                        </Box>
                        
                        <Box sx={{ maxHeight: '250px', overflowY: 'auto', mb: 2 }}>
                          <TabPanel value={tabValues[topic.id] || 0} index={0}>
                            <PainPointsComponent 
                              painPoints={topicDetails[topic.id]?.pain_points || []} 
                              variant="default"
                              maxItems={5}
                            />
                          </TabPanel>
                          
                          <TabPanel value={tabValues[topic.id] || 0} index={1}>
                            <SolutionRequestsComponent 
                              solutionRequests={topicDetails[topic.id]?.solution_requests || []} 
                              variant="default"
                              maxItems={5}
                            />
                          </TabPanel>
                          
                          <TabPanel value={tabValues[topic.id] || 0} index={2}>
                            <AppIdeasComponent 
                              appIdeas={topicDetails[topic.id]?.app_ideas || []} 
                              variant="default"
                              maxItems={5}
                            />
                          </TabPanel>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            variant="outlined" 
                            onClick={() => handleViewFullDetails(topic.id)}
                          >
                            View Full Details
                          </Button>
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            No trending topics found. Check back later for updates.
          </Alert>
        )}
      </Paper>
      
      {/* Alternative View: All Data at Once */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          All Insights at a Glance
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          View all pain points, solution requests, and app ideas for trending topics in a single view.
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {trendingTopics.length > 0 ? (
          <Grid container spacing={3}>
            {/* Pain Points Section */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Top Pain Points
              </Typography>
              <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
                {trendingTopics.map((topic) => (
                  <Box key={`pain-${topic.id}`} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {topic.title || topic.name}
                    </Typography>
                    <PainPointsComponent 
                      painPoints={topicDetails[topic.id]?.pain_points || []} 
                      variant="compact"
                      maxItems={3}
                      title=""
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
            
            {/* Solution Requests Section */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Top Solution Requests
              </Typography>
              <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
                {trendingTopics.map((topic) => (
                  <Box key={`solution-${topic.id}`} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {topic.title || topic.name}
                    </Typography>
                    <SolutionRequestsComponent 
                      solutionRequests={topicDetails[topic.id]?.solution_requests || []} 
                      variant="compact"
                      maxItems={3}
                      title=""
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
            
            {/* App Ideas Section */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Top App Ideas
              </Typography>
              <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
                {trendingTopics.map((topic) => (
                  <Box key={`idea-${topic.id}`} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {topic.title || topic.name}
                    </Typography>
                    <AppIdeasComponent 
                      appIdeas={topicDetails[topic.id]?.app_ideas || []} 
                      variant="compact"
                      maxItems={3}
                      title=""
                      onSelectIdea={() => handleViewFullDetails(topic.id)}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">
            No trending topics found. Check back later for updates.
          </Alert>
        )}
      </Paper>
      
      {/* Quick Links */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Quick Navigation
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/topics')}
              sx={{ py: 2 }}
            >
              Explore All Topics
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/market-analysis')}
              sx={{ py: 2 }}
            >
              Market Analysis
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/text-analysis')}
              sx={{ py: 2 }}
            >
              Analyze Your Text
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Dashboard; 