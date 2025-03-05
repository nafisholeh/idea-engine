#!/usr/bin/env python
import argparse
import time
import os
import sqlite3
import json
from datetime import datetime, timedelta, timezone
import requests
import configparser
from collections import defaultdict
import re
from typing import List, Dict, Any
import logging
import urllib3
import certifi
import base64
import socks
import socket
import praw
from textblob import TextBlob
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import numpy as np

# Configure SOCKS proxy for Tor
socks.set_default_proxy(socks.SOCKS5, "localhost", 9150)
socket.socket = socks.socksocket

# Set up logging
logging.basicConfig(
    filename='data/crawler.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class DataCrawler:
    def __init__(self):
        self.setup_logging()
        self.ensure_data_directory()
        self.initialize_database()
        self.load_reddit_config()
        
        # Frustration keywords for sentiment analysis
        self.frustration_keywords = [
            'hate', 'annoying', 'struggling', 'difficult', 'frustrated', 
            'tired of', 'sick of', 'pain point', 'problem', 'issue',
            'challenge', 'headache', 'nightmare', 'waste', 'inefficient'
        ]
        
        # Initialize topic modeling
        self.vectorizer = CountVectorizer(
            max_df=0.95, min_df=2, stop_words='english'
        )
        self.lda = LatentDirichletAllocation(
            n_components=5, random_state=42
        )

    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment and frustration levels in text."""
        blob = TextBlob(text.lower())
        
        # Calculate base sentiment
        sentiment = blob.sentiment.polarity
        
        # Calculate frustration score
        frustration_score = sum(
            1 for keyword in self.frustration_keywords 
            if keyword in text.lower()
        ) / len(self.frustration_keywords)
        
        # Calculate urgency based on time-related words and exclamation marks
        urgency_words = ['asap', 'urgent', 'immediately', 'critical', 'emergency']
        urgency_score = (
            sum(1 for word in urgency_words if word in text.lower()) +
            text.count('!')
        ) / (len(urgency_words) + 1)
        
        # Calculate impact based on mentions of scale/importance
        impact_words = ['everyone', 'all', 'major', 'significant', 'huge']
        impact_score = sum(1 for word in impact_words if word in text.lower()) / len(impact_words)
        
        return {
            "frustration": min(frustration_score, 1.0),
            "urgency": min(urgency_score, 1.0),
            "impact": min(impact_score, 1.0)
        }

    def extract_topic_clusters(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Use LDA to identify topic clusters in the texts."""
        if not texts:
            return []
            
        # Prepare the document-term matrix
        dtm = self.vectorizer.fit_transform(texts)
        
        # Fit LDA model
        lda_output = self.lda.fit_transform(dtm)
        
        # Get feature names (words)
        feature_names = self.vectorizer.get_feature_names_out()
        
        # Extract topics
        topics = []
        for topic_idx, topic in enumerate(self.lda.components_):
            top_words = [
                feature_names[i] 
                for i in topic.argsort()[:-10 - 1:-1]
            ]
            topics.append({
                "id": topic_idx,
                "words": top_words,
                "weight": float(np.mean(lda_output[:, topic_idx]))
            })
        
        return topics

    def collect_engagement_metrics(self, submission) -> Dict[str, int]:
        """Collect engagement metrics from a Reddit submission."""
        return {
            "upvotes": submission.score,
            "comments": submission.num_comments,
            "unique_users": len(set(
                comment.author.name 
                for comment in submission.comments.list()
                if hasattr(comment, 'author') and comment.author
            ))
        }

    def process_subreddit_data(self, subreddit_name: str):
        """Process data from a subreddit with enhanced analysis."""
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            topics_data = defaultdict(lambda: {
                'mention_count': 0,
                'pain_points': [],
                'solution_requests': [],
                'app_ideas': [],
                'trend_data': [],
                'sentiment_scores': {"frustration": 0, "urgency": 0, "impact": 0},
                'engagement_metrics': {"upvotes": 0, "comments": 0, "unique_users": 0}
            })

            for submission in subreddit.hot(limit=100):
                # Skip if too old
                if (datetime.utcnow() - datetime.fromtimestamp(submission.created_utc)) > timedelta(days=30):
                    continue

                # Analyze title and body
                text = f"{submission.title} {submission.selftext}"
                extracted_topics = self.extract_potential_topics(text)
                
                for topic in extracted_topics:
                    topic_data = topics_data[topic]
                    
                    # Update mention count
                    topic_data['mention_count'] += 1
                    
                    # Analyze sentiment
                    sentiment = self.analyze_sentiment(text)
                    for key in sentiment:
                        topic_data['sentiment_scores'][key] = max(
                            topic_data['sentiment_scores'][key],
                            sentiment[key]
                        )
                    
                    # Collect engagement metrics
                    engagement = self.collect_engagement_metrics(submission)
                    for key in engagement:
                        topic_data['engagement_metrics'][key] += engagement[key]
                    
                    # Extract pain points and other data
                    pain_points = self.extract_pain_points(text)
                    if pain_points:
                        topic_data['pain_points'].extend(pain_points)
                    
                    solutions = self.extract_solution_requests(text)
                    if solutions:
                        topic_data['solution_requests'].extend(solutions)
                    
                    app_ideas = self.extract_app_ideas(text)
                    if app_ideas:
                        topic_data['app_ideas'].extend(app_ideas)

            # Process topic clusters for each topic
            for topic_name, data in topics_data.items():
                all_texts = [
                    point['text'] for point in 
                    data['pain_points'] + data['solution_requests'] + data['app_ideas']
                ]
                data['topic_clusters'] = self.extract_topic_clusters(all_texts)

            # Update database
            self.update_database(topics_data)
            
        except Exception as e:
            logging.error(f"Error processing subreddit {subreddit_name}: {str(e)}")

    def update_database(self, topics_data: Dict[str, Dict[str, Any]]):
        """Update database with the collected and analyzed data."""
        try:
            for topic_name, data in topics_data.items():
                cursor = self.db.cursor()
                
                # Check if topic exists
                cursor.execute(
                    "SELECT id FROM reddit_topics WHERE name = ?", 
                    (topic_name,)
                )
                result = cursor.fetchone()
                
                if result:
                    # Update existing topic
                    cursor.execute("""
                        UPDATE reddit_topics 
                        SET mention_count = ?,
                            pain_points = ?,
                            solution_requests = ?,
                            app_ideas = ?,
                            sentiment_scores = ?,
                            topic_clusters = ?,
                            engagement_metrics = ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    """, (
                        data['mention_count'],
                        json.dumps(data['pain_points']),
                        json.dumps(data['solution_requests']),
                        json.dumps(data['app_ideas']),
                        json.dumps(data['sentiment_scores']),
                        json.dumps(data['topic_clusters']),
                        json.dumps(data['engagement_metrics']),
                        result[0]
                    ))
                else:
                    # Insert new topic
                    cursor.execute("""
                        INSERT INTO reddit_topics (
                            name, category, mention_count,
                            pain_points, solution_requests, app_ideas,
                            sentiment_scores, topic_clusters, engagement_metrics
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        topic_name,
                        self.categorize_topic(topic_name),
                        data['mention_count'],
                        json.dumps(data['pain_points']),
                        json.dumps(data['solution_requests']),
                        json.dumps(data['app_ideas']),
                        json.dumps(data['sentiment_scores']),
                        json.dumps(data['topic_clusters']),
                        json.dumps(data['engagement_metrics'])
                    ))
                
                self.db.commit()
                
        except Exception as e:
            logging.error(f"Error updating database: {str(e)}")
            self.db.rollback()

def load_reddit_config() -> Dict[str, Any]:
    """Load Reddit API credentials from config file"""
    config = configparser.ConfigParser()
    config.read('config.ini')
    
    try:
        auth = {
            'client_id': config['REDDIT']['client_id'],
            'client_secret': config['REDDIT']['client_secret'],
            'user_agent': config['REDDIT']['user_agent']
        }
        return auth
    except Exception as e:
        logging.error(f"Failed to load Reddit credentials: {e}")
        raise

def get_reddit_token(auth: Dict[str, str]) -> str:
    """Get Reddit API access token using application-only OAuth"""
    auth_url = "https://www.reddit.com/api/v1/access_token"
    auth_header = base64.b64encode(
        f"{auth['client_id']}:{auth['client_secret']}".encode()
    ).decode()
    
    headers = {
        "User-Agent": auth['user_agent'],
        "Authorization": f"Basic {auth_header}"
    }
    
    data = {
        "grant_type": "client_credentials",
        "duration": "temporary"
    }
    
    try:
        session = requests.Session()
        proxies = {
            'http': 'socks5h://localhost:9150',
            'https': 'socks5h://localhost:9150'
        }
        response = session.post(
            auth_url,
            headers=headers,
            data=data,
            auth=(auth['client_id'], auth['client_secret']),
            proxies=proxies,
            verify=certifi.where()
        )
        response.raise_for_status()
        return response.json()["access_token"]
    except Exception as e:
        logging.error(f"Failed to get Reddit token: {e}")
        raise

def ensure_data_directory():
    """Ensure the data directory exists"""
    if not os.path.exists('data'):
        os.makedirs('data')
        logging.info("Created data directory")

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
    logging.info("Database initialized")

def extract_topics_from_text(text: str) -> List[str]:
    """Extract potential SaaS topics from text using regex patterns"""
    # Common SaaS-related keywords
    saas_keywords = r'(app|platform|software|tool|solution|system|service|automation|management|analytics)'
    
    # Pattern to match potential SaaS topics
    pattern = rf'\b\w+(?:\s+\w+)*\s+{saas_keywords}\b'
    
    topics = re.findall(pattern, text.lower())
    return list(set(topics))

def analyze_sentiment_and_context(text: str) -> Dict[str, List[Dict[str, Any]]]:
    """Analyze text for pain points, solution requests, and app ideas"""
    results = {
        'pain_points': [],
        'solution_requests': [],
        'app_ideas': []
    }
    
    # Pain points patterns
    pain_patterns = [
        r'(?:struggling|frustrated|difficult|hard|impossible|annoying|hate)\s+(?:with|to|when|that|how)\s+([^.!?]+)',
        r'(?:wish|need|want)\s+(?:there\s+was|to\s+find|to\s+have)\s+([^.!?]+)',
        r'(?:problem|issue|challenge)\s+(?:with|is|when)\s+([^.!?]+)'
    ]
    
    # Solution request patterns
    solution_patterns = [
        r'(?:looking\s+for|need|want)\s+(?:a|an|some)\s+(?:way|tool|solution|app)\s+to\s+([^.!?]+)',
        r'(?:how\s+can\s+I|what\'s\s+the\s+best\s+way\s+to)\s+([^.!?]+)',
        r'(?:recommend|suggest)\s+(?:a|an|any)\s+(?:tool|app|solution|software)\s+for\s+([^.!?]+)'
    ]
    
    # App idea patterns
    idea_patterns = [
        r'(?:should\s+build|could\s+create|idea\s+for)\s+(?:a|an|some)\s+(?:app|tool|platform|solution)\s+(?:that|to|for)\s+([^.!?]+)',
        r'(?:what\s+if|imagine)\s+(?:there\s+was|we\s+had)\s+(?:a|an|some)\s+(?:app|tool|platform)\s+that\s+([^.!?]+)',
        r'(?:potential|opportunity)\s+for\s+(?:a|an|some)\s+(?:app|tool|platform)\s+to\s+([^.!?]+)'
    ]
    
    # Process each pattern type
    for pattern in pain_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if match not in [p['text'] for p in results['pain_points']]:
                results['pain_points'].append({'text': match.strip(), 'count': 1})
    
    for pattern in solution_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if match not in [s['text'] for s in results['solution_requests']]:
                results['solution_requests'].append({'text': match.strip(), 'count': 1})
    
    for pattern in idea_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if match not in [i['text'] for i in results['app_ideas']]:
                results['app_ideas'].append({'text': match.strip(), 'count': 1})
    
    return results

def collect_data(time_period: str):
    """Collect real data from Reddit"""
    logging.info(f"Starting data collection for time period: {time_period}")
    
    # Initialize database and get Reddit token
    initialize_database()
    auth = load_reddit_config()
    token = get_reddit_token(auth)
    
    headers = {
        "User-Agent": auth['user_agent'],
        "Authorization": f"Bearer {token}"
    }
    
    # Create a session for all requests
    session = requests.Session()
    proxies = {
        'http': 'socks5h://localhost:9150',
        'https': 'socks5h://localhost:9150'
    }
    session.proxies = proxies
    session.verify = certifi.where()
    
    # Define relevant subreddits for SaaS opportunities
    subreddits = [
        'startups', 'SaaS', 'Entrepreneur', 'smallbusiness', 'programming',
        'webdev', 'technology', 'software', 'business', 'productivity'
    ]
    
    # Time period mapping
    time_filters = {
        'hour': 1,
        'day': 24,
        'week': 168
    }
    
    hours = time_filters.get(time_period, 24)
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    
    # Data structures to store aggregated information
    topics_data = defaultdict(lambda: {
        'name': '',
        'category': '',
        'mention_count': 0,
        'growth_percentage': 0,
        'pain_points': defaultdict(int),
        'solution_requests': defaultdict(int),
        'app_ideas': defaultdict(int),
        'trend_data': defaultdict(int)
    })
    
    try:
        for subreddit_name in subreddits:
            logging.info(f"Processing subreddit: {subreddit_name}")
            
            # Fetch new posts
            url = f"https://oauth.reddit.com/r/{subreddit_name}/new"
            params = {"limit": 100}
            
            try:
                response = session.get(
                    url,
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                posts = response.json()["data"]["children"]
                
                for post_data in posts:
                    post = post_data["data"]
                    created_time = datetime.fromtimestamp(post["created_utc"], timezone.utc)
                    
                    if created_time < since:
                        continue
                    
                    # Extract topics from title and body
                    text = f"{post['title']} {post.get('selftext', '')}"
                    extracted_topics = extract_topics_from_text(text)
                    
                    # Analyze sentiment and context
                    analysis = analyze_sentiment_and_context(text)
                    
                    # Process each topic
                    for topic in extracted_topics:
                        topic_data = topics_data[topic]
                        topic_data['name'] = topic
                        topic_data['category'] = subreddit_name
                        topic_data['mention_count'] += 1
                        
                        # Add pain points, solution requests, and app ideas
                        for category in ['pain_points', 'solution_requests', 'app_ideas']:
                            for item in analysis[category]:
                                topic_data[category][item['text']] += 1
                        
                        # Add trend data
                        date_key = created_time.strftime('%Y-%m-%d')
                        topic_data['trend_data'][date_key] += 1
                    
                    # Fetch comments
                    if post.get("num_comments", 0) > 0:
                        comments_url = f"https://oauth.reddit.com/r/{subreddit_name}/comments/{post['id']}"
                        comments_response = session.get(
                            comments_url,
                            headers=headers,
                            params={"limit": 100}
                        )
                        comments_response.raise_for_status()
                        
                        comments = comments_response.json()[1]["data"]["children"]
                        for comment_data in comments:
                            if comment_data["kind"] != "t1":
                                continue
                                
                            comment = comment_data["data"]
                            text = comment.get("body", "")
                            extracted_topics = extract_topics_from_text(text)
                            analysis = analyze_sentiment_and_context(text)
                            
                            for topic in extracted_topics:
                                topic_data = topics_data[topic]
                                topic_data['name'] = topic
                                topic_data['category'] = subreddit_name
                                topic_data['mention_count'] += 1
                                
                                for category in ['pain_points', 'solution_requests', 'app_ideas']:
                                    for item in analysis[category]:
                                        topic_data[category][item['text']] += 1
                                
                                comment_time = datetime.fromtimestamp(comment["created_utc"], timezone.utc)
                                date_key = comment_time.strftime('%Y-%m-%d')
                                topic_data['trend_data'][date_key] += 1
                
            except Exception as e:
                logging.error(f"Error processing subreddit {subreddit_name}: {e}")
                continue
        
        # Calculate growth percentages and save to database
        conn = sqlite3.connect('data/redditradar.db')
        cursor = conn.cursor()
        
        for topic_name, data in topics_data.items():
            # Convert trend data to sorted list
            trend_list = [
                {'month': date, 'mentions': count}
                for date, count in sorted(data['trend_data'].items())
            ]
            
            # Calculate growth percentage
            if len(trend_list) >= 2:
                old_mentions = trend_list[0]['mentions']
                new_mentions = trend_list[-1]['mentions']
                if old_mentions > 0:
                    growth = ((new_mentions - old_mentions) / old_mentions) * 100
                else:
                    growth = 0
            else:
                growth = 0
            
            # Prepare data for insertion
            pain_points = [
                {'text': text, 'count': count}
                for text, count in data['pain_points'].items()
            ]
            
            solution_requests = [
                {'text': text, 'count': count}
                for text, count in data['solution_requests'].items()
            ]
            
            app_ideas = [
                {'text': text, 'count': count}
                for text, count in data['app_ideas'].items()
            ]
            
            # Calculate opportunity score
            opportunity_score = {
                'total_score': min(100, (
                    (data['mention_count'] * 0.3) +
                    (growth * 0.3) +
                    (len(pain_points) * 10 * 0.2) +
                    (len(solution_requests) * 10 * 0.1) +
                    (len(app_ideas) * 10 * 0.1)
                )),
                'monetization_score': min(100, len(pain_points) * 20),
                'urgency_score': min(100, growth),
                'market_score': min(100, data['mention_count'] * 0.5),
                'competition_score': min(100, 100 - (len(app_ideas) * 10)),
                'engagement_score': min(100, (len(pain_points) + len(solution_requests)) * 10)
            }
            
            # Insert or update the topic
            cursor.execute('''
            INSERT OR REPLACE INTO reddit_topics 
            (name, category, mention_count, growth_percentage, pain_points, 
            solution_requests, app_ideas, trend_data, opportunity_scores, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data['name'],
                data['category'],
                data['mention_count'],
                growth,
                json.dumps(pain_points),
                json.dumps(solution_requests),
                json.dumps(app_ideas),
                json.dumps(trend_list),
                json.dumps(opportunity_score),
                datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            ))
        
        conn.commit()
        conn.close()
        logging.info("Data collection completed successfully")
        
    except Exception as e:
        logging.error(f"Error during data collection: {e}")
        raise

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