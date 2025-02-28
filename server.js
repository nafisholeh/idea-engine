// server.js - Express backend for the Reddit Insights Dashboard

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite database
const db = new sqlite3.Database('./reddit_insights.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the Reddit Insights database');
  }
});

// API Routes
app.get('/api/topics', (req, res) => {
  const timeframe = req.query.timeframe || '30days';
  const category = req.query.category || 'all';
  const search = req.query.search || '';
  
  let query = 'SELECT * FROM reddit_topics';
  let params = [];
  
  // Apply filters
  const whereConditions = [];
  
  if (category !== 'all') {
    whereConditions.push('category = ?');
    params.push(category);
  }
  
  if (search) {
    whereConditions.push('(name LIKE ? OR json_extract(pain_points, "$[*].text") LIKE ? OR json_extract(solution_requests, "$[*].text") LIKE ? OR json_extract(app_ideas, "$[*].text") LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }
  
  // Order by mention count or growth percentage
  query += ' ORDER BY mention_count DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Process the data based on timeframe
    const processedRows = rows.map(row => {
      const topic = {
        id: row.id,
        name: row.name,
        category: row.category,
        mention_count: row.mention_count,
        growth_percentage: row.growth_percentage,
        pain_points: JSON.parse(row.pain_points),
        solution_requests: JSON.parse(row.solution_requests),
        app_ideas: JSON.parse(row.app_ideas),
        trend_data: JSON.parse(row.trend_data)
      };
      
      // Filter trend data based on timeframe
      if (timeframe === '7days') {
        // Filter to the last 7 days of trend data
        topic.trend_data = filterTrendDataByDays(topic.trend_data, 7);
      } else if (timeframe === '30days') {
        // Filter to the last 30 days of trend data
        topic.trend_data = filterTrendDataByDays(topic.trend_data, 30);
      } else if (timeframe === '90days') {
        // Filter to the last 90 days of trend data
        topic.trend_data = filterTrendDataByDays(topic.trend_data, 90);
      }
      
      return topic;
    });
    
    res.json(processedRows);
  });
});

// Get trending topics (highest growth)
app.get('/api/trending', (req, res) => {
  const limit = req.query.limit || 10;
  
  db.all('SELECT * FROM reddit_topics ORDER BY growth_percentage DESC LIMIT ?', [limit], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const processedRows = rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      mention_count: row.mention_count,
      growth_percentage: row.growth_percentage
    }));
    
    res.json(processedRows);
  });
});

// Get statistics about the dataset
app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as topic_count, SUM(mention_count) as total_mentions FROM reddit_topics', [], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get category distribution
    db.all('SELECT category, COUNT(*) as count FROM reddit_topics GROUP BY category', [], (err, categories) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        topic_count: row.topic_count,
        total_mentions: row.total_mentions,
        categories: categories,
        last_updated: new Date().toISOString()
      });
    });
  });
});

// Get topics by category
app.get('/api/topics/:category', (req, res) => {
  const category = req.params.category;
  
  db.all('SELECT * FROM reddit_topics WHERE category = ?', [category], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const processedRows = rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      mention_count: row.mention_count,
      growth_percentage: row.growth_percentage,
      pain_points: JSON.parse(row.pain_points),
      solution_requests: JSON.parse(row.solution_requests),
      app_ideas: JSON.parse(row.app_ideas),
      trend_data: JSON.parse(row.trend_data)
    }));
    
    res.json(processedRows);
  });
});

// Helper function to filter trend data by days
function filterTrendDataByDays(trendData, days) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return trendData.filter(item => new Date(item.month) >= cutoffDate);
}

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});