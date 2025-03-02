import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { UserSubmittedIdea } from '../types';
import { getCategories, submitIdea } from '../services/api';

const IdeaSubmission: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserSubmittedIdea>({
    title: '',
    description: '',
    category: '',
    target_audience: '',
    pain_points: [''],
    features: [''],
    competitor_urls: [''],
    monetization_model: '',
    estimated_budget: 0,
    submitter_email: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setFormData({
      ...formData,
      category: e.target.value
    });
  };

  const handleArrayItemChange = (
    field: 'pain_points' | 'features' | 'competitor_urls',
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const addArrayItem = (field: 'pain_points' | 'features' | 'competitor_urls') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (field: 'pain_points' | 'features' | 'competitor_urls', index: number) => {
    if (formData[field].length > 1) {
      const newArray = [...formData[field]];
      newArray.splice(index, 1);
      setFormData({
        ...formData,
        [field]: newArray
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }
    
    try {
      setLoading(true);
      const response = await submitIdea(formData);
      
      if (response.success) {
        setFormData({
          title: '',
          description: '',
          category: '',
          target_audience: '',
          pain_points: [''],
          features: [''],
          competitor_urls: [''],
          monetization_model: '',
          estimated_budget: 0,
          submitter_email: ''
        });
        
        setSuccess(true);
      } else {
        setError(response.message || "Failed to submit idea");
      }
    } catch (err) {
      setError("An error occurred while submitting your idea. Please try again.");
      console.error("Idea submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  const formatCategoryName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Submit Your SaaS Idea
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share your idea with us for validation and feedback based on our market analysis
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Idea Title"
                name="title"
                value={formData.title}
                onChange={handleTextChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleTextChange}
                variant="outlined"
                multiline
                rows={4}
                helperText="Describe your SaaS idea in detail"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleCategoryChange}
                  disabled={loading}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {formatCategoryName(category)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Audience"
                name="target_audience"
                value={formData.target_audience}
                onChange={handleTextChange}
                variant="outlined"
                helperText="Who would use your SaaS product?"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Pain Points
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                What problems does your idea solve?
              </Typography>
              {formData.pain_points.map((point, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Pain Point ${index + 1}`}
                    value={point}
                    onChange={(e) => handleArrayItemChange('pain_points', index, e.target.value)}
                    variant="outlined"
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => removeArrayItem('pain_points', index)}
                    disabled={formData.pain_points.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => addArrayItem('pain_points')}
                sx={{ mt: 1 }}
              >
                Add Pain Point
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Key Features
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                What are the main features of your SaaS idea?
              </Typography>
              {formData.features.map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => handleArrayItemChange('features', index, e.target.value)}
                    variant="outlined"
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => removeArrayItem('features', index)}
                    disabled={formData.features.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => addArrayItem('features')}
                sx={{ mt: 1 }}
              >
                Add Feature
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Competitor URLs (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                List any similar products or competitors
              </Typography>
              {formData.competitor_urls.map((url, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Competitor URL ${index + 1}`}
                    value={url}
                    onChange={(e) => handleArrayItemChange('competitor_urls', index, e.target.value)}
                    variant="outlined"
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => removeArrayItem('competitor_urls', index)}
                    disabled={formData.competitor_urls.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => addArrayItem('competitor_urls')}
                sx={{ mt: 1 }}
              >
                Add Competitor
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Email (Optional)"
                name="submitter_email"
                type="email"
                value={formData.submitter_email}
                onChange={handleTextChange}
                variant="outlined"
                helperText="We'll send you feedback on your idea"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={24} color="inherit" /> : null}
              >
                {submitting ? 'Submitting...' : 'Submit Your Idea'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Your idea has been submitted successfully! We'll review it and provide feedback.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default IdeaSubmission; 