#!/usr/bin/env python
import argparse
import time
import os
import sqlite3
import json
from datetime import datetime

def ensure_data_directory():
    """Ensure the data directory exists"""
    if not os.path.exists('data'):
        os.makedirs('data')
        print("Created data directory")

def initialize_database():
    """Initialize the SQLite database with required tables"""
    ensure_data_directory()
    conn = sqlite3.connect('data/redditradar.db')
    cursor = conn.cursor()
    
    # Create tables if they don't exist
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
        opportunity_scores TEXT DEFAULT '{"total_score": 0}',
        average_budget REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized")

def collect_data(time_period):
    """Simulate collecting data from Reddit"""
    print(f"Starting data collection for time period: {time_period}")
    
    # Initialize database
    initialize_database()
    
    # Simulate data collection process
    print("Connecting to Reddit API...")
    time.sleep(1)
    print("Fetching subreddit data...")
    time.sleep(1)
    print("Processing posts and comments...")
    time.sleep(1)
    print("Analyzing sentiment and extracting topics...")
    time.sleep(1)
    print("Identifying pain points and solution requests...")
    time.sleep(1)
    
    # Simulate storing some mock data
    conn = sqlite3.connect('data/redditradar.db')
    cursor = conn.cursor()
    
    # Check if we already have data
    cursor.execute("SELECT COUNT(*) FROM reddit_topics")
    count = cursor.fetchone()[0]
    
    if count == 0:
        # Insert some mock data if the database is empty
        mock_topics = [
            ('AI Writing Assistants', 'Artificial Intelligence', 1250, 45.2),
            ('Remote Team Management', 'Productivity', 980, 38.7),
            ('No-Code Development', 'Software Development', 875, 35.1),
            ('Mental Health Apps', 'Health & Wellness', 760, 32.8),
            ('Sustainable E-commerce', 'E-commerce', 650, 30.5)
        ]
        
        for topic in mock_topics:
            pain_points = json.dumps([
                {"text": f"Users struggle with {topic[0]} interface", "count": 45},
                {"text": f"{topic[0]} is too expensive for small businesses", "count": 32},
                {"text": f"Limited features in {topic[0]}", "count": 28}
            ])
            
            solution_requests = json.dumps([
                {"text": f"Need more affordable {topic[0]} options", "count": 38},
                {"text": f"Looking for {topic[0]} with better UI", "count": 25},
                {"text": f"Want {topic[0]} with more customization", "count": 22}
            ])
            
            app_ideas = json.dumps([
                {"text": f"Budget-friendly {topic[0]} for startups", "count": 18},
                {"text": f"Simplified {topic[0]} for non-technical users", "count": 15},
                {"text": f"Integration-focused {topic[0]}", "count": 12}
            ])
            
            trend_data = json.dumps([
                {"month": "2023-01-01", "mentions": 120},
                {"month": "2023-02-01", "mentions": 150},
                {"month": "2023-03-01", "mentions": 200},
                {"month": "2023-04-01", "mentions": 280},
                {"month": "2023-05-01", "mentions": 350},
                {"month": "2023-06-01", "mentions": 450}
            ])
            
            opportunity_scores = json.dumps({
                "total_score": 85,
                "monetization_score": 80,
                "urgency_score": 85,
                "market_score": 90,
                "competition_score": 75,
                "engagement_score": 95
            })
            
            cursor.execute('''
            INSERT INTO reddit_topics 
            (name, category, mention_count, growth_percentage, pain_points, solution_requests, 
            app_ideas, trend_data, opportunity_scores, average_budget)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                topic[0], topic[1], topic[2], topic[3], 
                pain_points, solution_requests, app_ideas, trend_data, 
                opportunity_scores, 5000
            ))
    
    conn.commit()
    conn.close()
    
    print(f"Data collection completed for {time_period}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Next collection scheduled according to your settings")

def main():
    parser = argparse.ArgumentParser(description='Reddit Data Collector for SaaS Opportunities')
    parser.add_argument('--collect', action='store_true', help='Start data collection')
    parser.add_argument('--time-period', choices=['hour', 'day', 'week'], default='day',
                        help='Time period for data collection (default: day)')
    
    args = parser.parse_args()
    
    if args.collect:
        collect_data(args.time_period)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()