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
    
    // Initialize database schema
    const fs = require('fs');
    const initSQL = fs.readFileSync('./schema.sql', 'utf-8');
    
    db.exec(initSQL, (err) => {
      if (err) {
        console.error('Error initializing database schema:', err.message);
      } else {
        console.log('Database schema initialized successfully.');
      }
    });
  }
});

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly!' });
});

app.get('/api/topics', (req, res) => {
  const { category, timeframe, search } = req.query;
  
  let query = `
    SELECT 
      t.id,
      t.title,
      t.category,
      t.growth_rate as growthRate,
      t.mention_count,
      t.last_updated
    FROM topics t
  `;
  
  const params = [];
  const conditions = [];
  
  if (category && category !== 'all') {
    conditions.push('t.category = ?');
    params.push(category);
  }
  
  if (search) {
    conditions.push('(t.title LIKE ? OR t.category LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY t.mention_count DESC';
  
  db.all(query, params, (err, topics) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch topics' });
    }
    res.json(topics);
  });
});

app.get('/api/topics/trending', (req, res) => {
  const query = `
    SELECT 
      id,
      title,
      category,
      growth_rate as growthRate
    FROM topics
    WHERE growth_rate > 30
    ORDER BY growth_rate DESC
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
      t.id,
      t.title,
      t.category,
      t.growth_rate as growthRate,
      t.mention_count,
      t.last_updated,
      json_group_array(DISTINCT json_object(
        'date', td.date,
        'mentions', td.mentions
      )) as trend_data,
      json_group_array(DISTINCT json_object(
        'text', p.description,
        'mention_count', p.mention_count
      )) as pain_points,
      json_group_array(DISTINCT json_object(
        'text', s.description,
        'mention_count', s.mention_count
      )) as solution_requests,
      json_group_array(DISTINCT json_object(
        'text', a.description,
        'mention_count', a.mention_count
      )) as app_ideas
    FROM topics t
    LEFT JOIN trend_data td ON t.id = td.topic_id
    LEFT JOIN pain_points p ON t.id = p.topic_id
    LEFT JOIN solution_requests s ON t.id = s.topic_id
    LEFT JOIN app_ideas a ON t.id = a.topic_id
    WHERE t.id = ?
    GROUP BY t.id
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
      
      // Remove any null entries that might have been created by LEFT JOINs
      topic.trend_data = topic.trend_data.filter(item => item.date !== null);
      topic.pain_points = topic.pain_points.filter(item => item.text !== null);
      topic.solution_requests = topic.solution_requests.filter(item => item.text !== null);
      topic.app_ideas = topic.app_ideas.filter(item => item.text !== null);
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
      COUNT(DISTINCT CASE WHEN growth_rate > 30 THEN id END) as trendingTopics,
      COUNT(DISTINCT category) as totalCategories,
      AVG(growth_rate) as averageGrowthRate
    FROM topics
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
    FROM topics
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
    FROM topics
    GROUP BY category
    ORDER BY count DESC
    LIMIT 5
  `;
  
  const growthTrendsQuery = `
    SELECT 
      strftime('%m', date) as month,
      AVG(growth_rate) as growth
    FROM trend_data td
    JOIN topics t ON td.topic_id = t.id
    WHERE date >= date('now', '-6 months')
    GROUP BY month
    ORDER BY month
  `;
  
  const painPointsQuery = `
    SELECT 
      t.category,
      COUNT(p.id) as painPoints
    FROM topics t
    LEFT JOIN pain_points p ON t.id = p.topic_id
    GROUP BY t.category
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
          growthTrends: growthTrends.map(trend => ({
            month: new Date(2024, parseInt(trend.month) - 1).toLocaleString('default', { month: 'short' }),
            growth: parseFloat(trend.growth.toFixed(1))
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