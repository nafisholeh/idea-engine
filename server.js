// server.js - Express backend for the Reddit Insights Dashboard

const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'data', 'redditradar.db');
console.log('Database path:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.error('Database file does not exist at:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the RedditRadar database.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly!' });
});

app.get('/api/topics', (req, res) => {
  console.log('Received request for topics with query:', req.query);
  
  const { category, timeframe, search } = req.query;
  
  let query = `
    SELECT 
      id,
      name as title,
      category,
      growth_percentage as growth_rate,
      mention_count,
      updated_at as last_updated,
      opportunity_scores
    FROM reddit_topics
  `;
  
  const params = [];
  const conditions = [];
  
  if (category && category !== 'all') {
    conditions.push('category = ?');
    params.push(category);
  }
  
  if (search) {
    conditions.push('(name LIKE ? OR category LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY mention_count DESC';
  
  console.log('Executing query:', query);
  console.log('With parameters:', params);
  
  db.all(query, params, (err, topics) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch topics: ' + err.message });
    }
    
    try {
      // Parse opportunity_scores JSON for each topic
      topics = topics.map(topic => ({
        ...topic,
        opportunity_scores: JSON.parse(topic.opportunity_scores || '{}')
      }));
      
      console.log('Found topics:', topics?.length || 0);
      res.json(topics || []);
    } catch (error) {
      console.error('Error parsing topic data:', error);
      res.status(500).json({ error: 'Failed to parse topic data' });
    }
  });
});

app.get('/api/topics/trending', (req, res) => {
  const query = `
    SELECT 
      id,
      name as title,
      category,
      growth_percentage as growth_rate
    FROM reddit_topics
    WHERE growth_percentage > 30
    ORDER BY growth_percentage DESC
    LIMIT 5
  `;
  
  db.all(query, [], (err, topics) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch trending topics' });
    }
    res.json(topics);
  });
});

app.get('/api/topics/:id', (req, res) => {
  const topicId = parseInt(req.params.id);
  
  if (isNaN(topicId) || topicId <= 0) {
    return res.status(400).json({ error: 'Invalid topic ID' });
  }
  
  const query = `
    SELECT 
      id,
      name as title,
      category,
      growth_percentage as growth_rate,
      mention_count,
      updated_at as last_updated,
      trend_data,
      pain_points,
      solution_requests,
      app_ideas
    FROM reddit_topics
    WHERE id = ?
  `;
  
  db.get(query, [topicId], (err, topic) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch topic details' });
    }
    
    if (!topic) {
      return res.status(404).json({ error: `Topic with ID ${topicId} not found` });
    }
    
    // Parse JSON strings back to arrays
    try {
      topic.trend_data = JSON.parse(topic.trend_data);
      topic.pain_points = JSON.parse(topic.pain_points);
      topic.solution_requests = JSON.parse(topic.solution_requests);
      topic.app_ideas = JSON.parse(topic.app_ideas);
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
      return res.status(500).json({ error: 'Failed to parse topic data' });
    }
    
    res.json(topic);
  });
});

app.get('/api/dashboard/stats', (req, res) => {
  const query = `
    SELECT 
      COUNT(DISTINCT id) as totalTopics,
      COUNT(DISTINCT CASE WHEN growth_percentage > 30 THEN id END) as trendingTopics,
      COUNT(DISTINCT category) as totalCategories,
      AVG(growth_percentage) as averageGrowthRate
    FROM reddit_topics
  `;
  
  db.get(query, [], (err, stats) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
    res.json({
      totalTopics: stats.totalTopics,
      trendingTopics: stats.trendingTopics,
      totalCategories: stats.totalCategories,
      averageGrowthRate: parseFloat(stats.averageGrowthRate.toFixed(1))
    });
  });
});

app.get('/api/categories', (req, res) => {
  const query = `
    SELECT DISTINCT category
    FROM reddit_topics
    ORDER BY category
  `;
  
  db.all(query, [], (err, categories) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.json(categories.map(cat => cat.category));
  });
});

app.get('/api/market-analysis', (req, res) => {
  const categoryDistributionQuery = `
    SELECT 
      category,
      COUNT(*) as count
    FROM reddit_topics
    GROUP BY category
    ORDER BY count DESC
    LIMIT 5
  `;
  
  const growthTrendsQuery = `
    SELECT 
      json_group_array(json_object(
        'month', substr(json_extract(value, '$.month'), 6),
        'growth', json_extract(value, '$.mentions')
      )) as trends
    FROM reddit_topics,
    json_each(trend_data)
    WHERE json_valid(trend_data)
    GROUP BY substr(json_extract(value, '$.month'), 1, 7)
    ORDER BY substr(json_extract(value, '$.month'), 1, 7) DESC
    LIMIT 6
  `;
  
  const painPointsQuery = `
    SELECT 
      category,
      COUNT(json_extract(value, '$.text')) as painPoints
    FROM reddit_topics,
    json_each(pain_points)
    WHERE json_valid(pain_points)
    GROUP BY category
    ORDER BY painPoints DESC
    LIMIT 5
  `;
  
  db.all(categoryDistributionQuery, [], (err, categoryDistribution) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch market analysis' });
    }
    
    db.all(growthTrendsQuery, [], (err, growthTrends) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch market analysis' });
      }
      
      db.all(painPointsQuery, [], (err, painPointsByCategory) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch market analysis' });
        }
        
        res.json({
          categoryDistribution,
          growthTrends: JSON.parse(growthTrends[0]?.trends || '[]').map(trend => ({
            month: new Date(2024, parseInt(trend.month.split('-')[1]) - 1).toLocaleString('default', { month: 'short' }),
            growth: parseFloat(trend.growth)
          })),
          painPointsByCategory
        });
      });
    });
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