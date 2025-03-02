import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  SelectChangeEvent
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { RedditTopic, FilterOptions } from '../types';
import { getTopics, getCategories } from '../services/api';

const TopicExplorer: React.FC = () => {
  const [topics, setTopics] = useState<RedditTopic[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    timeframe: 'all',
    minGrowth: 0,
    sortBy: 'growth_percentage',
    sortDirection: 'desc'
  });

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const topicsData = await getTopics({
          ...filters,
          page,
          limit: itemsPerPage
        });
        
        // Handle both array and object response formats
        if (Array.isArray(topicsData)) {
          setTopics(topicsData);
          setTotalPages(Math.ceil(topicsData.length / itemsPerPage));
        } else {
          // Use type assertion to handle the object response format
          const responseData = topicsData as { topics: RedditTopic[], total: number };
          setTopics(responseData.topics || []);
          setTotalPages(Math.ceil((responseData.total || 0) / itemsPerPage));
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError("Failed to load topics. Please try again later.");
        setLoading(false);
      }
    };

    fetchTopics();
  }, [filters, page]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: event.target.value });
    setPage(1);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setFilters({ ...filters, category: event.target.value });
    setPage(1);
  };

  const handleGrowthChange = (event: Event, newValue: number | number[]) => {
    setFilters({ ...filters, minGrowth: newValue as number });
    setPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setFilters({ ...filters, sortBy: event.target.value });
    setPage(1);
  };

  const handleSortDirectionChange = (event: SelectChangeEvent) => {
    setFilters({ ...filters, sortDirection: event.target.value });
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const formatCategoryName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  };

  if (loading && page === 1) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading topics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Topic Explorer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover trending topics from Reddit discussions and analyze their growth potential
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Filter Topics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Topics"
              variant="outlined"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={filters.category}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {formatCategoryName(category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>
              Minimum Growth: {filters.minGrowth}%
            </Typography>
            <Slider
              value={filters.minGrowth}
              onChange={handleGrowthChange}
              aria-labelledby="growth-slider"
              valueLabelDisplay="auto"
              min={0}
              max={100}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="sort-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-select-label"
                value={filters.sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="growth_percentage">Growth Rate</MenuItem>
                <MenuItem value="mention_count">Mention Count</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="direction-select-label">Sort Direction</InputLabel>
              <Select
                labelId="direction-select-label"
                value={filters.sortDirection}
                label="Sort Direction"
                onChange={handleSortDirectionChange}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Topics Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : topics.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {topics.map((topic) => (
              <Grid item key={topic.id} xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {topic.name}
                    </Typography>
                    <Chip 
                      label={formatCategoryName(topic.category)} 
                      size="small" 
                      sx={{ mb: 2 }} 
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body1" color="success.main">
                        {topic.growth_percentage}% Growth
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {topic.mention_count?.toLocaleString() || '0'} mentions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last updated: {topic.last_updated ? new Date(topic.last_updated).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link} 
                      to={`/topics/${topic.id}`} 
                      size="small" 
                      color="primary"
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6">
            No topics found matching your criteria.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your filters to see more results.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default TopicExplorer; 