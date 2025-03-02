import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { Send as SendIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { submitIdea } from '../utils/api';
import { UserSubmittedIdea } from '../types';

const IdeaSubmission: React.FC = () => {
  const [formData, setFormData] = useState<UserSubmittedIdea>({
    title: '',
    description: '',
    category: '',
    targetAudience: '',
    painPoints: [],
    features: [],
    competitorUrls: [],
    submitterEmail: ''
  });
  
  const [newPainPoint, setNewPainPoint] = useState<string>('');
  const [newFeature, setNewFeature] = useState<string>('');
  const [newCompetitor, setNewCompetitor] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, category: e.target.value });
  };

  const handleAddPainPoint = () => {
    if (newPainPoint.trim() !== '') {
      setFormData({
        ...formData,
        painPoints: [...formData.painPoints, newPainPoint.trim()]
      });
      setNewPainPoint('');
    }
  };

  const handleRemovePainPoint = (index: number) => {
    const updatedPainPoints = [...formData.painPoints];
    updatedPainPoints.splice(index, 1);
    setFormData({ ...formData, painPoints: updatedPainPoints });
  };

  const handleAddFeature = () => {
    if (newFeature.trim() !== '') {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() !== '') {
      setFormData({
        ...formData,
        competitorUrls: [...formData.competitorUrls, newCompetitor.trim()]
      });
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    const updatedCompetitors = [...formData.competitorUrls];
    updatedCompetitors.splice(index, 1);
    setFormData({ ...formData, competitorUrls: updatedCompetitors });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields (title, description, and category).');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await submitIdea(formData);
      
      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          targetAudience: '',
          painPoints: [],
          features: [],
          competitorUrls: [],
          submitterEmail: ''
        });
      } else {
        setError(response.message || 'Failed to submit idea. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting idea:', err);
      setError('An error occurred while submitting your idea. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Submit Your SaaS Idea
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Share your SaaS idea with us for analysis and validation against our dataset of Reddit discussions.
          We'll provide feedback on market potential and user needs.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
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
                helperText="A concise name for your SaaS idea"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="tech">Technology</MenuItem>
                  <MenuItem value="productivity">Productivity</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="health">Health & Wellness</MenuItem>
                  <MenuItem value="entertainment">Entertainment</MenuItem>
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="communication">Communication</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Audience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleTextChange}
                variant="outlined"
                helperText="Who would use your SaaS product?"
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
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Pain Points Addressed
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Pain Point"
                    value={newPainPoint}
                    onChange={(e) => setNewPainPoint(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddPainPoint}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.painPoints.map((point, index) => (
                    <Chip
                      key={index}
                      label={point}
                      onDelete={() => handleRemovePainPoint(index)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Key Features
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Feature"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddFeature}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      onDelete={() => handleRemoveFeature(index)}
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Competitors (Optional)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Competitor URL"
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddCompetitor}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.competitorUrls.map((url, index) => (
                    <Chip
                      key={index}
                      label={url}
                      onDelete={() => handleRemoveCompetitor(index)}
                      color="default"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Email (Optional)"
                name="submitterEmail"
                type="email"
                value={formData.submitterEmail}
                onChange={handleTextChange}
                variant="outlined"
                helperText="We'll send you our analysis of your idea"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Idea'}
                </Button>
              </Box>
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
          Your idea has been submitted successfully! We'll analyze it and get back to you.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default IdeaSubmission; 