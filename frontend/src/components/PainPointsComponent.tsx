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
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PainPoint } from '../types';

interface PainPointsComponentProps {
  painPoints: PainPoint[];
  title?: string;
  showCount?: boolean;
  maxItems?: number;
  variant?: 'default' | 'compact' | 'detailed';
}

const PainPointsComponent: React.FC<PainPointsComponentProps> = ({
  painPoints,
  title = 'Pain Points',
  showCount = true,
  maxItems = 10,
  variant = 'default'
}) => {
  const theme = useTheme();
  
  // Sort pain points by count (descending)
  const sortedPainPoints = [...painPoints].sort((a, b) => 
    (b.count || b.mention_count || 0) - (a.count || a.mention_count || 0)
  ).slice(0, maxItems);
  
  if (variant === 'compact') {
    return (
      <Box>
        {title && <Typography variant="h6" gutterBottom>{title}</Typography>}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {sortedPainPoints.map((painPoint, index) => (
            <Chip
              key={index}
              label={painPoint.text}
              color="error"
              variant="outlined"
              size="small"
              icon={<ErrorOutlineIcon />}
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
          {sortedPainPoints.map((painPoint, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {painPoint.text}
                  </Typography>
                  {painPoint.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {painPoint.description}
                    </Typography>
                  )}
                  {showCount && (
                    <Chip
                      label={`${painPoint.count || painPoint.mention_count || 0} mentions`}
                      size="small"
                      color="primary"
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
          {sortedPainPoints.map((painPoint, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <ErrorOutlineIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={painPoint.text}
                  secondary={
                    <>
                      {painPoint.description && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          {painPoint.description}
                        </Typography>
                      )}
                      {showCount && (
                        <Chip
                          label={`${painPoint.count || painPoint.mention_count || 0} mentions`}
                          size="small"
                          sx={{ 
                            backgroundColor: theme.palette.error.light,
                            color: theme.palette.error.contrastText,
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
          {sortedPainPoints.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No pain points found"
                secondary="There are no pain points recorded for this topic yet."
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default PainPointsComponent; 