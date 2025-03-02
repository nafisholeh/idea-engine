import axios from 'axios';
import { 
  RedditTopic, 
  DashboardStats, 
  MarketValidation, 
  UserSubmittedIdea, 
  SentimentAnalysis 
} from '../types';

const API_BASE_URL = '/api';

// Topic API endpoints
export const getTopics = async (
  timeframe: string = '30days',
  category: string = 'all',
  search: string = ''
): Promise<RedditTopic[]> => {
  const response = await axios.get(`${API_BASE_URL}/topics`, {
    params: { timeframe, category, search }
  });
  return response.data;
};

export const getTopicById = async (id: number): Promise<RedditTopic> => {
  const response = await axios.get(`${API_BASE_URL}/topics/${id}`);
  return response.data;
};

export const getTrendingTopics = async (limit: number = 10): Promise<RedditTopic[]> => {
  const response = await axios.get(`${API_BASE_URL}/trending`, {
    params: { limit }
  });
  return response.data;
};

export const getTopicsByCategory = async (category: string): Promise<RedditTopic[]> => {
  const response = await axios.get(`${API_BASE_URL}/topics/category/${category}`);
  return response.data;
};

// Statistics and Analytics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get(`${API_BASE_URL}/stats`);
  return response.data;
};

export const getOpportunities = async (minScore: number = 70, limit: number = 10): Promise<RedditTopic[]> => {
  const response = await axios.get(`${API_BASE_URL}/opportunities`, {
    params: { minScore, limit }
  });
  return response.data;
};

export const getMarketAnalysis = async (): Promise<any[]> => {
  const response = await axios.get(`${API_BASE_URL}/market-analysis`);
  return response.data;
};

export const getCompetitorAnalysis = async (topic: string): Promise<Competitor[]> => {
  const response = await axios.get(`${API_BASE_URL}/competitor-analysis/${topic}`);
  return response.data;
};

// New endpoints for sentiment analysis and market validation
export const getSentimentAnalysis = async (topicId: number): Promise<SentimentAnalysis> => {
  const response = await axios.get(`${API_BASE_URL}/sentiment/${topicId}`);
  return response.data;
};

export const getMarketValidation = async (topicId: number): Promise<MarketValidation> => {
  const response = await axios.get(`${API_BASE_URL}/market-validation/${topicId}`);
  return response.data;
};

// User submission endpoints
export const submitIdea = async (idea: UserSubmittedIdea): Promise<{ success: boolean, message: string }> => {
  const response = await axios.post(`${API_BASE_URL}/submit-idea`, idea);
  return response.data;
};

// Search and filter
export const searchTopics = async (query: string): Promise<RedditTopic[]> => {
  const response = await axios.get(`${API_BASE_URL}/search`, {
    params: { q: query }
  });
  return response.data;
};

// New endpoint for data collection status
export const getDataCollectionStatus = async (): Promise<{
  last_run: string;
  status: string;
  topics_collected: number;
  next_scheduled_run: string;
}> => {
  const response = await axios.get(`${API_BASE_URL}/collection-status`);
  return response.data;
}; 