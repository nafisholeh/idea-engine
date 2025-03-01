import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Chip,
  Divider,
  LinearProgress
} from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';

interface Topic {
  id: number;
  name: string;
  category: string;
  growthPercentage: number;
  mentionCount: number;
}

interface TrendingTopicsProps {
  topics: Topic[];
}

const TrendingTopics: React.FC<TrendingTopicsProps> = ({ topics }) => {
  // Function to determine color based on growth percentage
  const getGrowthColor = (growth: number) => {
    if (growth >= 100) return 'success';
    if (growth >= 50) return 'primary';
    if (growth >= 0) return 'info';
    return 'error';
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            Trending Topics
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <List disablePadding>
          {topics.map((topic, index) => (
            <React.Fragment key={topic.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        {topic.name}
                      </Typography>
                      <Chip 
                        label={`${topic.growthPercentage > 0 ? '+' : ''}${topic.growthPercentage}%`} 
                        color={getGrowthColor(topic.growthPercentage) as "success" | "primary" | "info" | "error"}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          {topic.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {topic.mentionCount} mentions
                        </Typography>
                      </Box>
                      <Box mt={1}>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, Math.max(0, topic.growthPercentage))} 
                          color={getGrowthColor(topic.growthPercentage) as "success" | "primary" | "info" | "error"}
                        />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TrendingTopics; 