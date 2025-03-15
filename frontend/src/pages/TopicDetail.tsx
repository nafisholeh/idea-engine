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
  useTheme,
  Tabs,
  Tab
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
import { RedditTopic, AppIdea } from '../types';
import { getTopicById } from '../services/api';

// Import our new components
import PainPointsComponent from '../components/PainPointsComponent';
import SolutionRequestsComponent from '../components/SolutionRequestsComponent';
import AppIdeasComponent from '../components/AppIdeasComponent';

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
      id={`topic-tabpanel-${index}`}
      aria-labelledby={`topic-tab-${index}`}
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

const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<RedditTopic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedIdea, setSelectedIdea] = useState<AppIdea | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        const topicData = await getTopicById(id || '');
        setTopic(topicData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching topic:', err);
        setError('Failed to load topic details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchTopic();
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSelectIdea = (idea: AppIdea) => {
    setSelectedIdea(idea);
  };

  const formatCategoryName = (category: string): string => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
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

  if (!topic) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ my: 2 }}>
          Topic not found.
        </Alert>
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

  // Prepare chart data
  const chartData = {
    labels: topic.trend_data?.map(point => {
      const date = new Date(point.month);
      return date.toLocaleString('default', { month: 'short', year: '2-digit' });
    }) || [],
    datasets: [
      {
        label: 'Mentions',
        data: topic.trend_data?.map(point => point.mentions) || [],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Trend Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Container maxWidth="lg">
      <Button
        component={Link}
        to="/topics"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Topics
      </Button>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {topic.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={formatCategoryName(topic.category)} 
                color="primary" 
                variant="outlined" 
              />
              <Chip
                icon={<TrendingUpIcon />}
                label={`${topic.growth_rate || topic.growth_percentage || 0}% Growth`}
                color={
                  (topic.growth_rate || topic.growth_percentage || 0) > 50 ? 'success' :
                  (topic.growth_rate || topic.growth_percentage || 0) > 20 ? 'info' : 'default'
                }
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date(topic.last_updated || Date.now()).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mentions: {topic.mention_count || 0}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ height: 300, mb: 4 }}>
          <Line options={chartOptions} data={chartData} />
        </Box>

        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="topic detail tabs">
              <Tab label="Pain Points" />
              <Tab label="Solution Requests" />
              <Tab label="App Ideas" />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <PainPointsComponent 
              painPoints={topic.pain_points || []} 
              variant="detailed"
              title="User Pain Points"
            />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <SolutionRequestsComponent 
              solutionRequests={topic.solution_requests || []} 
              variant="detailed"
              title="User Solution Requests"
            />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            {selectedIdea ? (
              <Box>
                <Button 
                  onClick={() => setSelectedIdea(null)}
                  startIcon={<ArrowBackIcon />}
                  sx={{ mb: 2 }}
                >
                  Back to Ideas
                </Button>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      {selectedIdea.title || selectedIdea.text}
                    </Typography>
                    {selectedIdea.description && (
                      <Typography variant="body1" paragraph>
                        {selectedIdea.description}
                      </Typography>
                    )}
                    <Chip
                      icon={<LightbulbOutlinedIcon />}
                      label={`${selectedIdea.count || 0} mentions`}
                      color="primary"
                    />
                  </CardContent>
                </Card>
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Related Pain Points
                  </Typography>
                  <PainPointsComponent 
                    painPoints={topic.pain_points?.slice(0, 3) || []} 
                    variant="compact"
                    title=""
                  />
                </Box>
              </Box>
            ) : (
              <AppIdeasComponent 
                appIdeas={topic.app_ideas || []} 
                variant="detailed"
                title="Potential SaaS App Ideas"
                onSelectIdea={handleSelectIdea}
              />
            )}
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default TopicDetail; 