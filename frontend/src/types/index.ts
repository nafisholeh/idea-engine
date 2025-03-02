// Type definitions for the RedditRadar application

export interface RedditTopic {
  id: number;
  name: string;
  category: string;
  mention_count: number;
  growth_percentage: number;
  last_updated: string;
  trend_data: TrendDataPoint[];
  pain_points: PainPoint[];
  solution_requests: SolutionRequest[];
  app_ideas: AppIdea[];
  opportunity_score?: number;
}

export interface PainPoint {
  text: string;
  examples: string[];
  mentions?: number;
}

export interface SolutionRequest {
  text: string;
  examples: string[];
  mentions?: number;
}

export interface AppIdea {
  text: string;
  examples: string[];
  mentions?: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  total_topics: number;
  total_mentions: number;
  trending_topics_count: number;
  opportunity_count: number;
  category_distribution: CategoryStat[];
  recent_topics: RedditTopic[];
  top_pain_points: string[];
  top_solution_requests: string[];
}

export interface OpportunityScore {
  total_score: number;
  monetization_score: number;
  urgency_score: number;
  market_score: number;
  competition_score: number;
  engagement_score: number;
}

export interface MarketValidation {
  competitors: Competitor[];
  market_size: number;
  growth_potential: number;
}

export interface Competitor {
  name: string;
  url: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: number;
  foundedYear?: number;
  pricing?: string;
}

export interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  overall: number;
}

export interface UserSubmittedIdea {
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  painPoints: string[];
  features: string[];
  competitorUrls: string[];
  submitterEmail: string;
}

export interface FilterOptions {
  timeframe: string;
  category: string;
  minScore: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} 