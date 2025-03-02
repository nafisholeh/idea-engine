import React from 'react';
import { Box, Container, Typography, Link, Divider, Stack, IconButton } from '@mui/material';
import { GitHub as GitHubIcon, Twitter as TwitterIcon, LinkedIn as LinkedInIcon } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'flex-start' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              RedditRadar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discover SaaS opportunities from Reddit discussions.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} RedditRadar. All rights reserved.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="/about" color="inherit" underline="hover" display="block">
              About
            </Link>
            <Link href="/help" color="inherit" underline="hover" display="block">
              Help Center
            </Link>
            <Link href="/privacy" color="inherit" underline="hover" display="block">
              Privacy Policy
            </Link>
            <Link href="/terms" color="inherit" underline="hover" display="block">
              Terms of Service
            </Link>
          </Box>

          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Connect
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="GitHub" size="small">
                <GitHubIcon />
              </IconButton>
              <IconButton aria-label="Twitter" size="small">
                <TwitterIcon />
              </IconButton>
              <IconButton aria-label="LinkedIn" size="small">
                <LinkedInIcon />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Contact: support@redditradar.com
            </Typography>
          </Box>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ pt: 4 }}
        >
          Built with ❤️ for SaaS entrepreneurs
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 