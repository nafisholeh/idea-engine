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
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Rating,
  Tooltip,
  IconButton,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Insights as InsightsIcon,
  Category as CategoryIcon,
  Lightbulb as LightbulbIcon,
  Info as InfoIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { getOpportunities, getDashboardStats } from '../utils/api';
import { RedditTopic, CategoryStat } from '../types';

const OpportunityFinder: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<RedditTopic[]>([]);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [minScore, setMinScore] = useState<number>(70);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories for filter
        const statsData = await getDashboardStats();
        setCategories(statsData.category_distribution);
        
        // Fetch opportunities with minimum score
        const opportunitiesData = await getOpportunities(minScore);
        
        // Filter by category if needed
        const filteredOpportunities = selectedCategory === 'all'
          ? opportunitiesData
          : opportunitiesData.filter(opp => opp.category === selectedCategory);
        
        setOpportunities(filteredOpportunities);
        setError(null);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [minScore, selectedCategory]);

  const handleScoreChange = (event: Event, newValue: number | number[]) => {
    setMinScore(newValue as number);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

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

  if (loading) {
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
          Opportunity Finder
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Discover high-potential SaaS ideas based on our opportunity scoring algorithm.
          These opportunities are identified from Reddit discussions and ranked by market potential.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography id="opportunity-score-slider" gutterBottom>
              Minimum Opportunity Score: {minScore}
            </Typography>
            <Slider
              value={minScore}
              onChange={handleScoreChange}
              aria-labelledby="opportunity-score-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={50}
              max={95}
            />
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Higher scores indicate stronger market potential based on mention frequency,
                growth rate, pain points, and solution requests.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
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
        </Grid>
      </Paper>

      {/* Opportunities */}
      {opportunities.length > 0 ? (
        <Grid container spacing={3}>
          {opportunities.map((opportunity) => (
            <Grid item xs={12} sm={6} md={4} key={opportunity.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="topic-card">
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {opportunity.name}
                    </Typography>
                    <Tooltip title={`Opportunity Score: ${opportunity.opportunity_score || 0}/100`}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          value={(opportunity.opportunity_score || 0) / 20}
                          readOnly
                          precision={0.5}
                          emptyIcon={<StarBorderIcon fontSize="inherit" />}
                          icon={<StarIcon fontSize="inherit" />}
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={formatCategoryName(opportunity.category)}
                      size="small"
                      icon={<CategoryIcon />}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`${opportunity.growth_percentage > 0 ? '+' : ''}${opportunity.growth_percentage}%`}
                      color={opportunity.growth_percentage > 0 ? 'success' : 'error'}
                      size="small"
                      icon={<TrendingUpIcon />}
                    />
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>Pain Point:</strong> {opportunity.pain_points && opportunity.pain_points.length > 0
                      ? opportunity.pain_points[0].text
                      : 'No pain points identified yet.'}
                  </Typography>
                  {opportunity.app_ideas && opportunity.app_ideas.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <LightbulbIcon fontSize="small" sx={{ mr: 1, color: 'warning.main', mt: 0.5 }} />
                      <Typography variant="body2" fontWeight="medium">
                        <strong>App Idea:</strong> {opportunity.app_ideas[0].text}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    to={`/topics/${opportunity.id}`}
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
            No opportunities found matching your criteria
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try lowering the minimum opportunity score or selecting a different category
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => {
              setMinScore(50);
              setSelectedCategory('all');
            }}
          >
            Reset Filters
          </Button>
        </Box>
      )}

      {/* Opportunity Score Explanation */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          How Opportunity Scores Are Calculated
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          Our proprietary opportunity scoring algorithm analyzes multiple factors to identify
          promising SaaS opportunities:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Mention Frequency (25%)
              </Typography>
              <Typography variant="body2">
                How often the topic is mentioned across Reddit discussions.
                Higher frequency indicates stronger user interest.
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Growth Rate (25%)
              </Typography>
              <Typography variant="body2">
                How quickly mentions are increasing over time.
                Rapid growth suggests an emerging opportunity.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Pain Points (25%)
              </Typography>
              <Typography variant="body2">
                The number and intensity of user frustrations expressed.
                More pain points indicate stronger market need.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Solution Requests (25%)
              </Typography>
              <Typography variant="body2">
                How actively users are seeking solutions.
                Direct requests for solutions indicate readiness to adopt new products.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default OpportunityFinder; 