#!/usr/bin/env python
import os
import json
import sqlite3
from datetime import datetime, timedelta
import random

# Ensure data directory exists
data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

# Database path
db_path = os.path.join(data_dir, 'ideaengine.db')

# Sample data
categories = [
    'software', 'productivity', 'finance', 'health', 
    'education', 'entertainment', 'social', 'ecommerce'
]

topics = [
    {
        'name': 'AI Code Assistants',
        'category': 'software',
        'mention_count': 1250,
        'growth_percentage': 85.5,
    },
    {
        'name': 'No-Code Development',
        'category': 'software',
        'mention_count': 980,
        'growth_percentage': 72.3,
    },
    {
        'name': 'Personal Finance Apps',
        'category': 'finance',
        'mention_count': 1100,
        'growth_percentage': 45.8,
    },
    {
        'name': 'Mental Health Tracking',
        'category': 'health',
        'mention_count': 1500,
        'growth_percentage': 92.1,
    },
    {
        'name': 'Remote Work Tools',
        'category': 'productivity',
        'mention_count': 2200,
        'growth_percentage': 65.4,
    },
    {
        'name': 'Online Learning Platforms',
        'category': 'education',
        'mention_count': 1800,
        'growth_percentage': 58.7,
    },
    {
        'name': 'Subscription Management',
        'category': 'finance',
        'mention_count': 950,
        'growth_percentage': 42.3,
    },
    {
        'name': 'Content Creation Tools',
        'category': 'entertainment',
        'mention_count': 1650,
        'growth_percentage': 78.9,
    },
    {
        'name': 'Social Media Analytics',
        'category': 'social',
        'mention_count': 1200,
        'growth_percentage': 53.2,
    },
    {
        'name': 'E-commerce Platforms',
        'category': 'ecommerce',
        'mention_count': 1400,
        'growth_percentage': 48.6,
    }
]

# Generate sample pain points
def generate_pain_points(topic_name, category):
    pain_points = []
    
    templates = [
        f"I'm frustrated with the lack of good {topic_name.lower()} solutions.",
        f"Why is it so hard to find a decent {topic_name.lower()} tool?",
        f"The current {topic_name.lower()} options are too expensive and complicated.",
        f"I hate how {topic_name.lower()} tools are so unintuitive.",
        f"There's a serious gap in the market for {topic_name.lower()} in {category}.",
        f"I'm tired of cobbling together multiple tools for {topic_name.lower()}.",
        f"The learning curve for {topic_name.lower()} tools is too steep.",
        f"I wish there was a simpler way to handle {topic_name.lower()}.",
        f"Current {topic_name.lower()} solutions are missing key features.",
        f"I can't believe how outdated most {topic_name.lower()} tools are."
    ]
    
    for i, template in enumerate(templates):
        pain_points.append({
            'text': template,
            'count': random.randint(5, 50),
            'frustration_score': random.uniform(60, 95)
        })
    
    return pain_points

# Generate sample solution requests
def generate_solution_requests(topic_name, category):
    solution_requests = []
    
    templates = [
        f"We need a {topic_name.lower()} tool that's actually user-friendly.",
        f"I'd pay good money for a {topic_name.lower()} solution that just works.",
        f"Looking for recommendations for a simple {topic_name.lower()} tool.",
        f"What's the best {topic_name.lower()} option for small businesses?",
        f"Is there a {topic_name.lower()} tool that integrates with everything else I use?",
        f"Need a {topic_name.lower()} solution that doesn't require a PhD to use.",
        f"What do you use for {topic_name.lower()}? The options seem endless.",
        f"Seeking a {topic_name.lower()} tool with good customer support."
    ]
    
    for i, template in enumerate(templates):
        solution_requests.append({
            'text': template,
            'count': random.randint(3, 30)
        })
    
    return solution_requests

