export interface Lead {
  name: string;
  phone: string;
  website: string;
  email: string; // Often inferred or empty from Maps, but we try to fetch it
  instagram?: string;
  linkedin?: string;
  rating: number;
  reviewCount: number;
  address: string;
  googleMapsLink?: string;
  type: string;
  recommendedServiceId?: string;
  mobile_speed_issue?: boolean;
  mobile_speed_confidence?: 'Low' | 'Medium' | 'High';
  leadScore?: number;
}

export interface ServiceOffer {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  color: string;
}

export type SearchParams = {
  niche: string;
  location: string;
  count: number;
};

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: Lead[];
  hasSearched: boolean;
}

export interface AppSettings {
  geminiKey: string;
  openaiKey: string;
  claudeKey: string;
  grokKey: string;
  pitchModel: 'gemini' | 'openai' | 'claude' | 'grok';
}

export interface HistoryItem {
  id: string;
  date: string;
  params: SearchParams;
  leads: Lead[];
}

export interface AuditReport {
  overallScore: number;
  summary: string;
  categories: {
    name: string;
    score: number; // 0-10
    status: 'Good' | 'Fair' | 'Poor';
  }[];
  keyFindings: {
    type: 'issue' | 'good';
    text: string;
  }[];
  roadmap: {
    phase: string;
    title: string;
    items: string[];
  }[];
  technicalDetails: {
    title: string;
    value: string;
    status: 'pass' | 'fail' | 'warning';
  }[];
}