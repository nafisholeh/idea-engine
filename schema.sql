-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    growth_rate REAL NOT NULL DEFAULT 0,
    mention_count INTEGER NOT NULL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trend data table
CREATE TABLE IF NOT EXISTS trend_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    mentions INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- Pain points table
CREATE TABLE IF NOT EXISTS pain_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    mention_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- Solution requests table
CREATE TABLE IF NOT EXISTS solution_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    mention_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- App ideas table
CREATE TABLE IF NOT EXISTS app_ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    mention_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- Insert some sample data
INSERT INTO topics (title, category, growth_rate, mention_count) VALUES
('AI Writing Assistants', 'Artificial Intelligence', 45.5, 1200),
('Remote Team Management', 'Business Software', 32.8, 800),
('Mental Health Apps', 'Healthcare', 38.2, 950);

-- Insert trend data
INSERT INTO trend_data (topic_id, date, mentions) VALUES
(1, '2024-01-01', 100),
(1, '2024-02-01', 150),
(1, '2024-03-01', 200),
(2, '2024-01-01', 80),
(2, '2024-02-01', 120),
(2, '2024-03-01', 160),
(3, '2024-01-01', 90),
(3, '2024-02-01', 130),
(3, '2024-03-01', 180);

-- Insert pain points
INSERT INTO pain_points (topic_id, description, mention_count) VALUES
(1, 'Accuracy issues with generated content', 150),
(1, 'High subscription costs', 120),
(2, 'Difficulty in tracking productivity', 100),
(2, 'Communication barriers', 90),
(3, 'Privacy concerns', 110),
(3, 'Limited customization options', 85);

-- Insert solution requests
INSERT INTO solution_requests (topic_id, description, mention_count) VALUES
(1, 'Better context understanding', 80),
(1, 'More affordable pricing tiers', 70),
(2, 'Integrated time tracking', 65),
(2, 'Better video conferencing tools', 60),
(3, 'Enhanced data encryption', 75),
(3, 'Personalized therapy recommendations', 70);

-- Insert app ideas
INSERT INTO app_ideas (topic_id, description, mention_count) VALUES
(1, 'Context-aware writing assistant', 45),
(1, 'Collaborative editing platform', 40),
(2, 'All-in-one remote team dashboard', 35),
(2, 'Virtual office simulator', 30),
(3, 'AI-powered therapy chatbot', 50),
(3, 'Mood tracking and analysis app', 45); 