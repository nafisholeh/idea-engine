import praw
import pandas as pd
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import re
from datetime import datetime, timedelta
from collections import Counter
import spacy
import json
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import schedule
import time
import configparser
import logging
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import urllib3
import requests
import socks
import socket
import ssl
from urllib3.contrib.socks import SOCKSProxyManager
import certifi

# Configure Tor SOCKS proxy
proxy_url = 'socks5h://127.0.0.1:9150'
socks.set_default_proxy(socks.SOCKS5, "127.0.0.1", 9150)
socket.socket = socks.socksocket

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("reddit_insights.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load configuration
config = configparser.ConfigParser()
config.read('config.ini')

# Initialize NLTK resources
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

# Initialize spaCy
nlp = spacy.load("en_core_web_sm")

# Set up database
Base = declarative_base()

class RedditPost(Base):
    __tablename__ = 'reddit_posts'
    
    id = Column(String, primary_key=True)
    subreddit = Column(String)
    title = Column(String)
    selftext = Column(Text)
    created_utc = Column(DateTime)
    score = Column(Integer)
    num_comments = Column(Integer)
    permalink = Column(String)
    
class RedditComment(Base):
    __tablename__ = 'reddit_comments'
    
    id = Column(String, primary_key=True)
    post_id = Column(String)
    body = Column(Text)
    created_utc = Column(DateTime)
    score = Column(Integer)
    
class RedditTopic(Base):
    __tablename__ = 'reddit_topics'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    category = Column(String)
    last_updated = Column(DateTime)
    trend_data = Column(JSON)
    pain_points = Column(JSON)
    solution_requests = Column(JSON)
    app_ideas = Column(JSON)
    mention_count = Column(Integer)
    growth_percentage = Column(Float)

# Database connection
engine = create_engine('sqlite:///reddit_insights.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

def get_working_proxy():
    """Get a working proxy from a free proxy list."""
    try:
        # Try to get a list of free proxies
        proxy_list_url = "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt"
        response = requests.get(proxy_list_url)
        proxies = response.text.split('\n')
        
        # Test each proxy
        for proxy in proxies:
            if not proxy.strip():
                continue
                
            proxy_dict = {
                'http': f'http://{proxy}',
                'https': f'http://{proxy}'
            }
            
            try:
                # Test the proxy with Reddit
                test_response = requests.get(
                    'https://www.reddit.com/api/v1/access_token',
                    proxies=proxy_dict,
                    timeout=5
                )
                if test_response.status_code != 407:  # Proxy authentication required
                    return proxy_dict
            except:
                continue
                
        return None
        
    except Exception as e:
        logger.error(f"Error finding proxy: {str(e)}")
        return None

class RedditInsightCollector:
    def __init__(self):
        """Initialize the Reddit API client and other necessary components."""
        # Create a proxy manager with custom SSL context
        proxy_manager = SOCKSProxyManager(
            proxy_url,
            cert_reqs='CERT_NONE',
            ca_certs=certifi.where()
        )
        
        # Create a session with the proxy manager
        session = requests.Session()
        session.verify = False  # Disable SSL verification for testing
        session.proxies = {
            'http': proxy_url,
            'https': proxy_url
        }
        
        self.reddit = praw.Reddit(
            client_id=config['REDDIT']['client_id'],
            client_secret=config['REDDIT']['client_secret'],
            user_agent=config['REDDIT']['user_agent'],
            requestor_kwargs={'session': session}
        )
        
        # Subreddits to monitor
        self.subreddits = [
            # Tech subreddits
            'technology', 'programming', 'webdev', 'machinelearning', 'artificial',
            'python', 'javascript', 'androiddev', 'iOSProgramming', 'learnprogramming',
            
            # Productivity subreddits
            'productivity', 'getdisciplined', 'organization', 'notebooks', 'notetaking',
            
            # Finance subreddits
            'personalfinance', 'financialindependence', 'investing', 'frugal', 'budgeting',
            
            # Health & wellness subreddits
            'mentalhealth', 'meditation', 'selfimprovement', 'getmotivated', 'psychology',
            
            # Generic idea-focused subreddits
            'startups', 'entrepreneur', 'SideProject', 'AppIdeas', 'SomebodyMakeThis'
        ]
        
        # Topic categories
        self.categories = {
            'tech': ['technology', 'software', 'app', 'ai', 'automation', 'code', 'programming', 'tools'],
            'productivity': ['productivity', 'notes', 'organization', 'workflow', 'time management', 'knowledge', 'task'],
            'finance': ['finance', 'money', 'budget', 'investing', 'expense', 'save', 'financial', 'banking'],
            'health': ['health', 'mental', 'wellness', 'meditation', 'mindfulness', 'therapy', 'stress'],
            'entertainment': ['entertainment', 'games', 'streaming', 'media', 'video', 'music', 'social']
        }
        
        # Pain point indicators
        self.pain_indicators = [
            'problem', 'issue', 'annoying', 'frustrating', 'difficult', 'hate', 'tired of',
            'wish', 'struggle', 'hard to', 'can\'t stand', 'doesn\'t work', 'broken',
            'expensive', 'overpriced', 'waste', 'complicated', 'confusing', 'too many', 'too few',
            'privacy', 'security', 'slow', 'unreliable', 'missing', 'lack of', 'limited'
        ]
        
        # Solution request indicators
        self.solution_indicators = [
            'need', 'want', 'looking for', 'alternative to', 'replacement for', 'solution',
            'help with', 'how to', 'fix', 'better way', 'recommend', 'suggestion',
            'advice on', 'improve', 'seeking', 'request', 'anyone know', 'is there a'
        ]
        
        # App idea indicators
        self.idea_indicators = [
            'idea', 'concept', 'app', 'software', 'platform', 'tool', 'service', 'website',
            'create', 'build', 'develop', 'make', 'startup', 'project', 'product', 
            'would be cool if', 'imagine if', 'what if', 'thinking about', 'considering'
        ]
        
        # Additional metrics for opportunity scoring
        self.monetization_keywords = [
            'subscription', 'paid', 'premium', 'enterprise', 'business', 'pricing',
            'monthly', 'annually', 'license', 'commercial', 'professional',
            'saas', 'b2b', 'roi', 'revenue', 'profit', 'market'
        ]
        
        self.urgency_keywords = [
            'need', 'urgent', 'asap', 'immediately', 'looking for',
            'help', 'frustrated', 'annoying', 'waste of time', 'inefficient',
            'manual', 'tedious', 'time-consuming', 'expensive'
        ]
        
        self.market_size_indicators = [
            'everyone', 'all companies', 'industry standard', 'widely used',
            'enterprise', 'small business', 'startup', 'scale', 'growing market'
        ]
        
        self.competition_keywords = [
            'alternative to', 'better than', 'versus', 'vs',
            'switch from', 'migrate from', 'replace', 'competitor'
        ]
    
    def collect_data(self, time_period='week'):
        """Collect posts and comments from specified subreddits over a given time period."""
        session = Session()
        logger.info(f"Starting data collection for past {time_period}")
        
        # Set time limit based on specified period
        if time_period == 'day':
            time_limit = datetime.utcnow() - timedelta(days=1)
        elif time_period == 'week':
            time_limit = datetime.utcnow() - timedelta(days=7)
        elif time_period == 'month':
            time_limit = datetime.utcnow() - timedelta(days=30)
        else:
            time_limit = datetime.utcnow() - timedelta(days=90)
        
        for subreddit_name in self.subreddits:
            try:
                subreddit = self.reddit.subreddit(subreddit_name)
                
                # Collect posts
                for submission in subreddit.new(limit=500):
                    # Skip if post is older than time limit
                    post_time = datetime.fromtimestamp(submission.created_utc)
                    if post_time < time_limit:
                        continue
                    
                    # Check if post already exists in the database
                    existing_post = session.query(RedditPost).filter_by(id=submission.id).first()
                    if not existing_post:
                        new_post = RedditPost(
                            id=submission.id,
                            subreddit=subreddit_name,
                            title=submission.title,
                            selftext=submission.selftext,
                            created_utc=post_time,
                            score=submission.score,
                            num_comments=submission.num_comments,
                            permalink=submission.permalink
                        )
                        session.add(new_post)
                    
                    # Collect comments for this post
                    submission.comments.replace_more(limit=0)  # Skip "load more comments" links
                    for comment in submission.comments.list():
                        comment_time = datetime.fromtimestamp(comment.created_utc)
                        if comment_time < time_limit:
                            continue
                            
                        existing_comment = session.query(RedditComment).filter_by(id=comment.id).first()
                        if not existing_comment:
                            new_comment = RedditComment(
                                id=comment.id,
                                post_id=submission.id,
                                body=comment.body,
                                created_utc=comment_time,
                                score=comment.score
                            )
                            session.add(new_comment)
                
                session.commit()
                logger.info(f"Collected data from r/{subreddit_name}")
                
            except Exception as e:
                session.rollback()
                logger.error(f"Error collecting data from r/{subreddit_name}: {str(e)}")
        
        session.close()
        logger.info("Data collection completed")
    
    def preprocess_text(self, text):
        """Clean and preprocess text for analysis."""
        if not text or pd.isna(text):
            return ""
            
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+', '', text)
        
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        tokens = [lemmatizer.lemmatize(token) for token in tokens if token not in stop_words and len(token) > 2]
        
        return ' '.join(tokens)
    
    def identify_category(self, text):
        """Identify which category a text belongs to based on keyword matches."""
        text = text.lower()
        category_scores = {}
        
        for category, keywords in self.categories.items():
            score = sum(1 for keyword in keywords if keyword in text)
            category_scores[category] = score
        
        # Return the category with the highest score, or 'other' if all scores are 0
        max_category = max(category_scores.items(), key=lambda x: x[1])
        return max_category[0] if max_category[1] > 0 else 'other'
    
    def extract_mentions(self, text, indicators):
        """Extract mentions based on indicator phrases."""
        mentions = []
        
        # Check for indicator phrases
        for indicator in indicators:
            pattern = r'(?i)' + re.escape(indicator) + r'(.{3,100}?)(?:\.|,|\n|$)'
            matches = re.findall(pattern, text)
            for match in matches:
                if len(match.strip()) > 0:
                    mentions.append(match.strip())
        
        return mentions
    
    def extract_topics(self):
        """Extract and categorize topics from the collected data."""
        session = Session()
        logger.info("Starting topic extraction")
        
        # Get all posts and comments from the past 90 days
        ninety_days_ago = datetime.utcnow() - timedelta(days=90)
        
        # Get posts
        posts = session.query(RedditPost).filter(RedditPost.created_utc >= ninety_days_ago).all()
        post_texts = [(post.title + " " + post.selftext, post.created_utc, post.score) for post in posts]
        
        # Get comments
        comments = session.query(RedditComment).filter(RedditComment.created_utc >= ninety_days_ago).all()
        comment_texts = [(comment.body, comment.created_utc, comment.score) for comment in comments]
        
        # Combine posts and comments
        all_texts = post_texts + comment_texts
        
        # Preprocess texts
        processed_texts = [(self.preprocess_text(text), date, score) for text, date, score in all_texts]
        
        # Create a corpus for topic modeling
        corpus = [text for text, _, _ in processed_texts if text]
        
        # Use TF-IDF and K-means clustering for topic extraction
        vectorizer = TfidfVectorizer(max_features=1000)
        X = vectorizer.fit_transform(corpus)
        
        # Number of clusters (topics)
        num_clusters = 20
        kmeans = KMeans(n_clusters=num_clusters, random_state=42)
        kmeans.fit(X)
        
        # Get top terms for each cluster
        order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]
        terms = vectorizer.get_feature_names_out()
        
        topics = []
        for i in range(num_clusters):
            # Get top 5 terms for the topic
            top_terms = [terms[ind] for ind in order_centroids[i, :5]]
            topic_name = " ".join(top_terms[:2])  # Use first two terms as the name
            
            # Assign cluster to each document
            cluster_texts = []
            for j, (text, date, score) in enumerate(processed_texts):
                if text and kmeans.labels_[j] == i:
                    cluster_texts.append((text, date, score))
            
            if len(cluster_texts) > 0:
                # Category identification
                full_texts = " ".join([text for text, _, _ in cluster_texts])
                category = self.identify_category(full_texts)
                
                # Extract insights
                raw_texts = [text for text, _, _ in all_texts if self.preprocess_text(text[0]) in [t for t, _, _ in cluster_texts]]
                
                pain_points = []
                solution_requests = []
                app_ideas = []
                
                for text, _, _ in raw_texts:
                    pain_points.extend(self.extract_mentions(text, self.pain_indicators))
                    solution_requests.extend(self.extract_mentions(text, self.solution_indicators))
                    app_ideas.extend(self.extract_mentions(text, self.idea_indicators))
                
                # Count mentions by month for trend data
                monthly_counts = {}
                for _, date, _ in cluster_texts:
                    month_key = date.strftime("%Y-%m")
                    if month_key in monthly_counts:
                        monthly_counts[month_key] += 1
                    else:
                        monthly_counts[month_key] = 1
                
                # Calculate growth percentage
                trend_data = []
                for month in sorted(monthly_counts.keys()):
                    trend_data.append({"month": month, "count": monthly_counts[month]})
                
                # Calculate growth percentage if we have at least 2 months of data
                growth_percentage = 0
                if len(trend_data) >= 2:
                    first_month = trend_data[0]["count"]
                    last_month = trend_data[-1]["count"]
                    if first_month > 0:
                        growth_percentage = ((last_month - first_month) / first_month) * 100
                
                # Count mentions
                mention_count = len(cluster_texts)
                
                # Process and deduplicate insights
                processed_pain_points = self.process_insights(pain_points)
                processed_solution_requests = self.process_insights(solution_requests)
                processed_app_ideas = self.process_insights(app_ideas)
                
                # Create topic object
                topic = {
                    "name": topic_name,
                    "category": category,
                    "trend_data": trend_data,
                    "pain_points": processed_pain_points,
                    "solution_requests": processed_solution_requests,
                    "app_ideas": processed_app_ideas,
                    "mention_count": mention_count,
                    "growth_percentage": growth_percentage
                }
                
                topics.append(topic)
        
        # Save topics to database
        self.save_topics(topics)
        
        session.close()
        logger.info(f"Extracted {len(topics)} topics")
        return topics
    
    def process_insights(self, mentions):
        """Process and deduplicate insights, adding mention counts."""
        if not mentions:
            return []
            
        # Use spaCy for better text similarity comparison
        processed_mentions = []
        mention_groups = {}
        
        for mention in mentions:
            doc = nlp(mention)
            if len(doc) < 3:  # Skip very short mentions
                continue
                
            # Check if this mention is similar to any existing group
            found_match = False
            for group_id, group_mentions in mention_groups.items():
                rep_doc = nlp(group_mentions[0])  # Compare with the first mention in the group
                similarity = doc.similarity(rep_doc)
                
                if similarity > 0.75:  # High similarity threshold
                    mention_groups[group_id].append(mention)
                    found_match = True
                    break
            
            if not found_match:
                # Create a new group
                group_id = len(mention_groups)
                mention_groups[group_id] = [mention]
        
        # Process each group to create final insights
        for group_id, group_mentions in mention_groups.items():
            # Use the most common or the first mention as the representative
            if len(group_mentions) > 3:
                # Try to find the most representative mention
                # For now, just use the first one (could be improved)
                representative = group_mentions[0]
            else:
                representative = group_mentions[0]
            
            # Add sentiment analysis
            blob = TextBlob(representative)
            sentiment = blob.sentiment.polarity
            
            insight = {
                "text": representative,
                "mentions": len(group_mentions),
                "sentiment": sentiment,
                "examples": group_mentions[:3]  # Keep a few examples
            }
            
            processed_mentions.append(insight)
        
        # Sort by mention count
        processed_mentions.sort(key=lambda x: x["mentions"], reverse=True)
        
        return processed_mentions[:10]  # Return top 10 insights
    
    def save_topics(self, topics):
        """Save extracted topics to the database."""
        session = Session()
        
        try:
            # Clear existing topics
            session.query(RedditTopic).delete()
            
            # Add new topics
            for topic_data in topics:
                topic = RedditTopic(
                    name=topic_data["name"],
                    category=topic_data["category"],
                    last_updated=datetime.utcnow(),
                    trend_data=json.dumps(topic_data["trend_data"]),
                    pain_points=json.dumps(topic_data["pain_points"]),
                    solution_requests=json.dumps(topic_data["solution_requests"]),
                    app_ideas=json.dumps(topic_data["app_ideas"]),
                    mention_count=topic_data["mention_count"],
                    growth_percentage=topic_data["growth_percentage"]
                )
                session.add(topic)
            
            session.commit()
            logger.info(f"Saved {len(topics)} topics to database")
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error saving topics: {str(e)}")
        
        finally:
            session.close()
    
    def generate_dashboard_data(self):
        """Generate JSON data for the dashboard."""
        session = Session()
        
        try:
            # Get all topics
            topics = session.query(RedditTopic).all()
            
            dashboard_data = {
                "last_updated": datetime.utcnow().isoformat(),
                "topics": []
            }
            
            for topic in topics:
                topic_data = {
                    "name": topic.name,
                    "category": topic.category,
                    "mention_count": topic.mention_count,
                    "growth_percentage": topic.growth_percentage,
                    "pain_points": json.loads(topic.pain_points),
                    "solution_requests": json.loads(topic.solution_requests),
                    "app_ideas": json.loads(topic.app_ideas),
                    "trend_data": json.loads(topic.trend_data)
                }
                dashboard_data["topics"].append(topic_data)
            
            # Sort topics by mention count
            dashboard_data["topics"].sort(key=lambda x: x["mention_count"], reverse=True)
            
            # Write to JSON file
            with open('dashboard_data.json', 'w') as f:
                json.dump(dashboard_data, f, indent=2)
                
            logger.info("Generated dashboard data")
            return dashboard_data
            
        except Exception as e:
            logger.error(f"Error generating dashboard data: {str(e)}")
            return None
            
        finally:
            session.close()

    def run_scheduled_tasks(self):
        """Run scheduled tasks for data collection and analysis."""
        # Schedule daily collection for the past day
        schedule.every().day.at("02:00").do(self.collect_data, time_period='day')
        
        # Schedule weekly collection for the past week
        schedule.every().monday.at("03:00").do(self.collect_data, time_period='week')
        
        # Schedule monthly collection for the past month
        schedule.every(30).days.at("04:00").do(self.collect_data, time_period='month')
        
        # Schedule topic extraction daily
        schedule.every().day.at("05:00").do(self.extract_topics)
        
        # Schedule dashboard data generation every 6 hours
        schedule.every(6).hours.do(self.generate_dashboard_data)
        
        # Run continuously
        while True:
            schedule.run_pending()
            time.sleep(60)

    def analyze_opportunity_score(self, text, upvotes, comment_count):
        # Calculate monetization potential (0-100)
        monetization_score = sum(1 for kw in self.monetization_keywords if kw in text.lower()) * 20
        monetization_score = min(100, monetization_score)
        
        # Calculate urgency score (0-100)
        urgency_score = sum(1 for kw in self.urgency_keywords if kw in text.lower()) * 20
        urgency_score = min(100, urgency_score)
        
        # Calculate market size score (0-100)
        market_score = sum(1 for kw in self.market_size_indicators if kw in text.lower()) * 25
        market_score = min(100, market_score)
        
        # Calculate competition score (inverse: less competition is better)
        competition_score = 100 - (sum(1 for kw in self.competition_keywords if kw in text.lower()) * 25)
        competition_score = max(0, competition_score)
        
        # Calculate engagement score based on upvotes and comments
        engagement_score = min(100, (upvotes + comment_count * 2) / 10)
        
        # Calculate weighted opportunity score
        weights = {
            'monetization': 0.3,
            'urgency': 0.2,
            'market_size': 0.2,
            'competition': 0.15,
            'engagement': 0.15
        }
        
        opportunity_score = (
            monetization_score * weights['monetization'] +
            urgency_score * weights['urgency'] +
            market_score * weights['market_size'] +
            competition_score * weights['competition'] +
            engagement_score * weights['engagement']
        )
        
        return {
            'total_score': opportunity_score,
            'monetization_score': monetization_score,
            'urgency_score': urgency_score,
            'market_score': market_score,
            'competition_score': competition_score,
            'engagement_score': engagement_score
        }

    def extract_budget_mentions(self, text):
        # Extract mentions of budgets, prices, or willingness to pay
        budget_pattern = r'\$\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*\s*(?:dollars|USD)'
        budgets = re.findall(budget_pattern, text)
        return [float(re.sub(r'[^\d.]', '', b)) for b in budgets]

    def analyze_post(self, post):
        # ... existing analysis code ...
        
        # Add opportunity scoring
        opportunity_scores = self.analyze_opportunity_score(
            post.selftext + ' ' + post.title,
            post.score,
            len(post.comments)
        )
        
        # Extract budget information
        mentioned_budgets = self.extract_budget_mentions(post.selftext + ' ' + post.title)
        avg_budget = sum(mentioned_budgets) / len(mentioned_budgets) if mentioned_budgets else 0
        
        return {
            'id': post.id,
            'title': post.title,
            'content': post.selftext,
            'score': post.score,
            'comment_count': len(post.comments),
            'opportunity_scores': opportunity_scores,
            'mentioned_budgets': mentioned_budgets,
            'average_budget': avg_budget,
            # ... existing return fields ...
        }

# Generate sample config.ini file (this would be separate in production)
def generate_sample_config():
    with open('config.ini', 'w') as f:
        f.write("""[REDDIT]
client_id = YOUR_CLIENT_ID
client_secret = YOUR_CLIENT_SECRET
user_agent = script:reddit-insights-collector:v1.0 (by /u/your_username)
username = YOUR_REDDIT_USERNAME
password = YOUR_REDDIT_PASSWORD
""")

# Flask API to serve the dashboard data
def create_api():
    from flask import Flask, jsonify, request
    
    app = Flask(__name__)
    collector = RedditInsightCollector()
    
    @app.route('/api/topics', methods=['GET'])
    def get_topics():
        """Get all topics."""
        session = Session()
        topics = session.query(RedditTopic).all()
        
        result = []
        for topic in topics:
            topic_data = {
                "id": topic.id,
                "name": topic.name,
                "category": topic.category,
                "mention_count": topic.mention_count,
                "growth_percentage": topic.growth_percentage,
                "pain_points": json.loads(topic.pain_points),
                "solution_requests": json.loads(topic.solution_requests),
                "app_ideas": json.loads(topic.app_ideas),
                "trend_data": json.loads(topic.trend_data)
            }
            result.append(topic_data)
        
        session.close()
        return jsonify(result)
    
    @app.route('/api/topics/<category>', methods=['GET'])
    def get_topics_by_category(category):
        """Get topics by category."""
        session = Session()
        topics = session.query(RedditTopic).filter_by(category=category).all()
        
        result = []
        for topic in topics:
            topic_data = {
                "id": topic.id,
                "name": topic.name,
                "category": topic.category,
                "mention_count": topic.mention_count,
                "growth_percentage": topic.growth_percentage,
                "pain_points": json.loads(topic.pain_points),
                "solution_requests": json.loads(topic.solution_requests),
                "app_ideas": json.loads(topic.app_ideas),
                "trend_data": json.loads(topic.trend_data)
            }
            result.append(topic_data)
        
        session.close()
        return jsonify(result)
    
    @app.route('/api/trending', methods=['GET'])
    def get_trending_topics():
        """Get trending topics with highest growth percentage."""
        session = Session()
        topics = session.query(RedditTopic).order_by(RedditTopic.growth_percentage.desc()).limit(10).all()
        
        result = []
        for topic in topics:
            topic_data = {
                "id": topic.id,
                "name": topic.name,
                "category": topic.category,
                "mention_count": topic.mention_count,
                "growth_percentage": topic.growth_percentage
            }
            result.append(topic_data)
        
        session.close()
        return jsonify(result)
    
    return app

# Main execution
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Reddit Data Collector and Analyzer')
    parser.add_argument('--collect', action='store_true', help='Collect data from Reddit')
    parser.add_argument('--analyze', action='store_true', help='Analyze collected data')
    parser.add_argument('--time-period', choices=['day', 'week', 'month', '90days'], default='week',
                      help='Time period for data collection (default: week)')
    
    args = parser.parse_args()
    
    collector = RedditInsightCollector()
    
    if args.collect:
        logger.info("Starting data collection...")
        collector.collect_data(time_period=args.time_period)
    
    if args.analyze:
        logger.info("Starting data analysis...")
        collector.extract_topics()
        collector.generate_dashboard_data()
    
    if not args.collect and not args.analyze:
        parser.print_help()