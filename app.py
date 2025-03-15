#!/usr/bin/env python
import os
import json
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from textblob import TextBlob
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation

app = Flask(__name__)
CORS(app)

# Ensure data directory exists
data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
if not os.path.exists(data_dir):
    os.makedirs(data_dir)

# Database connection helper
def get_db_connection():
    conn = sqlite3.connect(os.path.join(data_dir, 'ideaengine.db'))
    conn.row_factory = sqlite3.Row
    return conn

# Error handling
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Server error'}), 500

# API Routes
@app.route('/api/python/test', methods=['GET'])
def test_api():
    return jsonify({'message': 'Python API is working correctly!'})

@app.route('/api/python/analyze/sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of text data"""
    if not request.json or 'text' not in request.json:
        return jsonify({'error': 'No text provided'}), 400
    
    text = request.json['text']
    
    # Use TextBlob for sentiment analysis
    blob = TextBlob(text)
    sentiment = blob.sentiment
    
    # Calculate frustration score based on negative sentiment
    frustration_score = max(0, min(100, (1 - sentiment.polarity) * 100))
    
    # Calculate urgency score based on subjectivity
    urgency_score = max(0, min(100, sentiment.subjectivity * 100))
    
    return jsonify({
        'sentiment': {
            'polarity': sentiment.polarity,
            'subjectivity': sentiment.subjectivity
        },
        'scores': {
            'frustration': round(frustration_score, 1),
            'urgency': round(urgency_score, 1)
        }
    })

@app.route('/api/python/analyze/topics', methods=['POST'])
def analyze_topics():
    """Extract topics from text data using LDA"""
    if not request.json or 'texts' not in request.json:
        return jsonify({'error': 'No texts provided'}), 400
    
    texts = request.json['texts']
    num_topics = request.json.get('num_topics', 5)
    
    if not texts:
        return jsonify({'error': 'Empty text list'}), 400
    
    # Vectorize the text
    vectorizer = CountVectorizer(
        max_df=0.95, 
        min_df=2, 
        stop_words='english'
    )
    
    try:
        dtm = vectorizer.fit_transform(texts)
        
        # Create and fit the LDA model
        lda = LatentDirichletAllocation(
            n_components=num_topics, 
            random_state=42
        )
        lda.fit(dtm)
        
        # Get the feature names (words)
        feature_names = vectorizer.get_feature_names_out()
        
        # Extract topics
        topics = []
        for topic_idx, topic in enumerate(lda.components_):
            top_words_idx = topic.argsort()[:-10-1:-1]
            top_words = [feature_names[i] for i in top_words_idx]
            topics.append({
                'id': topic_idx,
                'words': top_words,
                'weight': float(topic.sum())
            })
        
        return jsonify({
            'topics': topics
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/python/analyze/pain-points', methods=['POST'])
def extract_pain_points():
    """Extract pain points from text data"""
    if not request.json or 'texts' not in request.json:
        return jsonify({'error': 'No texts provided'}), 400
    
    texts = request.json['texts']
    
    if not texts:
        return jsonify({'error': 'Empty text list'}), 400
    
    # Keywords that indicate pain points
    pain_keywords = [
        'hate', 'annoying', 'struggling', 'difficult', 'frustrated', 
        'tired of', 'sick of', 'pain point', 'problem', 'issue',
        'challenge', 'headache', 'nightmare', 'waste', 'inefficient'
    ]
    
    pain_points = []
    
    for text in texts:
        blob = TextBlob(text.lower())
        
        # Check if text contains pain keywords
        if any(keyword in text.lower() for keyword in pain_keywords):
            # Extract sentences containing pain keywords
            sentences = blob.sentences
            for sentence in sentences:
                if any(keyword in sentence.string.lower() for keyword in pain_keywords):
                    # Calculate frustration score
                    frustration = max(0, min(100, (1 - sentence.sentiment.polarity) * 100))
                    
                    pain_points.append({
                        'text': sentence.string,
                        'frustration_score': round(frustration, 1),
                        'source_text': text
                    })
    
    # Group similar pain points
    grouped_pain_points = {}
    for point in pain_points:
        text = point['text']
        key = text[:50]  # Use first 50 chars as key for grouping
        
        if key in grouped_pain_points:
            grouped_pain_points[key]['count'] += 1
            grouped_pain_points[key]['frustration_score'] = (
                (grouped_pain_points[key]['frustration_score'] * (grouped_pain_points[key]['count'] - 1)) + 
                point['frustration_score']
            ) / grouped_pain_points[key]['count']
        else:
            grouped_pain_points[key] = {
                'text': text,
                'count': 1,
                'frustration_score': point['frustration_score']
            }
    
    # Convert to list and sort by count
    result = list(grouped_pain_points.values())
    result.sort(key=lambda x: x['count'], reverse=True)
    
    return jsonify({
        'pain_points': result[:20]  # Return top 20 pain points
    })

@app.route('/api/python/analyze/app-ideas', methods=['POST'])
def generate_app_ideas():
    """Generate app ideas based on pain points"""
    if not request.json or 'pain_points' not in request.json:
        return jsonify({'error': 'No pain points provided'}), 400
    
    pain_points = request.json['pain_points']
    category = request.json.get('category', '')
    
    if not pain_points:
        return jsonify({'error': 'Empty pain points list'}), 400
    
    # Simple template-based app idea generation
    app_ideas = []
    
    templates = [
        "A {category} app that helps users {solution}",
        "A SaaS platform for {solution} in the {category} space",
        "{solution} tool for {category} professionals",
        "An AI-powered {category} assistant that {solution}",
        "A collaborative {category} platform that {solution}"
    ]
    
    solutions = [
        f"solve {point['text'].lower().replace('.', '')}" for point in pain_points
    ]
    
    for i, solution in enumerate(solutions):
        template = templates[i % len(templates)]
        idea = template.format(
            category=category.lower(),
            solution=solution
        )
        
        app_ideas.append({
            'text': idea,
            'title': f"{category.title()} {['App', 'Platform', 'Tool', 'Assistant', 'Solution'][i % 5]} for {solution.title()}",
            'description': f"This solution addresses the pain point: '{pain_points[i]['text']}'",
            'count': pain_points[i].get('count', 1)
        })
    
    return jsonify({
        'app_ideas': app_ideas
    })

@app.route('/api/python/stats/opportunity-score', methods=['POST'])
def calculate_opportunity_score():
    """Calculate opportunity score for a topic"""
    if not request.json:
        return jsonify({'error': 'No data provided'}), 400
    
    # Extract data from request
    pain_points = request.json.get('pain_points', [])
    growth_rate = request.json.get('growth_rate', 0)
    mention_count = request.json.get('mention_count', 0)
    
    # Calculate scores
    pain_score = min(100, sum(point.get('count', 1) for point in pain_points))
    growth_score = min(100, growth_rate * 2)
    market_score = min(100, mention_count / 10)
    
    # Calculate total opportunity score (weighted average)
    total_score = (
        pain_score * 0.4 +
        growth_score * 0.3 +
        market_score * 0.3
    )
    
    return jsonify({
        'opportunity_scores': {
            'total_score': round(total_score, 1),
            'pain_score': round(pain_score, 1),
            'growth_score': round(growth_score, 1),
            'market_score': round(market_score, 1)
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001) 