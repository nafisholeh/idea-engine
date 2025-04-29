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
  IconButton,
  alpha,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Skeleton} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import { getDashboardStats, getTopTrendingTopics, getTopicById } from '../services/api';
import { DashboardStats, RedditTopic, PainPoint, SolutionRequest, AppIdea } from '../types';

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
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Dashboard component
const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const topicsScrollRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<RedditTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValues, setTabValues] = useState<{ [key: number]: number }>({});
  const [topicDetails, setTopicDetails] = useState<{ [key: number]: any }>({});
  const [loadingTopics, setLoadingTopics] = useState<{ [key: number]: boolean }>({});
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  // Handle scroll left for trending topics
  const handleScrollLeft = () => {
    if (topicsScrollRef.current) {
      topicsScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Handle scroll right for trending topics
  const handleScrollRight = () => {
    if (topicsScrollRef.current) {
      topicsScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsData = await getDashboardStats();
        const topicsData = await getTopTrendingTopics();

        // Use actual data from API without default values
        setStats(statsData);
        setTrendingTopics(topicsData);

        // Initialize tab values
        const initialTabValues: { [key: number]: number } = {};
        topicsData.forEach(topic => {
          initialTabValues[topic.id] = 0;
        });
        setTabValues(initialTabValues);

        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch topic details for each trending topic
  useEffect(() => {
    const fetchAllTopicDetails = async () => {
      if (trendingTopics.length === 0) return;

      try {
        // Initialize loading state for each topic
        const initialLoadingState: { [key: number]: boolean } = {};
        trendingTopics.forEach(topic => {
          initialLoadingState[topic.id] = true;
        });
        setLoadingTopics(initialLoadingState);

        const details: { [key: number]: any } = {};

        for (const topic of trendingTopics) {
          const topicData = await getTopicById(topic.id);
          details[topic.id] = topicData;

          // Update loading state for this topic
          setLoadingTopics(prev => ({
            ...prev,
            [topic.id]: false
          }));
        }

        setTopicDetails(details);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching topic details:', err);
        setLoading(false);

        // Mark all topics as not loading on error
        const resetLoadingState: { [key: number]: boolean } = {};
        trendingTopics.forEach(topic => {
          resetLoadingState[topic.id] = false;
        });
        setLoadingTopics(resetLoadingState);
      }
    };

    fetchAllTopicDetails();
  }, [trendingTopics]);

  // Check if scroll buttons should be visible
  useEffect(() => {
    const checkScroll = () => {
      if (topicsScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = topicsScrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      }
    };

    // Initial check
    checkScroll();

    // Add scroll event listener
    const scrollContainer = topicsScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
      return () => scrollContainer.removeEventListener('scroll', checkScroll);
    }
  }, [trendingTopics]);

  // Handle tab change for a specific topic
  const handleTabChange = (topicId: number, newValue: number) => {
    setTabValues(prev => ({
      ...prev,
      [topicId]: newValue
    }));
  };

  // Navigate to topic detail page
  const handleViewFullDetails = (topicId: number) => {
    navigate(`/topics/${topicId}`);
  };

  if (loading && trendingTopics.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom sx={{ color: theme.palette.primary.main }}>
          Discover Validated SaaS Idea from real conversations
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mb: 1 }}>
          Get instant insights into pain points, solution requests and app ideas that users are actively searching for
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Topics
                  </Typography>
                  {loading && !stats ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" component="div" fontWeight={700} sx={{ mt: 0.5 }}>
                      {stats?.totalTopics || 0}
                    </Typography>
                  )}
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 48,
                    height: 48
                  }}
                >
                  <CategoryIcon />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {loading && !stats ? (
                  <Skeleton variant="text" width={100} height={24} />
                ) : (
                  <>
                    <Chip
                      icon={<TrendingUpIcon sx={{ fontSize: '0.85rem !important' }} />}
                      label={`+${stats?.topicsGrowth || 0}%`}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: 24
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      vs last month
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Posts
                  </Typography>
                  {loading && !stats ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" component="div" fontWeight={700} sx={{ mt: 0.5 }}>
                      {stats?.totalPosts || 0}
                    </Typography>
                  )}
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                    width: 48,
                    height: 48
                  }}
                >
                  <ShowChartIcon />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {loading && !stats ? (
                  <Skeleton variant="text" width={100} height={24} />
                ) : (
                  <>
                    <Chip
                      icon={<TrendingUpIcon sx={{ fontSize: '0.85rem !important' }} />}
                      label={`+${stats?.postsGrowth || 0}%`}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: 24
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      vs last month
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Opportunities
                  </Typography>
                  {loading && !stats ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" component="div" fontWeight={700} sx={{ mt: 0.5 }}>
                      {stats?.totalOpportunities || 0}
                    </Typography>
                  )}
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    width: 48,
                    height: 48
                  }}
                >
                  <PieChartIcon />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {loading && !stats ? (
                  <Skeleton variant="text" width={100} height={24} />
                ) : (
                  <>
                    <Chip
                      icon={<TrendingUpIcon sx={{ fontSize: '0.85rem !important' }} />}
                      label={`+${stats?.opportunitiesGrowth || 0}%`}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: 24
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      vs last month
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Engagement Rate
                  </Typography>
                  {loading && !stats ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" component="div" fontWeight={700} sx={{ mt: 0.5 }}>
                      {stats?.averageEngagement || 0}%
                    </Typography>
                  )}
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                    width: 48,
                    height: 48
                  }}
                >
                  <PeopleOutlineOutlinedIcon />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {loading && !stats ? (
                  <Skeleton variant="text" width={100} height={24} />
                ) : (
                  <>
                    <Chip
                      icon={<TrendingUpIcon sx={{ fontSize: '0.85rem !important' }} />}
                      label={`+${stats?.engagementGrowth || 0}%`}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: 24
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      vs last month
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trending Topics Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" fontWeight={600}>
            Trending Topics
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft || loading}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                }
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleScrollRight}
              disabled={!canScrollRight || loading}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                }
              }}
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Scrollable topics container */}
        <Box
          ref={topicsScrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            pb: 2,
            scrollbarWidth: 'none', // Firefox
            '&::-webkit-scrollbar': { // Chrome, Safari, Edge
              display: 'none'
            },
            gap: 3
          }}
        >
          {loading && trendingTopics.length === 0 ? (
            // Show skeleton loaders while loading
            Array.from(new Array(4)).map((_, index) => (
              <Card
                key={index}
                sx={{
                  minWidth: 450,
                  maxWidth: 500,
                  width: '100%',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Skeleton variant="text" width={200} height={32} />
                    <Skeleton variant="circular" width={24} height={24} />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={8} width="100%" sx={{ borderRadius: 4, mb: 0.5 }} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 6 }} />
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 6 }} />
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 6 }} />
                  </Box>

                  <Skeleton variant="text" width={100} height={24} sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Skeleton variant="text" width={140} height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="70%" height={20} />
                  </Box>

                  <Box>
                    <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            trendingTopics.map((topic) => {
              // Get detailed data for this topic
              const topicDetail = topicDetails[topic.id];
              const isTopicLoading = loadingTopics[topic.id];

              return (
                <Card
                  key={topic.id}
                  onClick={() => handleViewFullDetails(topic.id)}
                  sx={{
                    minWidth: 450,
                    maxWidth: 500,
                    width: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" component="div" fontWeight={600} noWrap>
                        {topicDetail?.title || topic.name || 'Trending Topic'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {topicDetail?.mention_count || topic.mention_count || '0'} mentions
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {isTopicLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <CircularProgress size={40} />
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Engagement Score
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Box sx={{ flexGrow: 1, mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={topicDetail?.opportunity_score || topic.score || 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    bgcolor: theme.palette.primary.main,
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="body2" fontWeight={600}>
                              {topicDetail?.opportunity_score || topic.score || 0}%
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {/* Use keywords from topicDetail if available */}
                          {((topicDetail?.keywords || topic.keywords) || []).slice(0, 3).map((keyword: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={keyword}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                          ))}
                          {((topicDetail?.keywords || topic.keywords) || []).length > 3 && (
                            <Chip
                              label={`+${(topicDetail?.keywords || topic.keywords || []).length - 3}`}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.grey[500], 0.1),
                                color: theme.palette.text.secondary,
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <TrendingUpOutlinedIcon
                            fontSize="small"
                            sx={{ color: theme.palette.success.main, mr: 0.5 }}
                          />
                          <Typography variant="body2" fontWeight={500} color="success.main">
                            {topicDetail?.growth_percentage || topic.trend || 0}% this week
                          </Typography>
                        </Box>

                        {/* Pain Points Section */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                            Pain Points
                          </Typography>
                          <Box sx={{ maxHeight: 120, overflowY: 'auto', pr: 1 }}>
                            {(topicDetail?.pain_points && topicDetail.pain_points.length > 0) ? (
                              topicDetail.pain_points.slice(0, 3).map((point: PainPoint, idx: number) => (
                                <Box key={idx} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: 'error.main',
                                      mt: 0.8,
                                      mr: 1.5
                                    }}
                                  />
                                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                    {point.text}
                                  </Typography>
                                </Box>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No pain points recorded for this topic yet.
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Solution Requests Section */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                            Solution Requests
                          </Typography>
                          <Box sx={{ maxHeight: 120, overflowY: 'auto', pr: 1 }}>
                            {(topicDetail?.solution_requests && topicDetail.solution_requests.length > 0) ? (
                              topicDetail.solution_requests.slice(0, 3).map((request: SolutionRequest, idx: number) => (
                                <Box key={idx} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: 'info.main',
                                      mt: 0.8,
                                      mr: 1.5
                                    }}
                                  />
                                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                    {request.text}
                                  </Typography>
                                </Box>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No solution requests recorded for this topic yet.
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* App Ideas Section */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                            App Ideas
                          </Typography>
                          <Box sx={{ maxHeight: 120, overflowY: 'auto', pr: 1 }}>
                            {(topicDetail?.app_ideas && topicDetail.app_ideas.length > 0) ? (
                              topicDetail.app_ideas.slice(0, 3).map((idea: AppIdea, idx: number) => (
                                <Box key={idx} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: 'success.main',
                                      mt: 0.8,
                                      mr: 1.5
                                    }}
                                  />
                                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                    {idea.text || idea.title}
                                  </Typography>
                                </Box>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No app ideas recorded for this topic yet.
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>
      </Box>

      {/* View All Topics Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
        <Button
          variant="outlined"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/topics')}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          View All Topics
        </Button>
      </Box>

      {/* Footer with Navigation and Contact Info */}
      <Box sx={{ mt: 8, mb: 4, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, pt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              SaaS Idea Engine
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              A powerful tool for discovering market opportunities and generating app ideas based on real user needs.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built by Rachmad Nafisholeh
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: <a href="mailto:rachmadnafisholeh@gmail.com" style={{ color: theme.palette.primary.main }}>rachmadnafisholeh@gmail.com</a>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              GitHub: <a href="https://github.com/nafisholeh" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main }}>github.com/nafisholeh</a>
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Explore
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/')}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/topics')}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
                  >
                    Topic Explorer
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/opportunities')}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
                  >
                    Opportunity Finder
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Analysis
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/market-analysis')}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
                  >
                    Market Analysis
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/text-analysis')}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
                  >
                    Text Analysis
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Contribute
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/submit-idea')}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
                  >
                    Submit Idea
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/about')}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
                  >
                    About
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} Idea Engine. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;