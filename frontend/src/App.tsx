import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Import components
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import TopicExplorer from './pages/TopicExplorer';
import TopicDetail from './pages/TopicDetail';
import AboutPage from './pages/AboutPage';
import NotFound from './pages/NotFound';
import IdeaSubmission from './pages/IdeaSubmission';
import OpportunityFinder from './pages/OpportunityFinder';
import MarketAnalysis from './pages/MarketAnalysis';
import TextAnalysisPage from './pages/TextAnalysisPage';

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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market-analysis" element={<MarketAnalysis />} />
            <Route path="/topics" element={<TopicExplorer />} />
            <Route path="/topics/:id" element={<TopicDetail />} />
            <Route path="/opportunities" element={<OpportunityFinder />} />
            <Route path="/submit-idea" element={<IdeaSubmission />} />
            <Route path="/text-analysis" element={<TextAnalysisPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 