import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Forum as ForumIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';

interface DashboardSummaryProps {
  stats: {
    topicCount: number;
    totalMentions: number;
    trendingTopics: number;
    opportunities: number;
  };
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ stats }) => {
  const summaryItems = [
    { 
      title: 'Total Topics', 
      value: stats.topicCount, 
      icon: <ForumIcon color="primary" fontSize="large" />,
      description: 'Topics analyzed from Reddit'
    },
    { 
      title: 'Total Mentions', 
      value: stats.totalMentions, 
      icon: <ShowChartIcon color="secondary" fontSize="large" />,
      description: 'Mentions across all topics'
    },
    { 
      title: 'Trending Topics', 
      value: stats.trendingTopics, 
      icon: <TrendingUpIcon color="success" fontSize="large" />,
      description: 'Topics with positive growth'
    },
    { 
      title: 'Opportunities', 
      value: stats.opportunities, 
      icon: <LightbulbIcon color="warning" fontSize="large" />,
      description: 'High-potential business ideas'
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        {summaryItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  {item.icon}
                  <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                    {item.title}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h4" component="div">
                  {item.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardSummary; 