import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  useTheme
} from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { AppIdea } from '../types';

interface AppIdeasComponentProps {
  appIdeas: AppIdea[];
  title?: string;
  showCount?: boolean;
  maxItems?: number;
  variant?: 'default' | 'compact' | 'detailed';
  onSelectIdea?: (idea: AppIdea) => void;
}

const AppIdeasComponent: React.FC<AppIdeasComponentProps> = ({
  appIdeas,
  title = 'SaaS App Ideas',
  showCount = true,
  maxItems = 10,
  variant = 'default',
  onSelectIdea
}) => {
  const theme = useTheme();
  
  // Sort app ideas by count (descending)
  const sortedAppIdeas = [...appIdeas].sort((a, b) => 
    (b.count || 0) - (a.count || 0)
  ).slice(0, maxItems);
  
  if (variant === 'compact') {
    return (
      <Box>
        {title && <Typography variant="h6" gutterBottom>{title}</Typography>}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {sortedAppIdeas.map((idea, index) => (
            <Chip
              key={index}
              label={idea.title || idea.text}
              color="primary"
              variant="outlined"
              size="small"
              icon={<LightbulbOutlinedIcon />}
              onClick={() => onSelectIdea && onSelectIdea(idea)}
            />
          ))}
        </Box>
      </Box>
    );
  }
  
  if (variant === 'detailed') {
    return (
      <Box>
        {title && <Typography variant="h6" gutterBottom>{title}</Typography>}
        <Grid container spacing={2}>
          {sortedAppIdeas.map((idea, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {idea.title || idea.text}
                  </Typography>
                  {idea.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {idea.description}
                    </Typography>
                  )}
                  {showCount && (
                    <Chip
                      label={`${idea.count || 0} mentions`}
                      size="small"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                {onSelectIdea && (
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => onSelectIdea(idea)}
                      startIcon={<LightbulbOutlinedIcon />}
                    >
                      Explore Idea
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  
  // Default variant
  return (
    <Box>
      {title && <Typography variant="h6" gutterBottom>{title}</Typography>}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <List>
          {sortedAppIdeas.map((idea, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider component="li" />}
              {onSelectIdea ? (
                <ListItem 
                  alignItems="flex-start"
                  button
                  onClick={() => onSelectIdea(idea)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LightbulbOutlinedIcon color="primary" />
                        <Typography variant="subtitle1">
                          {idea.title || idea.text}
                        </Typography>
                      </Box>
                    }
                    secondary={idea.description || idea.text}
                  />
                  {showCount && (
                    <Chip 
                      label={`${idea.count} mentions`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                </ListItem>
              ) : (
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LightbulbOutlinedIcon color="primary" />
                        <Typography variant="subtitle1">
                          {idea.title || idea.text}
                        </Typography>
                      </Box>
                    }
                    secondary={idea.description || idea.text}
                  />
                  {showCount && (
                    <Chip 
                      label={`${idea.count} mentions`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                </ListItem>
              )}
            </React.Fragment>
          ))}
          {sortedAppIdeas.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No app ideas found"
                secondary="There are no app ideas recorded for this topic yet."
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default AppIdeasComponent; 