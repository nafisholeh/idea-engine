-- Reddit topics table with JSON storage for related data
CREATE TABLE IF NOT EXISTS reddit_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    mention_count INTEGER DEFAULT 0,
    growth_percentage REAL DEFAULT 0,
    pain_points TEXT DEFAULT '[]',
    solution_requests TEXT DEFAULT '[]',
    app_ideas TEXT DEFAULT '[]',
    trend_data TEXT DEFAULT '[]',
    sentiment_scores TEXT DEFAULT '{"frustration": 0, "urgency": 0, "impact": 0}',
    topic_clusters TEXT DEFAULT '[]',
    engagement_metrics TEXT DEFAULT '{"upvotes": 0, "comments": 0, "unique_users": 0}',
    opportunity_scores TEXT DEFAULT '{"total_score": 0}',
    average_budget REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 