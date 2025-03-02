import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { RedditTopic } from '../types';
import { getTopicById } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<RedditTopic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchTopic = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const topicData = await getTopicById(parseInt(id));
        setTopic(topicData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching topic details:", err);
        setError("Failed to load topic details. Please try again later.");
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  const formatCategoryName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  };

  // Prepare chart data
  const chartData = {
    labels: topic?.trend_data?.map(point => point.date) || [],
    datasets: [
      {
        label: 'Mentions',
        data: topic?.trend_data?.map(point => point.mentions) || [],
        fill: false,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Mention Trend Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Mentions'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading topic details...</Typography>
      </Container>
    );
  }

  if (error || !topic) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || "Topic not found"}</Alert>
        <Button
          component={Link}
          to="/topics"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Topics
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        component={Link}
        to="/topics"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Topics
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {topic.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={formatCategoryName(topic.category)} 
                sx={{ mr: 2 }} 
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                <Typography variant="body1" color="success.main">
                  {topic.growth_percentage}% Growth
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" paragraph>
              This topic has been mentioned {topic.mention_count?.toLocaleString() || '0'} times in Reddit discussions.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {topic.last_updated ? new Date(topic.last_updated).toLocaleDateString() : 'Unknown'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Opportunity Score
                </Typography>
                <Typography variant="h3" component="div">
                  {topic.opportunity_scores?.total_score || topic.opportunity_score || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {((topic.opportunity_scores?.total_score || topic.opportunity_score || 0) >= 80)
                    ? 'High potential opportunity' 
                    : ((topic.opportunity_scores?.total_score || topic.opportunity_score || 0) >= 60)
                    ? 'Moderate potential opportunity'
                    : 'Lower potential opportunity'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Mention Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line options={chartOptions} data={chartData} />
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Pain Points
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {(topic.pain_points && topic.pain_points.length > 0) ? (
              <List>
                {topic.pain_points.map((point, index) => (
                  <ListItem key={index} divider={index < (topic.pain_points?.length || 0) - 1}>
                    <ListItemText
                      primary={point.description || point.text}
                      secondary={`Mentioned ${point.mention_count || point.count} times`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No pain points identified for this topic.
              </Typography>
            )}
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Solution Requests
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {(topic.solution_requests && topic.solution_requests.length > 0) ? (
              <List>
                {topic.solution_requests.map((request, index) => (
                  <ListItem key={index} divider={index < (topic.solution_requests?.length || 0) - 1}>
                    <ListItemText
                      primary={request.description || request.text}
                      secondary={`Requested ${request.mention_count || request.count} times`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No solution requests identified for this topic.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LightbulbOutlinedIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h5">
                App Ideas
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {(topic.app_ideas && topic.app_ideas.length > 0) ? (
              <List>
                {topic.app_ideas.map((idea, index) => (
                  <ListItem key={index} divider={index < (topic.app_ideas?.length || 0) - 1}>
                    <ListItemText
                      primary={idea.title}
                      secondary={idea.description}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No app ideas generated for this topic yet.
              </Typography>
            )}
            <Button 
              component={Link}
              to="/submit-idea"
              variant="contained" 
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Submit Your Idea
            </Button>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Related Topics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Data Visualization"
                  secondary="85% growth rate"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="API Integration"
                  secondary="72% growth rate"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="User Authentication"
                  secondary="65% growth rate"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TopicDetail; 