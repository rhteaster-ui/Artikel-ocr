export interface ArticleSummary {
  takeaway: string;
  highlights: string[];
  fullText: string;
}

export interface ArticleMetric {
  value: string;
  label: string;
  context: string;
}

export interface ArticleClaim {
  claim: string;
  validity: string;
  evidence: string;
  quote: string;
}

export interface ToneProfile {
  analytical: number;
  opinionated: number;
  promotional: number;
  sensationalist: number;
  objective: number;
}

export interface ArticleTone {
  profile: ToneProfile;
  description: string;
}

export interface ArticleAnalysis {
  title: string;
  summary: ArticleSummary;
  metrics: ArticleMetric[];
  claims: ArticleClaim[];
  tone: ArticleTone;
  questions: string[];
  discussionTopics?: DiscussionTopic[];
}

export interface DiscussionTopic {
  topic: string;
  description: string;
  starterQuestions: string[];
}

export interface ArticleSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface ArticleData {
  title: string;
  text: string;
  analysis: ArticleAnalysis;
  isSearchMode?: boolean;
  sources?: ArticleSource[];
  keyIndexUsed?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}
