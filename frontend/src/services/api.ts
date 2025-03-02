import axios from 'axios';
import { 
  RedditTopic, 
  DashboardStats, 
  FilterOptions, 
  UserSubmittedIdea,
  CategoryStat,
  MarketAnalysisData
} from '../types';

// Create axios instance with base URL and default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('Fetching dashboard stats from:', `${api.defaults.baseURL}/dashboard/stats`);
    const response = await api.get('/dashboard/stats');
    console.log('Dashboard stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
    }
    throw error;
  }
};

// Get top trending topics
export const getTopTrendingTopics = async (limit: number = 5): Promise<RedditTopic[]> => {
  try {
    const response = await api.get('/topics/trending');
    return response.data;
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    throw error;
  }
};

// Get topics with filtering
export const getTopics = async (filters: FilterOptions): Promise<RedditTopic[]> => {
  try {
    const { category, timeframe, search } = filters;
    const response = await api.get('/topics', {
      params: { category, timeframe, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

// Get topic by ID
export const getTopicById = async (id: string | number): Promise<RedditTopic> => {
  try {
    const response = await api.get(`/topics/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching topic with ID ${id}:`, error);
    throw error;
  }
};

// Get available categories
export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get market analysis data
export const getMarketAnalysis = async (): Promise<{
  categoryDistribution: CategoryStat[];
  growthTrends: { month: string; growth: number }[];
  painPointsByCategory: CategoryStat[];
}> => {
  try {
    const response = await api.get('/market-analysis');
    return response.data;
  } catch (error) {
    console.error('Error fetching market analysis:', error);
    throw error;
  }
};

// Get opportunities with minimum score and optional category
export const getOpportunities = async (
  minScore: number = 70,
  category?: string
): Promise<RedditTopic[]> => {
  try {
    const response = await api.get('/opportunities', {
      params: { minScore, category }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    throw error;
  }
};

// Submit a new idea
export const submitIdea = async (idea: UserSubmittedIdea): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/ideas/submit', idea);
    return response.data;
  } catch (error) {
    console.error('Error submitting idea:', error);
    throw error;
  }
};

// Test API connection
export const testApiConnection = async (): Promise<{ message: string }> => {
  try {
    console.log('Testing API connection to:', `${api.defaults.baseURL}/test`);
    const response = await api.get('/test');
    console.log('API test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error testing API connection:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
    }
    throw error;
  }
};

export default api; 