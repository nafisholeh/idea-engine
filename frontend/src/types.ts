// Define types for the application

export interface RedditTopic {
  id: number;
  name?: string;
  title?: string;
  category: string;
  mention_count?: number;
  growth_percentage?: number;
  growthRate?: number;
  pain_points?: PainPoint[];
  solution_requests?: SolutionRequest[];
  app_ideas?: AppIdea[];
  trend_data?: TrendPoint[];
  opportunity_scores?: OpportunityScores;
  opportunity_score?: number;
  average_budget?: number;
  last_updated?: string | number;
  score?: number;
  keywords?: string[];
  trend?: number;
}

export interface PainPoint {
  text: string;
  description?: string;
  count: number;
  mention_count?: number;
}

export interface SolutionRequest {
  text: string;
  description?: string;
  count: number;
  mention_count?: number;
}

export interface AppIdea {
  text: string;
  title?: string;
  description?: string;
  count: number;
}

export interface TrendPoint {
  month: string;
  date?: string;
  mentions: number;
}

export interface OpportunityScores {
  total_score: number;
  monetization_score: number;
  urgency_score: number;
  market_score: number;
  competition_score: number;
  engagement_score: number;
}

export interface DashboardStats {
  // Core metrics
  totalTopics: number;
  trendingTopics: number;
  totalCategories: number;
  totalPosts: number;
  totalOpportunities: number;
  averageGrowthRate: number;
  averageEngagement: number;

  // Growth metrics
  topicsGrowth: number;
  postsGrowth: number;
  opportunitiesGrowth: number;
  engagementGrowth: number;

  // Optional backward compatibility fields
  top_categories?: any[];
}

export interface FilterOptions {
  category: string;
  timeframe: string;
  search: string;
  minGrowth?: number;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  limit?: number;
}

export interface UserSubmittedIdea {
  title: string;
  description: string;
  category: string;
  target_audience: string;
  pain_points: string[];
  features: string[];
  competitor_urls: string[];
  monetization_model: string;
  estimated_budget: number;
  submitter_email?: string;
}

export interface CategoryStat {
  category: string;
  name?: string;
  count: number;
  painPoints?: number;
}

export interface GrowthTrend {
  month: string;
  growth: number;
}

export interface MarketAnalysisData {
  categoryDistribution: CategoryStat[];
  growthTrends: { month: string; growth: number }[];
  painPointsByCategory: CategoryStat[];
  monthlyGrowth?: { month: string; growth: number }[];
}