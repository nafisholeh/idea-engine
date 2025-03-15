import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab
} from '@mui/material';
import AnalysisIcon from '@mui/icons-material/Analytics';
import { PainPoint, AppIdea } from '../types';
import { 
  analyzeSentiment, 
  extractPainPoints, 
  generateAppIdeas, 
  calculateOpportunityScore 
} from '../services/pythonApi';
import PainPointsComponent from '../components/PainPointsComponent';
import AppIdeasComponent from '../components/AppIdeasComponent';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TextAnalysisPage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [category, setCategory] = useState<string>('software');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [results, setResults] = useState<{
    sentiment?: { polarity: number; subjectivity: number };
    scores?: { frustration: number; urgency: number };
    painPoints: PainPoint[];
    appIdeas: AppIdea[];
    opportunityScore?: number;
  }>({
    painPoints: [],
    appIdeas: []
  });

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Split text into paragraphs
      const paragraphs = text
        .split('\n')
        .filter(paragraph => paragraph.trim().length > 0);

      // Analyze sentiment
      const sentimentResult = await analyzeSentiment(text);

      // Extract pain points
      const painPointsResult = await extractPainPoints(paragraphs);
      
      // Generate app ideas based on pain points
      const appIdeasResult = await generateAppIdeas(
        painPointsResult.pain_points.slice(0, 5),
        category
      );

      // Calculate opportunity score
      const opportunityResult = await calculateOpportunityScore(
        painPointsResult.pain_points,
        50, // Default growth rate
        paragraphs.length // Use paragraph count as mention count
      );

      setResults({
        sentiment: sentimentResult.sentiment,
        scores: sentimentResult.scores,
        painPoints: painPointsResult.pain_points,
        appIdeas: appIdeasResult.app_ideas,
        opportunityScore: opportunityResult.opportunity_scores.total_score
      });

      setLoading(false);
    } catch (err) {
      console.error('Error analyzing text:', err);
      setError('Failed to analyze text. Please try again later.');
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResults({
      painPoints: [],
      appIdeas: []
    });
    setError(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Text Analysis
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Analyze text from Reddit, Hacker News, Quora, or any other source to identify pain points and potential SaaS app ideas.
        </Typography>

        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Enter text to analyze"
                multiline
                rows={8}
                fullWidth
                value={text}
                onChange={handleTextChange}
                placeholder="Paste conversations, comments, or posts from Reddit, Hacker News, Quora, etc."
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={category}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="software">Software</MenuItem>
                  <MenuItem value="productivity">Productivity</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="entertainment">Entertainment</MenuItem>
                  <MenuItem value="social">Social</MenuItem>
                  <MenuItem value="ecommerce">E-commerce</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <AnalysisIcon />}
                sx={{ flex: 1 }}
              >
                {loading ? 'Analyzing...' : 'Analyze Text'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClear}
                disabled={loading || !text.trim()}
                sx={{ flex: 1 }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {results.painPoints.length > 0 && (
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="analysis results tabs">
                <Tab label="Pain Points" />
                <Tab label="App Ideas" />
                <Tab label="Sentiment Analysis" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <PainPointsComponent 
                painPoints={results.painPoints} 
                variant="detailed"
                title="Identified Pain Points"
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <AppIdeasComponent 
                appIdeas={results.appIdeas} 
                variant="detailed"
                title="Generated App Ideas"
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Sentiment Analysis
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Sentiment Scores
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Polarity: {results.sentiment?.polarity.toFixed(2) || 'N/A'} 
                          {results.sentiment && (
                            <span> ({results.sentiment.polarity > 0 ? 'Positive' : results.sentiment.polarity < 0 ? 'Negative' : 'Neutral'})</span>
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Subjectivity: {results.sentiment?.subjectivity.toFixed(2) || 'N/A'}
                          {results.sentiment && (
                            <span> ({results.sentiment.subjectivity > 0.5 ? 'Subjective' : 'Objective'})</span>
                          )}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Opportunity Analysis
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Frustration Score: {results.scores?.frustration.toFixed(1) || 'N/A'}/100
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Urgency Score: {results.scores?.urgency.toFixed(1) || 'N/A'}/100
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall Opportunity Score: {results.opportunityScore?.toFixed(1) || 'N/A'}/100
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default TextAnalysisPage; 