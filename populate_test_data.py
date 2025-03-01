import sqlite3
import json
import logging
import datetime
import random
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database path
DB_PATH = 'reddit_insights.db'

# Check if database is locked
def is_db_locked():
    try:
        # Try to open the database in exclusive mode
        conn = sqlite3.connect(DB_PATH, timeout=1)
        conn.isolation_level = 'EXCLUSIVE'
        conn.execute('BEGIN EXCLUSIVE')
        conn.close()
        return False
    except sqlite3.OperationalError as e:
        if 'database is locked' in str(e):
            return True
        raise e

# Create a backup of the database
def backup_database():
    if os.path.exists(DB_PATH):
        backup_path = f"{DB_PATH}.bak.{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
        try:
            with open(DB_PATH, 'rb') as src, open(backup_path, 'wb') as dst:
                dst.write(src.read())
            logger.info(f"Created database backup at {backup_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to create database backup: {e}")
            return False
    return False

# Create sample trend data
def create_trend_data(months=6):
    today = datetime.datetime.now()
    trend_data = []
    
    for i in range(months):
        month_date = today - datetime.timedelta(days=30 * i)
        month_str = month_date.strftime("%Y-%m")
        count = random.randint(50, 500)
        trend_data.append({"month": month_str, "count": count})
    
    return trend_data

# Create sample pain points
def create_pain_points():
    pain_points = [
        {
            "text": "Difficulty finding reliable information",
            "mentions": random.randint(10, 100),
            "sentiment": random.uniform(-0.8, -0.2),
            "examples": [
                "I can't find trustworthy sources on this topic",
                "There's too much conflicting information out there"
            ]
        },
        {
            "text": "Too expensive for what you get",
            "mentions": random.randint(10, 100),
            "sentiment": random.uniform(-0.9, -0.3),
            "examples": [
                "The price is way too high for the features offered",
                "Not worth the money at all"
            ]
        },
        {
            "text": "Poor customer support",
            "mentions": random.randint(10, 100),
            "sentiment": random.uniform(-1.0, -0.5),
            "examples": [
                "Their support team never responds to emails",
                "Waited on hold for hours with no resolution"
            ]
        }
    ]
    return pain_points

# Create sample solution requests
def create_solution_requests():
    solution_requests = [
        {
            "text": "Need better search functionality",
            "mentions": random.randint(5, 50),
            "sentiment": random.uniform(0.1, 0.5),
            "examples": [
                "Would be great if we could search by specific criteria",
                "The search feature needs to be more accurate"
            ]
        },
        {
            "text": "Want more affordable options",
            "mentions": random.randint(5, 50),
            "sentiment": random.uniform(0.1, 0.5),
            "examples": [
                "Looking for something similar but at a lower price point",
                "Wish there was a budget-friendly alternative"
            ]
        }
    ]
    return solution_requests

# Create sample app ideas
def create_app_ideas():
    app_ideas = [
        {
            "text": "All-in-one management tool",
            "mentions": random.randint(5, 30),
            "sentiment": random.uniform(0.5, 0.9),
            "examples": [
                "Would love an app that combines all these features in one place",
                "Need something that integrates with my existing workflow"
            ]
        },
        {
            "text": "Mobile app with offline capabilities",
            "mentions": random.randint(5, 30),
            "sentiment": random.uniform(0.5, 0.9),
            "examples": [
                "An app that works without internet would be perfect",
                "Need to be able to access my data on the go"
            ]
        }
    ]
    return app_ideas

# Create opportunity scores
def create_opportunity_scores():
    return {
        "total_score": random.randint(50, 95),
        "monetization_score": random.randint(40, 100),
        "urgency_score": random.randint(40, 100),
        "market_score": random.randint(40, 100),
        "competition_score": random.randint(40, 100),
        "engagement_score": random.randint(40, 100)
    }

# Sample categories
CATEGORIES = [
    "Technology", "Health", "Finance", "Education", 
    "Entertainment", "Productivity", "Social Media", 
    "Gaming", "Travel", "Food"
]

