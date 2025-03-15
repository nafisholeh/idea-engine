import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import BarChartIcon from '@mui/icons-material/BarChart';
import RedditIcon from '@mui/icons-material/Reddit';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          About Idea Engine
        </Typography>
        
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            Idea Engine is a powerful tool designed to help entrepreneurs, product managers, and developers identify promising SaaS opportunities by analyzing discussions on platforms like Reddit, Hacker News, and Quora. 
            By leveraging natural language processing and data analysis, we extract valuable insights about user pain points, emerging trends, and market gaps.
          </Typography>
          <Typography variant="body1">
            Our mission is to democratize market research and make it easier for innovators to discover and validate SaaS ideas with real user data.
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 6 }} />
        
        <Typography variant="h5" gutterBottom>
          How It Works
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <RedditIcon sx={{ fontSize: 80, color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              </CardMedia>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Data Collection
                </Typography>
                <Typography>
                  We collect and analyze discussions from relevant subreddits where users talk about their problems, needs, and software solutions they're looking for.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  bgcolor: 'secondary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BarChartIcon sx={{ fontSize: 80, color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              </CardMedia>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Analysis
                </Typography>
                <Typography>
                  Our algorithms identify patterns, categorize topics, and calculate opportunity scores based on factors like mention frequency, growth trends, and user engagement.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LightbulbIcon sx={{ fontSize: 80, color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              </CardMedia>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Opportunity Discovery
                </Typography>
                <Typography>
                  We present the most promising SaaS opportunities with detailed insights about pain points, potential features, and market dynamics to help you validate your ideas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Divider sx={{ mb: 6 }} />
        
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Technology Stack
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Frontend</Typography>
                  </Box>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="React with TypeScript" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Material-UI for component library" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Chart.js for data visualization" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="React Router for navigation" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StorageIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="h6">Backend</Typography>
                  </Box>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="secondary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Node.js with Express" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="secondary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="SQLite for data storage" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="secondary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Python for data collection and analysis" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="secondary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="PRAW (Python Reddit API Wrapper)" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ mb: 6 }} />
        
        <Box>
          <Typography variant="h5" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body1">
            Have questions, feedback, or suggestions? We'd love to hear from you! Reach out to us at <strong>contact@idea-engine.com</strong>.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage; 