import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  useTheme
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { SolutionRequest } from '../types';

interface SolutionRequestsComponentProps {
  solutionRequests: SolutionRequest[];
  title?: string;
  showCount?: boolean;
  maxItems?: number;
  variant?: 'default' | 'compact' | 'detailed';
}

const SolutionRequestsComponent: React.FC<SolutionRequestsComponentProps> = ({
  solutionRequests,
  title = 'Solution Requests',
  showCount = true,
  maxItems = 10,
  variant = 'default'
}) => {
  const theme = useTheme();
  
  // Sort solution requests by count (descending)
  const sortedSolutionRequests = [...solutionRequests].sort((a, b) => 
    (b.count || b.mention_count || 0) - (a.count || a.mention_count || 0)
  ).slice(0, maxItems);
  
  if (variant === 'compact') {
    return (
      <Box>
        {title && <Typography variant="h6" gutterBottom>{title}</Typography>}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {sortedSolutionRequests.map((request, index) => (
            <Chip
              key={index}
              label={request.text}
              color="info"
              variant="outlined"
              size="small"
              icon={<HelpOutlineIcon />}
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
          {sortedSolutionRequests.map((request, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {request.text}
                  </Typography>
                  {request.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {request.description}
                    </Typography>
                  )}
                  {showCount && (
                    <Chip
                      label={`${request.count || request.mention_count || 0} mentions`}
                      size="small"
                      color="info"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
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
          {sortedSolutionRequests.map((request, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <HelpOutlineIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  primary={request.text}
                  secondary={
                    <>
                      {request.description && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          {request.description}
                        </Typography>
                      )}
                      {showCount && (
                        <Chip
                          label={`${request.count || request.mention_count || 0} mentions`}
                          size="small"
                          sx={{ 
                            backgroundColor: theme.palette.info.light,
                            color: theme.palette.info.contrastText,
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
          {sortedSolutionRequests.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No solution requests found"
                secondary="There are no solution requests recorded for this topic yet."
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default SolutionRequestsComponent; 