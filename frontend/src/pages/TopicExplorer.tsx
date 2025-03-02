import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Insights as InsightsIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Lightbulb as LightbulbIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { getTopics, getDashboardStats } from '../utils/api';
import { RedditTopic, CategoryStat, FilterOptions } from '../types';

const ITEMS_PER_PAGE = 9;

const TopicExplorer: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<RedditTopic[]>([]);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<FilterOptions>({
    timeframe: '30days',
    category: 'all',
    search: '',
    sortBy: 'growth',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories for filter
        const statsData = await getDashboardStats();
        setCategories(statsData.category_distribution);
        
        // Fetch topics with filters
        const topicsData = await getTopics(
          filters.timeframe,
          filters.category,
          filters.search
        );
        
        // Sort topics based on filters
        const sortedTopics = sortTopics(topicsData, filters.sortBy, filters.sortOrder);
        
        setTopics(sortedTopics);
        setTotalPages(Math.ceil(sortedTopics.length / ITEMS_PER_PAGE));
        setError(null);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to load topics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.timeframe, filters.category]);

  useEffect(() => {
    // This effect handles search and sort changes without refetching from API
    if (!loading && topics.length > 0) {
      let filteredTopics = [...topics];
      
      // Apply search filter locally
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTopics = filteredTopics.filter(topic => 
          topic.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort topics
      const sortedTopics = sortTopics(filteredTopics, filters.sortBy, filters.sortOrder);
      
      setTopics(sortedTopics);
      setTotalPages(Math.ceil(sortedTopics.length / ITEMS_PER_PAGE));
      setPage(1); // Reset to first page when filters change
    }
  }, [filters.search, filters.sortBy, filters.sortOrder]);

  const sortTopics = (topicsToSort: RedditTopic[], sortBy: string, sortOrder: string): RedditTopic[] => {
    return [...topicsToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'growth':
          comparison = (a.growth_percentage || 0) - (b.growth_percentage || 0);
          break;
        case 'mentions':
          comparison = a.mention_count - b.mention_count;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = (a.growth_percentage || 0) - (b.growth_percentage || 0);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setFilters({ ...filters, timeframe: event.target.value });
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setFilters({ ...filters, category: event.target.value });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: event.target.value });
  };

  const handleSortByChange = (event: SelectChangeEvent) => {
    setFilters({ ...filters, sortBy: event.target.value });
  };

  const handleSortOrderChange = () => {
    setFilters({ 
      ...filters, 
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
    });
  };

  const paginatedTopics = topics.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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

  if (loading && topics.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Topic Explorer
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Discover trending topics and SaaS opportunities from Reddit discussions.
          Filter by category, timeframe, or search for specific topics.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 1,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Topics"
              variant="outlined"
              value={filters.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={filters.category}
                onChange={handleCategoryChange}
                label="Category"
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.category} value={cat.category}>
                    {formatCategoryName(cat.category)} ({cat.count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
              <Select
                labelId="timeframe-select-label"
                id="timeframe-select"
                value={filters.timeframe}
                onChange={handleTimeframeChange}
                label="Timeframe"
              >
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 3 Months</MenuItem>
                <MenuItem value="180days">Last 6 Months</MenuItem>
                <MenuItem value="365days">Last 1 Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl fullWidth variant="outlined" sx={{ mr: 1 }}>
                <InputLabel id="sort-select-label">Sort By</InputLabel>
                <Select
                  labelId="sort-select-label"
                  id="sort-select"
                  value={filters.sortBy}
                  onChange={handleSortByChange}
                  label="Sort By"
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="growth">Growth Rate</MenuItem>
                  <MenuItem value="mentions">Mention Count</MenuItem>
                  <MenuItem value="name">Topic Name</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}>
                <IconButton onClick={handleSortOrderChange} color="primary">
                  {filters.sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Active Filters:
              </Typography>
              <Chip
                label={`Timeframe: ${filters.timeframe === '7days' ? 'Last 7 Days' : 
                  filters.timeframe === '30days' ? 'Last 30 Days' : 
                  filters.timeframe === '90days' ? 'Last 3 Months' : 
                  filters.timeframe === '180days' ? 'Last 6 Months' : 'Last 1 Year'}`}
                size="small"
                onDelete={() => setFilters({ ...filters, timeframe: '30days' })}
                color="primary"
                variant="outlined"
              />
              {filters.category !== 'all' && (
                <Chip
                  label={`Category: ${formatCategoryName(filters.category)}`}
                  size="small"
                  onDelete={() => setFilters({ ...filters, category: 'all' })}
                  color="primary"
                  variant="outlined"
                />
              )}
              {filters.search && (
                <Chip
                  label={`Search: ${filters.search}`}
                  size="small"
                  onDelete={() => setFilters({ ...filters, search: '' })}
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                label={`Sort: ${filters.sortBy === 'growth' ? 'Growth Rate' : 
                  filters.sortBy === 'mentions' ? 'Mention Count' : 'Topic Name'} (${
                  filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'})`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Topics Grid */}
      {paginatedTopics.length > 0 ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {paginatedTopics.map((topic) => (
            <Grid item xs={12} sm={6} md={4} key={topic.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="topic-card">
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {topic.name}
                    </Typography>
                    {topic.growth_percentage !== undefined && (
                      <Chip
                        label={`${topic.growth_percentage > 0 ? '+' : ''}${topic.growth_percentage}%`}
                        color={topic.growth_percentage > 0 ? 'success' : 'error'}
                        size="small"
                        icon={<TrendingUpIcon />}
                      />
                    )}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={formatCategoryName(topic.category)}
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
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {topic.pain_points && topic.pain_points.length > 0
                      ? topic.pain_points[0].text
                      : 'No pain points identified yet.'}
                  </Typography>
                  {topic.app_ideas && topic.app_ideas.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <LightbulbIcon fontSize="small" sx={{ mr: 1, color: 'warning.main', mt: 0.5 }} />
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
      ) : (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No topics found matching your filters
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search criteria or category filters
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setFilters({
              timeframe: '30days',
              category: 'all',
              search: '',
              sortBy: 'growth',
              sortOrder: 'desc'
            })}
          >
            Reset Filters
          </Button>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default TopicExplorer; 