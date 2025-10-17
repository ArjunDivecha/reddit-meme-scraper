import Snoowrap, { Submission } from 'snoowrap';
import { MemePost, ScraperConfig, RedditCredentials } from './types.js';
import { extractTickers, determinePostType, getMediaUrl, isMemePost } from './utils.js';

export class RedditMemeScraper {
  private reddit: Snoowrap;
  private config: ScraperConfig;

  constructor(credentials: RedditCredentials, config: Partial<ScraperConfig> = {}) {
    // Build snoowrap options, only include username/password if provided
    const snoowrapOptions: any = {
      userAgent: credentials.userAgent,
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
    };

    // Add username/password if provided (for authenticated requests)
    if (credentials.username && credentials.password) {
      snoowrapOptions.username = credentials.username;
      snoowrapOptions.password = credentials.password;
    }

    this.reddit = new Snoowrap(snoowrapOptions);

    // Set default configuration
    this.config = {
      subreddits: config.subreddits || ['wallstreetbets'],
      minUpvotes: config.minUpvotes ?? 100,
      minComments: config.minComments ?? 0,
      timeframe: config.timeframe || 'day',
      limit: config.limit || 50,
      includeNSFW: config.includeNSFW ?? true,
    };

    // Configure request delay to avoid rate limiting
    // Use 5-second delay to be safe with Reddit's API limits
    this.reddit.config({ requestDelay: 5000, warnings: false });
  }

  /**
   * Fetch memes from configured subreddits
   */
  async fetchMemes(): Promise<MemePost[]> {
    const allMemes: MemePost[] = [];

    for (const subreddit of this.config.subreddits) {
      try {
        console.log(`\n🔍 Scraping r/${subreddit}...`);
        const memes = await this.fetchFromSubreddit(subreddit);
        allMemes.push(...memes);
        console.log(`✅ Found ${memes.length} memes from r/${subreddit}`);
      } catch (error) {
        console.error(`❌ Error scraping r/${subreddit}:`, error);
      }
    }

    // Sort by engagement (upvotes)
    allMemes.sort((a, b) => b.engagement.upvotes - a.engagement.upvotes);

    return allMemes;
  }

  /**
   * Fetch memes from a single subreddit
   */
  private async fetchFromSubreddit(subredditName: string): Promise<MemePost[]> {
    const subreddit = this.reddit.getSubreddit(subredditName);
    
    // Fetch hot posts (note: snoowrap getHot doesn't support time parameter)
    const posts = await subreddit.getHot({ limit: this.config.limit });

    const memes: MemePost[] = [];

    for (const post of posts) {
      if (this.shouldIncludePost(post)) {
        const meme = this.convertToMemePost(post, subredditName);
        memes.push(meme);
      }
    }

    return memes;
  }

  /**
   * Check if post meets criteria
   */
  private shouldIncludePost(post: Submission): boolean {
    // Check if it has visual content
    if (!isMemePost(post)) {
      return false;
    }

    // Check NSFW filter
    if (post.over_18 && !this.config.includeNSFW) {
      return false;
    }

    // Check engagement thresholds
    if (post.score < this.config.minUpvotes) {
      return false;
    }

    if (post.num_comments < this.config.minComments) {
      return false;
    }

    return true;
  }

  /**
   * Convert Reddit submission to MemePost
   */
  private convertToMemePost(post: Submission, subredditName: string): MemePost {
    const fullText = `${post.title} ${post.selftext || ''}`;
    const tickers = extractTickers(fullText);

    return {
      id: post.id,
      title: post.title,
      url: `https://reddit.com${post.permalink}`,
      mediaUrl: getMediaUrl(post),
      author: post.author.name,
      subreddit: subredditName,
      createdAt: new Date(post.created_utc * 1000),
      engagement: {
        upvotes: post.score,
        upvoteRatio: post.upvote_ratio,
        comments: post.num_comments,
        awards: (post as any).total_awards_received || 0,
      },
      tickers,
      postType: determinePostType(post),
      isNSFW: post.over_18,
    };
  }

  /**
   * Get top memes by ticker
   */
  async getMemesByTicker(ticker: string): Promise<MemePost[]> {
    const allMemes = await this.fetchMemes();
    return allMemes.filter(meme => 
      meme.tickers.includes(ticker.toUpperCase())
    );
  }

  /**
   * Get trending tickers from memes
   */
  async getTrendingTickers(): Promise<Map<string, number>> {
    const allMemes = await this.fetchMemes();
    const tickerCounts = new Map<string, number>();

    for (const meme of allMemes) {
      for (const ticker of meme.tickers) {
        tickerCounts.set(ticker, (tickerCounts.get(ticker) || 0) + 1);
      }
    }

    // Sort by count
    const sortedTickers = new Map(
      [...tickerCounts.entries()].sort((a, b) => b[1] - a[1])
    );

    return sortedTickers;
  }
}