# Sample topic names by category
TOPIC_NAMES = {
    "Technology": ["AI Tools", "Cloud Computing", "Cybersecurity", "Data Science", "Web Development"],
    "Health": ["Mental Health Apps", "Fitness Trackers", "Telemedicine", "Nutrition Planning", "Sleep Tracking"],
    "Finance": ["Budgeting Apps", "Investment Platforms", "Cryptocurrency", "Financial Education", "Tax Software"],
    "Education": ["Online Courses", "Language Learning", "Study Tools", "Educational Games", "Virtual Tutoring"],
    "Entertainment": ["Streaming Services", "Podcasts", "Music Apps", "Video Creation", "Gaming Platforms"],
    "Productivity": ["Task Management", "Note Taking", "Calendar Apps", "Focus Tools", "Project Management"],
    "Social Media": ["Content Creation", "Community Building", "Social Analytics", "Influencer Marketing", "Social Commerce"],
    "Gaming": ["Mobile Games", "PC Gaming", "Console Gaming", "Game Development", "Esports"],
    "Travel": ["Trip Planning", "Accommodation Booking", "Local Experiences", "Travel Rewards", "Transportation Apps"],
    "Food": ["Recipe Apps", "Meal Planning", "Restaurant Discovery", "Food Delivery", "Cooking Tools"]
}

def main():
    # Check if database is locked
    if is_db_locked():
        logger.error("Database is locked. Cannot proceed.")
        return
    
    # Backup the database
    backup_database()
    
    try:
        # Connect to the database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if reddit_topics table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='reddit_topics'")
        if not cursor.fetchone():
            # Create the table if it doesn't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS reddit_topics (
                id INTEGER PRIMARY KEY,
                name VARCHAR,
                category VARCHAR,
                last_updated DATETIME,
                trend_data JSON,
                pain_points JSON,
                solution_requests JSON,
                app_ideas JSON,
                mention_count INTEGER,
                growth_percentage FLOAT,
                opportunity_scores JSON
            )
            ''')
            logger.info("Created reddit_topics table")
        
        # Clear existing data
        cursor.execute("DELETE FROM reddit_topics")
        logger.info("Cleared existing data from reddit_topics table")
        
        # Insert sample data
        for category in CATEGORIES:
            for topic_name in TOPIC_NAMES[category]:
                trend_data = create_trend_data()
                pain_points = create_pain_points()
                solution_requests = create_solution_requests()
                app_ideas = create_app_ideas()
                mention_count = sum(item["count"] for item in trend_data)
                
                # Calculate growth percentage
                if len(trend_data) >= 2:
                    current = trend_data[0]["count"]
                    previous = trend_data[1]["count"]
                    growth_percentage = ((current - previous) / previous) * 100 if previous > 0 else 0
                else:
                    growth_percentage = random.uniform(-20, 50)
                
                opportunity_scores = create_opportunity_scores()
                
                cursor.execute('''
                INSERT INTO reddit_topics (
                    name, category, last_updated, trend_data, pain_points, 
                    solution_requests, app_ideas, mention_count, growth_percentage,
                    opportunity_scores
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    topic_name, 
                    category, 
                    datetime.datetime.now().isoformat(), 
                    json.dumps(trend_data), 
                    json.dumps(pain_points),
                    json.dumps(solution_requests),
                    json.dumps(app_ideas),
                    mention_count,
                    growth_percentage,
                    json.dumps(opportunity_scores)
                ))
        
        # Commit the changes
        conn.commit()
        
        # Verify the data was inserted
        cursor.execute("SELECT COUNT(*) FROM reddit_topics")
        count = cursor.fetchone()[0]
        logger.info(f"Successfully inserted {count} topics into the database")
        
        # Close the connection
        conn.close()
        
    except Exception as e:
        logger.error(f"Error populating database: {e}")

if __name__ == "__main__":
    main() 