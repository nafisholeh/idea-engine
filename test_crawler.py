#!/usr/bin/env python
import unittest
from unittest.mock import patch, MagicMock
import os
import json
import sqlite3
from DataCrawler import DataCrawler

class TestDataCrawler(unittest.TestCase):
    def setUp(self):
        # Create test data directory
        if not os.path.exists('test_data'):
            os.makedirs('test_data')
        
        # Mock the logging
        self.logging_patcher = patch('DataCrawler.logging')
        self.mock_logging = self.logging_patcher.start()
        
        # Mock the Reddit API
        self.praw_patcher = patch('DataCrawler.praw')
        self.mock_praw = self.praw_patcher.start()
        
        # Create a test instance with in-memory database
        self.crawler = DataCrawler()
        self.crawler.db = sqlite3.connect(':memory:')
        
        # Create the schema manually to ensure it matches
        cursor = self.crawler.db.cursor()
        cursor.execute('''
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
        )
        ''')
        self.crawler.db.commit()
        
        # Mock the Reddit client
        self.crawler.reddit = MagicMock()
    
    def tearDown(self):
        self.logging_patcher.stop()
        self.praw_patcher.stop()
        self.crawler.db.close()
    
    def test_extract_potential_topics(self):
        text = "I'm looking for a management tool that can help with task tracking"
        topics = self.crawler.extract_potential_topics(text)
        expected = "looking for a management tool"
        self.assertTrue(any(expected in topic for topic in topics), f"Expected '{expected}' in {topics}")
    
    def test_extract_pain_points(self):
        text = "I'm struggling with finding a good CRM system"
        pain_points = self.crawler.extract_pain_points(text)
        self.assertEqual(len(pain_points), 1)
        self.assertEqual(pain_points[0]['text'], "finding a good crm system")
    
    def test_analyze_sentiment(self):
        text = "I hate how difficult it is to use this software"
        sentiment = self.crawler.analyze_sentiment(text)
        self.assertGreater(sentiment['frustration'], 0)
    
    def test_categorize_topic(self):
        self.assertEqual(self.crawler.categorize_topic("AI writing assistant"), "AI")
        self.assertEqual(self.crawler.categorize_topic("project management tool"), "Productivity")
    
    def test_collect_engagement_metrics(self):
        # Mock a submission
        submission = MagicMock()
        submission.score = 42
        submission.num_comments = 10
        
        # Mock comments
        comment1 = MagicMock()
        comment1.author.name = "user1"
        comment2 = MagicMock()
        comment2.author.name = "user2"
        
        submission.comments.list.return_value = [comment1, comment2]
        
        metrics = self.crawler.collect_engagement_metrics(submission)
        self.assertEqual(metrics['upvotes'], 42)
        self.assertEqual(metrics['comments'], 10)
        self.assertEqual(metrics['unique_users'], 2)
    
    def test_update_database(self):
        # Clear any existing data
        cursor = self.crawler.db.cursor()
        cursor.execute("DELETE FROM reddit_topics")
        self.crawler.db.commit()
        
        # Test data
        topic_name = "management tool"
        topics_data = {
            topic_name: {
                'mention_count': 5,
                'pain_points': [{'text': 'difficult to use', 'count': 2}],
                'solution_requests': [{'text': 'easier interface', 'count': 1}],
                'app_ideas': [{'text': 'visual task board', 'count': 1}],
                'trend_data': [],
                'sentiment_scores': {"frustration": 0.3, "urgency": 0.2, "impact": 0.1},
                'topic_clusters': [],
                'engagement_metrics': {"upvotes": 20, "comments": 5, "unique_users": 3}
            }
        }
        
        # Update database
        self.crawler.update_database(topics_data)
        
        # Verify data was inserted
        cursor = self.crawler.db.cursor()
        cursor.execute("SELECT name, mention_count FROM reddit_topics WHERE name = ?", (topic_name,))
        result = cursor.fetchone()
        
        self.assertIsNotNone(result, "No data was inserted into the database")
        self.assertEqual(result[0], topic_name)
        self.assertEqual(result[1], 5)

if __name__ == "__main__":
    unittest.main() 