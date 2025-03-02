import React from 'react';
import { Container, Typography, Box, Paper, Grid, Divider, Link } from '@mui/material';

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          About RedditRadar
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Discover SaaS opportunities from Reddit discussions
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1" paragraph>
          RedditRadar is a tool designed to help entrepreneurs and product developers identify
          promising SaaS opportunities by analyzing discussions on Reddit. We scan thousands of
          posts and comments to identify pain points, solution requests, and emerging trends
          across various categories.
        </Typography>
        <Typography variant="body1" paragraph>
          Our mission is to bridge the gap between user needs and product development by providing
          data-driven insights into what people are actually discussing, struggling with, and
          requesting solutions for.
        </Typography>
      </Paper>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              How It Works
            </Typography>
            <Typography variant="body1" paragraph>
              RedditRadar uses advanced natural language processing and machine learning algorithms
              to analyze Reddit content across various subreddits. Our system:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Collects and processes posts and comments from relevant subreddits
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Identifies pain points, solution requests, and app ideas
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Tracks mention frequency and growth trends over time
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Categorizes topics and calculates opportunity scores
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  Provides market validation and competitor analysis
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Key Features
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  <strong>Topic Explorer:</strong> Browse and search through hundreds of topics
                  identified from Reddit discussions
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  <strong>Opportunity Finder:</strong> Discover high-potential SaaS ideas based on
                  our proprietary opportunity scoring algorithm
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  <strong>Market Analysis:</strong> Get insights into market trends, category
                  distribution, and growth patterns
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  <strong>Sentiment Analysis:</strong> Understand user sentiment around specific
                  topics and pain points
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Idea Submission:</strong> Submit your own SaaS ideas for analysis and
                  validation against our dataset
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Our Team
        </Typography>
        <Typography variant="body1" paragraph>
          RedditRadar was created by a team of entrepreneurs, developers, and data scientists
          passionate about helping others build successful SaaS products. We combine expertise in
          natural language processing, market research, and product development to provide valuable
          insights for the SaaS community.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          Have questions, feedback, or suggestions? We'd love to hear from you!
        </Typography>
        <Typography variant="body1">
          Email: <Link href="mailto:support@redditradar.com">support@redditradar.com</Link>
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} RedditRadar. All rights reserved.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AboutPage; 