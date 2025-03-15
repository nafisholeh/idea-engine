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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
        <Box sx={{ p: 2 }}>
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
  
  // State for expanded topic details
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});
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

  // Handle topic expansion
  const handleTopicExpand = async (topicId: number) => {
    const isExpanded = expandedTopics[topicId] || false;
    
    // Update expanded state
    setExpandedTopics({
      ...expandedTopics,
      [topicId]: !isExpanded
    });
    
    // Initialize tab value if not set
    if (tabValues[topicId] === undefined) {
      setTabValues({
        ...tabValues,
        [topicId]: 0
      });
    }
    
    // Fetch topic details if expanding and not already loaded
    if (!isExpanded && !topicDetails[topicId]) {
      try {
        setLoadingTopics({
          ...loadingTopics,
          [topicId]: true
        });
        
        const topicData = await getTopicById(topicId);
        
        setTopicDetails({
          ...topicDetails,
          [topicId]: topicData
        });
      } catch (err) {
        console.error(`Error fetching details for topic ${topicId}:`, err);
        setError(`Failed to load details for this topic. Please try again later.`);
      } finally {
        setLoadingTopics({
          ...loadingTopics,
          [topicId]: false
        });
      }
    }
  };

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
          Click on a topic to expand and see detailed information.
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {trendingTopics.length > 0 ? (
          trendingTopics.map((topic) => (
            <Accordion 
              key={topic.id}
              expanded={expandedTopics[topic.id] || false}
              onChange={() => handleTopicExpand(topic.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`topic-${topic.id}-content`}
                id={`topic-${topic.id}-header`}
              >
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
              </AccordionSummary>
              
              <AccordionDetails>
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
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => handleViewFullDetails(topic.id)}
                      >
                        View Full Details
                      </Button>
                    </Box>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          ))
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