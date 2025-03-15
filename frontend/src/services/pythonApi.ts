import axios from 'axios';
import { PainPoint, AppIdea } from '../types';

// Create axios instance with base URL and default config
const pythonApi = axios.create({
  baseURL: 'http://localhost:5000/api/python',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test API connection
export const testPythonApi = async (): Promise<{ message: string }> => {
  try {
    console.log('Testing Python API connection');
    const response = await pythonApi.get('/test');
    console.log('Python API test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error testing Python API connection:', error);
    throw error;
  }
};

// Analyze sentiment of text
export const analyzeSentiment = async (text: string): Promise<{
  sentiment: { polarity: number; subjectivity: number };
  scores: { frustration: number; urgency: number };
}> => {
  try {
    const response = await pythonApi.post('/analyze/sentiment', { text });
    return response.data;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};

// Extract topics from text data
export const analyzeTopics = async (
  texts: string[],
  numTopics: number = 5
): Promise<{
  topics: Array<{ id: number; words: string[]; weight: number }>;
}> => {
  try {
    const response = await pythonApi.post('/analyze/topics', { texts, num_topics: numTopics });
    return response.data;
  } catch (error) {
    console.error('Error analyzing topics:', error);
    throw error;
  }
};

// Extract pain points from text data
export const extractPainPoints = async (
  texts: string[]
): Promise<{
  pain_points: PainPoint[];
}> => {
  try {
    const response = await pythonApi.post('/analyze/pain-points', { texts });
    return response.data;
  } catch (error) {
    console.error('Error extracting pain points:', error);
    throw error;
  }
};

// Generate app ideas based on pain points
export const generateAppIdeas = async (
  painPoints: PainPoint[],
  category: string
): Promise<{
  app_ideas: AppIdea[];
}> => {
  try {
    const response = await pythonApi.post('/analyze/app-ideas', { 
      pain_points: painPoints,
      category
    });
    return response.data;
  } catch (error) {
    console.error('Error generating app ideas:', error);
    throw error;
  }
};

// Calculate opportunity score
export const calculateOpportunityScore = async (
  painPoints: PainPoint[],
  growthRate: number,
  mentionCount: number
): Promise<{
  opportunity_scores: {
    total_score: number;
    pain_score: number;
    growth_score: number;
    market_score: number;
  };
}> => {
  try {
    const response = await pythonApi.post('/stats/opportunity-score', {
      pain_points: painPoints,
      growth_rate: growthRate,
      mention_count: mentionCount
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating opportunity score:', error);
    throw error;
  }
};

export default pythonApi; 