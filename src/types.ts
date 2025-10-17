export interface MemePost {
  id: string;
  title: string;
  url: string;
  mediaUrl: string | null;
  author: string;
  subreddit: string;
  createdAt: Date;
  engagement: {
    upvotes: number;
    upvoteRatio: number;
    comments: number;
    awards: number;
  };
  tickers: string[];
  postType: 'image' | 'gif' | 'video' | 'gallery' | 'link';
  isNSFW: boolean;
}

export interface ScraperConfig {
  subreddits: string[];
  minUpvotes: number;
  minComments: number;
  timeframe: 'hour' | 'day' | 'week' | 'month';
  limit: number;
  includeNSFW: boolean;
}

export interface RedditCredentials {
  clientId: string;
  clientSecret: string;
  userAgent: string;
  username?: string;
  password?: string;
}
