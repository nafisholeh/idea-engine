import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          mt: 5, 
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404 - Page Not Found
        </Typography>
        
        <Typography variant="h5" color="textSecondary" paragraph>
          Oops! The page you are looking for doesn't exist.
        </Typography>
        
        <Typography variant="body1" color="textSecondary" paragraph>
          It might have been moved, deleted, or perhaps never existed.
        </Typography>
        
        <Box mt={4}>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/"
            startIcon={<HomeIcon />}
            size="large"
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound; 