# Generate sample app ideas
def generate_app_ideas(topic_name, category):
    app_ideas = []
    
    templates = [
        {
            'title': f"{topic_name} Simplified",
            'text': f"A streamlined {topic_name.lower()} tool for {category} professionals.",
            'description': f"This app would focus on simplifying the {topic_name.lower()} process with an intuitive interface and core features that actually matter."
        },
        {
            'title': f"{topic_name} AI Assistant",
            'text': f"An AI-powered assistant for {topic_name.lower()}.",
            'description': f"Leveraging AI to automate and optimize {topic_name.lower()} tasks, saving users time and reducing errors."
        },
        {
            'title': f"{topic_name} All-in-One",
            'text': f"Comprehensive {topic_name.lower()} platform that replaces multiple tools.",
            'description': f"A single platform that combines all the necessary features for {topic_name.lower()}, eliminating the need for multiple subscriptions."
        },
        {
            'title': f"{topic_name} for Teams",
            'text': f"Collaborative {topic_name.lower()} platform for teams.",
            'description': f"Built specifically for team collaboration, this tool would make {topic_name.lower()} a seamless process across departments."
        },
        {
            'title': f"Budget {topic_name}",
            'text': f"Affordable {topic_name.lower()} solution for startups and small businesses.",
            'description': f"A cost-effective alternative to expensive enterprise {topic_name.lower()} tools, with all the essential features."
        }
    ]
    
    for i, template in enumerate(templates):
        app_ideas.append({
            'title': template['title'],
            'text': template['text'],
            'description': template['description'],
            'count': random.randint(2, 15)
        })
    
    return app_ideas

# Generate trend data
def generate_trend_data(mention_count, growth_percentage):
    trend_data = []
    now = datetime.now()
    
    # Start with a base value and apply growth
    base_value = mention_count / (1 + growth_percentage/100)
    
    for i in range(6):
        month_date = (now - timedelta(days=30 * (5-i))).strftime('%Y-%m-%d')
        
        # Calculate mentions with some randomness
        if i < 5:
            mentions = int(base_value * (1 + (i/5) * (growth_percentage/100)) * random.uniform(0.9, 1.1))
        else:
            mentions = mention_count
            
        trend_data.append({
            'month': month_date,
            'mentions': mentions
        })
    
    return trend_data

# Generate opportunity scores
def generate_opportunity_scores(mention_count, growth_percentage):
    # Calculate component scores
    market_score = min(100, mention_count / 25)
    growth_score = min(100, growth_percentage * 1.2)
    competition_score = random.uniform(40, 90)
    monetization_score = random.uniform(50, 95)
    engagement_score = random.uniform(60, 95)
    
    # Calculate total score (weighted average)
    total_score = (
        market_score * 0.25 +
        growth_score * 0.25 +
        competition_score * 0.2 +
        monetization_score * 0.15 +
        engagement_score * 0.15
    )
    
    return {
        'total_score': round(total_score, 1),
        'market_score': round(market_score, 1),
        'growth_score': round(growth_score, 1),
        'competition_score': round(competition_score, 1),
        'monetization_score': round(monetization_score, 1),
        'engagement_score': round(engagement_score, 1)
    }

# Initialize database
def init_db():
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Read schema file
    with open('schema.sql', 'r') as f:
        schema = f.read()
    
    # Execute schema
    cursor.executescript(schema)
    
    # Insert sample data
    for topic in topics:
        # Generate additional data
        pain_points = generate_pain_points(topic['name'], topic['category'])
        solution_requests = generate_solution_requests(topic['name'], topic['category'])
        app_ideas = generate_app_ideas(topic['name'], topic['category'])
        trend_data = generate_trend_data(topic['mention_count'], topic['growth_percentage'])
        opportunity_scores = generate_opportunity_scores(topic['mention_count'], topic['growth_percentage'])
        
        # Insert into database
        cursor.execute('''
            INSERT INTO reddit_topics (
                name,
                category,
                mention_count,
                growth_percentage,
                pain_points,
                solution_requests,
                app_ideas,
                trend_data,
                opportunity_scores,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            topic['name'],
            topic['category'],
            topic['mention_count'],
            topic['growth_percentage'],
            json.dumps(pain_points),
            json.dumps(solution_requests),
            json.dumps(app_ideas),
            json.dumps(trend_data),
            json.dumps(opportunity_scores),
            datetime.now().isoformat()
        ))
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print(f"Database initialized with {len(topics)} sample topics at {db_path}")

if __name__ == "__main__":
    init_db() 