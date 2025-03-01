import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define interfaces for API responses
export interface Topic {
  id: number;
  name: string;
  category: string;
  mention_count: number;
  growth_percentage: number;
  pain_points: Array<{
    text: string;
    mentions: number;
    sentiment: number;
    examples: string[];
  }>;
  solution_requests: Array<{
    text: string;
    mentions: number;
    sentiment: number;
    examples: string[];
  }>;
  app_ideas: Array<{
    text: string;
    mentions: number;
    sentiment: number;
    examples: string[];
  }>;
  trend_data: Array<{
    month: string;
    count: number;
  }>;
  opportunity_scores?: {
    total_score: number;
    monetization_score: number;
    urgency_score: number;
    market_score: number;
    competition_score: number;
    engagement_score: number;
  };
}

export interface Stats {
  topic_count: number;
  total_mentions: number;
  categories: Array<{
    category: string;
    count: number;
  }>;
  last_updated: string;
}

export interface Opportunity {
  id: number;
  name: string;
  category: string;
  opportunity_score: number;
  scores: {
    monetization: number;
    urgency: number;
    market: number;
    competition: number;
    engagement: number;
  };
  potential_revenue: number;
  pain_points: Array<{
    text: string;
    mentions: number;
    sentiment: number;
    examples: string[];
  }>;
  solution_requests: Array<{
    text: string;
    mentions: number;
    sentiment: number;
    examples: string[];
  }>;
  app_ideas: Array<{
    text: string;
    mentions: number;
    sentiment: number;
    examples: string[];
  }>;
}

export interface MarketAnalysis {
  category: string;
  topic_count: number;
  avg_opportunity_score: number;
  avg_budget: number;
  total_mentions: number;
  avg_growth: number;
}

export interface CompetitorAnalysis {
  competitor: string;
  mention_count: number;
  market_presence: number;
  weaknesses: string[];
}

// API functions
export const getTopics = async (
  timeframe: string = '30days',
  category: string = 'all',
  search: string = ''
): Promise<Topic[]> => {
  const response = await api.get('/topics', {
    params: { timeframe, category, search },
  });
  return response.data;
};

export const getTopicsByCategory = async (category: string): Promise<Topic[]> => {
  const response = await api.get(`/topics/${category}`);
  return response.data;
};

export const getTrendingTopics = async (limit: number = 10): Promise<Topic[]> => {
  const response = await api.get('/trending', {
    params: { limit },
  });
  return response.data;
};

export const getStats = async (): Promise<Stats> => {
  const response = await api.get('/stats');
  return response.data;
};

export const getOpportunities = async (
  minScore: number = 70,
  limit: number = 10
): Promise<Opportunity[]> => {
  const response = await api.get('/opportunities', {
    params: { minScore, limit },
  });
  return response.data;
};

export const getMarketAnalysis = async (): Promise<MarketAnalysis[]> => {
  const response = await api.get('/market-analysis');
  return response.data;
};

export const getCompetitorAnalysis = async (topic: string): Promise<CompetitorAnalysis[]> => {
  const response = await api.get(`/competitor-analysis/${topic}`);
  return response.data;
};

export default api; 