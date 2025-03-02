// server.js - Express backend for the Reddit Insights Dashboard

const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./reddit_insights.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the RedditRadar database.');
  }
});

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly!' });
});

app.get('/api/dashboard/stats', (req, res) => {
  // Mock data for now - replace with actual database queries
  res.json({
    totalTopics: 1250,
    trendingTopics: 42,
    totalCategories: 18,
    averageGrowthRate: 23.5
  });
});

app.get('/api/topics/trending', (req, res) => {
  // Mock data for now - replace with actual database queries
  res.json([
    { id: 1, title: 'AI Writing Assistants', category: 'Artificial Intelligence', growthRate: 45.2 },
    { id: 2, title: 'Remote Team Management', category: 'Productivity', growthRate: 38.7 },
    { id: 3, title: 'No-Code Development', category: 'Software Development', growthRate: 35.1 },
    { id: 4, title: 'Mental Health Apps', category: 'Health & Wellness', growthRate: 32.8 },
    { id: 5, title: 'Sustainable E-commerce', category: 'E-commerce', growthRate: 30.5 }
  ]);
});

app.get('/api/categories', (req, res) => {
  // Mock data for now - replace with actual database queries
  res.json([
    'Artificial Intelligence',
    'Productivity',
    'Software Development',
    'Health & Wellness',
    'E-commerce',
    'Finance',
    'Education',
    'Marketing',
    'Customer Support',
    'Data Analytics'
  ]);
});

app.get('/api/market-analysis', (req, res) => {
  // Mock data for now - replace with actual database queries
  res.json({
    categoryDistribution: [
      { category: 'Artificial Intelligence', count: 245 },
      { category: 'Productivity', count: 198 },
      { category: 'Software Development', count: 187 },
      { category: 'Health & Wellness', count: 156 },
      { category: 'E-commerce', count: 132 }
    ],
    growthTrends: [
      { month: 'Jan', growth: 12 },
      { month: 'Feb', growth: 15 },
      { month: 'Mar', growth: 18 },
      { month: 'Apr', growth: 22 },
      { month: 'May', growth: 28 },
      { month: 'Jun', growth: 35 }
    ],
    painPointsByCategory: [
      { category: 'Artificial Intelligence', painPoints: 156 },
      { category: 'Productivity', painPoints: 132 },
      { category: 'Software Development', painPoints: 124 },
      { category: 'Health & Wellness', painPoints: 98 },
      { category: 'E-commerce', painPoints: 87 }
    ]
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
} else {
  // In development, we'll just redirect to the React dev server
  app.get('/', (req, res) => {
    res.send('API is running. Frontend is available at http://localhost:3000');
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle database closing on app termination
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});