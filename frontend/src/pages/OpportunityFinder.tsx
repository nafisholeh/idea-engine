import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { RedditTopic } from '../types';
import { getOpportunities, getCategories } from '../services/api';

const OpportunityFinder: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<RedditTopic[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(70);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

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
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const opportunitiesData = await getOpportunities(minScore, selectedCategory);
        setOpportunities(opportunitiesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching opportunities:", err);
        setError("Failed to load opportunities. Please try again later.");
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [minScore, selectedCategory]);

  const handleScoreChange = (event: Event, newValue: number | number[]) => {
    setMinScore(newValue as number);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const formatCategoryName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  };

  if (loading && opportunities.length === 0) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading opportunities...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Opportunity Finder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover high-potential SaaS opportunities based on Reddit discussions and market analysis
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filter Opportunities
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>
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
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategory}
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
        </Grid>
      </Paper>

      {/* Opportunities */}
      {loading ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : opportunities.length > 0 ? (
        <Grid container spacing={3}>
          {opportunities.map((opportunity) => (
            <Grid item key={opportunity.id} xs={12} md={6} lg={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {opportunity.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatCategoryName(opportunity.category)}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      Score: {opportunity.opportunity_scores?.total_score || opportunity.opportunity_score || 0}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Top Pain Points:
                  </Typography>
                  <ul>
                    {opportunity.pain_points?.slice(0, 2).map((point, index) => (
                      <li key={index}>
                        <Typography variant="body2">
                          {point.description}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                  <Typography variant="subtitle1" gutterBottom>
                    App Ideas:
                  </Typography>
                  <ul>
                    {opportunity.app_ideas?.slice(0, 1).map((idea, index) => (
                      <li key={index}>
                        <Typography variant="body2">
                          {idea.title}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    href={`/topics/${opportunity.id}`}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6">
            No opportunities found matching your criteria.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try lowering the minimum score or selecting a different category.
          </Typography>
        </Box>
      )}

      {/* Explanation */}
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          How Opportunity Scores Are Calculated
        </Typography>
        <Typography variant="body2" paragraph>
          Our algorithm analyzes several factors to determine the opportunity score:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Growth Rate (40%)
            </Typography>
            <Typography variant="body2">
              How quickly mentions of this topic are increasing over time
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Pain Point Intensity (30%)
            </Typography>
            <Typography variant="body2">
              The frequency and severity of problems mentioned by users
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Market Gap Analysis (30%)
            </Typography>
            <Typography variant="body2">
              Assessment of existing solutions and their ability to address the identified pain points
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default OpportunityFinder; 