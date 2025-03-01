import sqlite3
import json
import logging
import datetime
import random
import os
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database path
DB_PATH = 'reddit_insights.db'

def check_db_status():
    """Check the status of the database"""
    try:
        # Check if the file exists
        if not os.path.exists(DB_PATH):
            logger.info(f"Database file {DB_PATH} does not exist")
            return False
        
        # Try to connect to the database
        conn = sqlite3.connect(DB_PATH, timeout=1)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        logger.info(f"Tables in database: {tables}")
        
        # Check if reddit_topics table exists
        if ('reddit_topics',) in tables:
            # Check schema
            cursor.execute("PRAGMA table_info(reddit_topics)")
            columns = cursor.fetchall()
            logger.info(f"Columns in reddit_topics table: {columns}")
            
            # Check if opportunity_scores column exists
            has_opportunity_scores = any(col[1] == 'opportunity_scores' for col in columns)
            logger.info(f"Has opportunity_scores column: {has_opportunity_scores}")
            
            # Check data
            cursor.execute("SELECT COUNT(*) FROM reddit_topics")
            count = cursor.fetchone()[0]
            logger.info(f"Number of records in reddit_topics table: {count}")
            
            if count > 0:
                cursor.execute("SELECT id, name, category FROM reddit_topics LIMIT 5")
                sample = cursor.fetchall()
                logger.info(f"Sample records: {sample}")
            
            return has_opportunity_scores
        
        conn.close()
        return False
    except Exception as e:
        logger.error(f"Error checking database: {e}")
        return False

def add_opportunity_scores_column():
    """Add opportunity_scores column to reddit_topics table"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if opportunity_scores column exists
        cursor.execute("PRAGMA table_info(reddit_topics)")
        columns = cursor.fetchall()
        if not any(col[1] == 'opportunity_scores' for col in columns):
            # Add opportunity_scores column
            cursor.execute("ALTER TABLE reddit_topics ADD COLUMN opportunity_scores JSON")
            logger.info("Added opportunity_scores column to reddit_topics table")
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error adding opportunity_scores column: {e}")
        return False

def create_new_database():
    """Create a new database with the required schema"""
    try:
        # Backup existing database if it exists
        if os.path.exists(DB_PATH):
            backup_path = f"{DB_PATH}.bak.{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
            try:
                with open(DB_PATH, 'rb') as src, open(backup_path, 'wb') as dst:
                    dst.write(src.read())
                logger.info(f"Created database backup at {backup_path}")
            except Exception as e:
                logger.error(f"Failed to create database backup: {e}")
                return False
            
            # Try to delete the existing database
            try:
                os.remove(DB_PATH)
                logger.info(f"Deleted existing database {DB_PATH}")
            except Exception as e:
                logger.error(f"Failed to delete existing database: {e}")
                return False
        
        # Create a new database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create reddit_topics table
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
        
        # Create other necessary tables
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS reddit_posts (
            id VARCHAR PRIMARY KEY,
            subreddit VARCHAR,
            title VARCHAR,
            selftext TEXT,
            created_utc DATETIME,
            score INTEGER,
            num_comments INTEGER,
            permalink VARCHAR
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS reddit_comments (
            id VARCHAR PRIMARY KEY,
            post_id VARCHAR,
            body TEXT,
            created_utc DATETIME,
            score INTEGER,
            FOREIGN KEY (post_id) REFERENCES reddit_posts(id)
        )
        ''')
        
        conn.commit()
        conn.close()
        
        logger.info("Created new database with required schema")
        return True
    except Exception as e:
        logger.error(f"Error creating new database: {e}")
        return False

def populate_sample_data():
    """Populate the database with sample data"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Clear existing data
        cursor.execute("DELETE FROM reddit_topics")
        logger.info("Cleared existing data from reddit_topics table")
        
        # Sample categories
        categories = [
            "Technology", "Health", "Finance", "Education", 
            "Entertainment", "Productivity", "Social Media", 
            "Gaming", "Travel", "Food"
        ]
        
        # Sample topic names by category
        topic_names = {
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
        
        # Insert sample data
        for category in categories:
            for topic_name in topic_names[category]:
                # Create trend data
                trend_data = []
                today = datetime.datetime.now()
                for i in range(6):
                    month_date = today - datetime.timedelta(days=30 * i)
                    month_str = month_date.strftime("%Y-%m")
                    count = random.randint(50, 500)
                    trend_data.append({"month": month_str, "count": count})
                
                # Create pain points
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
                    }
                ]
                
                # Create solution requests
                solution_requests = [
                    {
                        "text": "Need better search functionality",
                        "mentions": random.randint(5, 50),
                        "sentiment": random.uniform(0.1, 0.5),
                        "examples": [
                            "Would be great if we could search by specific criteria",
                            "The search feature needs to be more accurate"
                        ]
                    }
                ]
                
                # Create app ideas
                app_ideas = [
                    {
                        "text": "All-in-one management tool",
                        "mentions": random.randint(5, 30),
                        "sentiment": random.uniform(0.5, 0.9),
                        "examples": [
                            "Would love an app that combines all these features in one place",
                            "Need something that integrates with my existing workflow"
                        ]
                    }
                ]
                
                # Calculate mention count and growth percentage
                mention_count = sum(item["count"] for item in trend_data)
                if len(trend_data) >= 2:
                    current = trend_data[0]["count"]
                    previous = trend_data[1]["count"]
                    growth_percentage = ((current - previous) / previous) * 100 if previous > 0 else 0
                else:
                    growth_percentage = random.uniform(-20, 50)
                
                # Create opportunity scores
                opportunity_scores = {
                    "total_score": random.randint(50, 95),
                    "monetization_score": random.randint(40, 100),
                    "urgency_score": random.randint(40, 100),
                    "market_score": random.randint(40, 100),
                    "competition_score": random.randint(40, 100),
                    "engagement_score": random.randint(40, 100)
                }
                
                # Insert the topic
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
        
        conn.commit()
        
        # Verify the data was inserted
        cursor.execute("SELECT COUNT(*) FROM reddit_topics")
        count = cursor.fetchone()[0]
        logger.info(f"Successfully inserted {count} topics into the database")
        
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error populating sample data: {e}")
        return False

def main():
    """Main function"""
    logger.info("Starting database fix script")
    
    # Check database status
    logger.info("Checking database status...")
    has_opportunity_scores = check_db_status()
    
    if not has_opportunity_scores:
        # Try to add opportunity_scores column
        logger.info("Adding opportunity_scores column...")
        if add_opportunity_scores_column():
            # Populate with sample data
            logger.info("Populating sample data...")
            populate_sample_data()
        else:
            # Try to create a new database
            logger.info("Failed to add column. Creating new database...")
            if create_new_database():
                # Populate with sample data
                logger.info("Populating sample data...")
                populate_sample_data()
    
    # Check database status again
    logger.info("Checking database status after fixes...")
    check_db_status()
    
    logger.info("Database fix script completed")

if __name__ == "__main__":
    main() 