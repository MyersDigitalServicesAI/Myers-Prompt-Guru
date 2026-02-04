export enum Category {
  ALL = 'All Prompts',
  CODING = 'Coding & Development',
  WRITING = 'Writing & Content',
  MARKETING = 'Marketing & SEO',
  BUSINESS = 'Business & Strategy',
  CREATIVE = 'Creative Arts',
  LEARNING = 'Education & Learning'
}

export interface Comment {
  id: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  template: string; // The raw text with [Placeholders]
  category: Category;
  tags?: string[];
  rating: number;
  reviews: Comment[];
  createdAt: string; // ISO Date string for recency sorting
}

export interface User {
  name: string;
  email: string;
  isPro: boolean; // Subscription status
  savedPrompts: string[]; // List of Prompt IDs
  history: { promptId: string; timestamp: string }[]; // Usage history
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type VariableMap = Record<string, string>;

export enum SortOption {
  NEWEST = 'Newest',
  RATING = 'Highest Rated',
  POPULAR = 'Most Popular'
}