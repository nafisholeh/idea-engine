import React, { useState, useEffect, useRef } from 'react';
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
  useMediaQuery,
  IconButton,
  alpha
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // State for dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<RedditTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for topic details
  const [topicDetails, setTopicDetails] = useState<Record<number, RedditTopic>>({});
  const [loadingTopics, setLoadingTopics] = useState<Record<number, boolean>>({});
  const [tabValues, setTabValues] = useState<Record<number, number>>({});

  // Custom theme colors
  const primaryBlue = theme.palette.primary.main;
  const lightBlue = alpha(theme.palette.primary.main, 0.1);
  const mediumBlue = alpha(theme.palette.primary.main, 0.5);

  // Scroll handlers for horizontal scrolling
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

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
        <CircularProgress sx={{ color: primaryBlue }} />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
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
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 300, 
          color: primaryBlue,
          mb: 4
        }}
      >
        Idea Engine Dashboard
      </Typography>
      
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              backgroundColor: lightBlue,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Topics
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PieChartIcon sx={{ mr: 1, color: primaryBlue }} />
                <Typography variant="h5" component="div" sx={{ fontWeight: 500, color: primaryBlue }}>
                  {stats?.totalTopics || stats?.total_topics || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              backgroundColor: lightBlue,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Trending Topics
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1, color: primaryBlue }} />
                <Typography variant="h5" component="div" sx={{ fontWeight: 500, color: primaryBlue }}>
                  {stats?.trendingTopics || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              backgroundColor: lightBlue,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ mr: 1, color: primaryBlue }} />
                <Typography variant="h5" component="div" sx={{ fontWeight: 500, color: primaryBlue }}>
                  {stats?.totalCategories || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              backgroundColor: lightBlue,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg. Growth Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShowChartIcon sx={{ mr: 1, color: primaryBlue }} />
                <Typography variant="h5" component="div" sx={{ fontWeight: 500, color: primaryBlue }}>
                  {stats?.averageGrowthRate || stats?.avg_growth || 0}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Trending Topics with Horizontal Scrolling */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 5, 
          borderRadius: 4,
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom 
              sx={{ fontWeight: 500, color: primaryBlue }}
            >
              Trending Topics with Insights
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Explore trending topics with their pain points, solution requests, and app ideas.
            </Typography>
          </Box>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton 
              onClick={handleScrollLeft} 
              sx={{ 
                backgroundColor: lightBlue, 
                mr: 1,
                '&:hover': { backgroundColor: mediumBlue }
              }}
            >
              <ArrowBackIcon sx={{ color: primaryBlue }} />
            </IconButton>
            <IconButton 
              onClick={handleScrollRight} 
              sx={{ 
                backgroundColor: lightBlue,
                '&:hover': { backgroundColor: mediumBlue }
              }}
            >
              <ArrowForwardIcon sx={{ color: primaryBlue }} />
            </IconButton>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {trendingTopics.length > 0 ? (
          <Box 
            ref={scrollContainerRef}
            sx={{ 
              display: 'flex', 
              overflowX: 'auto', 
              pb: 2,
              scrollbarWidth: 'none', // Firefox
              '&::-webkit-scrollbar': { // Chrome, Safari, Edge
                display: 'none'
              },
              '-ms-overflow-style': 'none', // IE
              scrollSnapType: 'x mandatory'
            }}
          >
            {trendingTopics.map((topic) => (
              <Card 
                key={topic.id} 
                variant="outlined" 
                sx={{ 
                  minWidth: { xs: '85%', sm: '400px', md: '450px' },
                  maxWidth: { xs: '85%', sm: '400px', md: '450px' },
                  mr: 2,
                  mb: 1,
                  borderRadius: 3,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  scrollSnapAlign: 'start',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent>
                  {/* Topic Header */}
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 500, 
                        color: primaryBlue,
                        mb: 1
                      }}
                    >
                      {topic.title || topic.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={topic.category} 
                        size="small" 
                        sx={{ 
                          borderRadius: '16px', 
                          backgroundColor: lightBlue,
                          color: primaryBlue,
                          fontWeight: 500
                        }} 
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ mr: 0.5, fontSize: '1rem', color: primaryBlue }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: primaryBlue }}>
                          {topic.growth_percentage || topic.growthRate || 0}% growth
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Topic Content */}
                  {loadingTopics[topic.id] ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={30} sx={{ color: primaryBlue }} />
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider', 
                        mb: 2,
                        '& .MuiTabs-indicator': {
                          backgroundColor: primaryBlue
                        }
                      }}>
                        <Tabs 
                          value={tabValues[topic.id] || 0} 
                          onChange={(_, newValue) => handleTabChange(topic.id, newValue)}
                          variant="fullWidth"
                          sx={{
                            '& .MuiTab-root': {
                              textTransform: 'none',
                              fontWeight: 500,
                              color: 'text.secondary',
                              '&.Mui-selected': {
                                color: primaryBlue
                              }
                            }
                          }}
                        >
                          <Tab label="Pain Points" />
                          <Tab label="Solution Requests" />
                          <Tab label="App Ideas" />
                        </Tabs>
                      </Box>
                      
                      <Box sx={{ height: '250px', overflowY: 'auto', mb: 2, pr: 1 }}>
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
                          variant="contained" 
                          onClick={() => handleViewFullDetails(topic.id)}
                          endIcon={<ArrowForwardIcon />}
                          sx={{ 
                            borderRadius: '24px',
                            textTransform: 'none',
                            boxShadow: 'none',
                            backgroundColor: primaryBlue,
                            '&:hover': {
                              backgroundColor: mediumBlue,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 3,
              backgroundColor: lightBlue,
              color: primaryBlue
            }}
          >
            No trending topics found. Check back later for updates.
          </Alert>
        )}
      </Paper>
      
      {/* All Insights at a Glance */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 5, 
          borderRadius: 4,
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          sx={{ fontWeight: 500, color: primaryBlue }}
        >
          All Insights at a Glance
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          View all pain points, solution requests, and app ideas for trending topics in a single view.
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {trendingTopics.length > 0 ? (
          <Grid container spacing={3}>
            {/* Pain Points Section */}
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ fontWeight: 500, color: primaryBlue }}
              >
                Top Pain Points
              </Typography>
              <Box sx={{ 
                maxHeight: '500px', 
                overflowY: 'auto', 
                pr: 1,
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: '10px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: mediumBlue,
                  borderRadius: '10px'
                }
              }}>
                {trendingTopics.map((topic) => (
                  <Box key={`pain-${topic.id}`} sx={{ mb: 3 }}>
                    <Typography 
                      variant="subtitle1" 
                      gutterBottom 
                      sx={{ fontWeight: 500, color: primaryBlue }}
                    >
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
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ fontWeight: 500, color: primaryBlue }}
              >
                Top Solution Requests
              </Typography>
              <Box sx={{ 
                maxHeight: '500px', 
                overflowY: 'auto', 
                pr: 1,
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: '10px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: mediumBlue,
                  borderRadius: '10px'
                }
              }}>
                {trendingTopics.map((topic) => (
                  <Box key={`solution-${topic.id}`} sx={{ mb: 3 }}>
                    <Typography 
                      variant="subtitle1" 
                      gutterBottom 
                      sx={{ fontWeight: 500, color: primaryBlue }}
                    >
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
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ fontWeight: 500, color: primaryBlue }}
              >
                Top App Ideas
              </Typography>
              <Box sx={{ 
                maxHeight: '500px', 
                overflowY: 'auto', 
                pr: 1,
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: '10px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: mediumBlue,
                  borderRadius: '10px'
                }
              }}>
                {trendingTopics.map((topic) => (
                  <Box key={`idea-${topic.id}`} sx={{ mb: 3 }}>
                    <Typography 
                      variant="subtitle1" 
                      gutterBottom 
                      sx={{ fontWeight: 500, color: primaryBlue }}
                    >
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
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 3,
              backgroundColor: lightBlue,
              color: primaryBlue
            }}
          >
            No trending topics found. Check back later for updates.
          </Alert>
        )}
      </Paper>
      
      {/* Quick Links */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 4,
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          sx={{ fontWeight: 500, color: primaryBlue }}
        >
          Quick Navigation
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/topics')}
              sx={{ 
                py: 2, 
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                backgroundColor: primaryBlue,
                '&:hover': {
                  backgroundColor: mediumBlue,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              Explore All Topics
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/market-analysis')}
              sx={{ 
                py: 2, 
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                backgroundColor: primaryBlue,
                '&:hover': {
                  backgroundColor: mediumBlue,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              Market Analysis
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate('/text-analysis')}
              sx={{ 
                py: 2, 
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                backgroundColor: primaryBlue,
                '&:hover': {
                  backgroundColor: mediumBlue,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
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