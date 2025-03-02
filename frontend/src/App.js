import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Dashboard from './pages/Dashboard';
import MarketAnalysis from './pages/MarketAnalysis';
import TopicExplorer from './pages/TopicExplorer';
import TopicDetail from './pages/TopicDetail';
import OpportunityFinder from './pages/OpportunityFinder';
import IdeaSubmission from './pages/IdeaSubmission';
import NotFound from './pages/NotFound';

// Create a theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/market-analysis" element={<MarketAnalysis />} />
        <Route path="/topics" element={<TopicExplorer />} />
        <Route path="/topics/:id" element={<TopicDetail />} />
        <Route path="/opportunities" element={<OpportunityFinder />} />
        <Route path="/submit-idea" element={<IdeaSubmission />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App; 