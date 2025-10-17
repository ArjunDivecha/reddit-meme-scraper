# Reddit Meme Scraper 🚀

A TypeScript-based Reddit scraper that fetches recent memes from r/wallstreetbets and other financial subreddits. Automatically extracts stock tickers, engagement metrics, and tracks trending stocks mentioned in memes.

## Features

✨ **Multi-Subreddit Support** - Scrape from multiple financial subreddits  
📊 **Engagement Metrics** - Track upvotes, comments, awards, and upvote ratios  
💹 **Ticker Extraction** - Automatically detect stock tickers (e.g., $TSLA, $SPY)  
🔥 **Trending Analysis** - Identify most mentioned tickers across memes  
🎨 **Media Detection** - Filter for images, GIFs, videos, and galleries  
⚡ **Rate Limit Friendly** - Built-in request delays to respect Reddit API limits  
📄 **JSON Export** - Save results to structured JSON format

## Prerequisites

- Node.js 18+ or Bun runtime
- Reddit API credentials (see Setup below)

## Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd reddit-meme-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Reddit API credentials (see below for how to get them)

## Getting Reddit API Credentials

1. Go to https://www.reddit.com/prefs/apps
2. Click **"Create App"** or **"Create Another App"**
3. Fill in the form:
   - **name**: Your app name (e.g., "My Meme Scraper")
   - **App type**: Choose **"script"**
   - **description**: Any description
   - **redirect uri**: `http://localhost` (required but not used)
4. Click **"Create app"**
5. Copy the credentials:
   - **Client ID**: The string under your app name (looks like: `abc123xyz456`)
   - **Client Secret**: The "secret" field

Add these to your `.env` file:
```env
REDDIT_CLIENT_ID=abc123xyz456
REDDIT_CLIENT_SECRET=your_secret_here
REDDIT_USER_AGENT=reddit-meme-scraper:v1.0.0 (by /u/yourusername)
```

## Usage

### Run the scraper:
```bash
npm start
```

### Configuration

Edit `src/index.ts` to customize scraping behavior:

```typescript
const config: Partial<ScraperConfig> = {
  subreddits: ['wallstreetbets', 'stocks', 'investing', 'cryptocurrency'],
  minUpvotes: 100,        // Minimum upvotes to include
  minComments: 0,         // Minimum comments to include
  timeframe: 'day',       // 'hour', 'day', 'week', 'month'
  limit: 50,              // Posts per subreddit
  includeNSFW: false,     // Include NSFW posts
};
```

### Output

The scraper will:
1. Print top memes to console with engagement metrics
2. Show trending tickers and mention counts
3. Save complete results to `memes-output.json`

Example console output:
```
🚀 Reddit Meme Scraper Starting...
📋 Configuration:
   Subreddits: wallstreetbets, stocks, investing, cryptocurrency
   Min Upvotes: 100
   Timeframe: day

📥 Fetching memes...

🔍 Scraping r/wallstreetbets...
✅ Found 23 memes from r/wallstreetbets

✨ Total memes found: 23

🔥 Top 10 Memes by Engagement:

1. When you buy the dip but it keeps dipping
   📊 5432 upvotes | 234 comments | 12 awards
   🏷️  r/wallstreetbets | image
   💹 Tickers: SPY, QQQ
   🔗 https://reddit.com/r/wallstreetbets/...
   🖼️  https://i.redd.it/...

📈 Trending Tickers:

1. $SPY - mentioned 15 times
2. $TSLA - mentioned 8 times
3. $NVDA - mentioned 6 times
```

## Project Structure

```
reddit-meme-scraper/
├── src/
│   ├── index.ts        # Main entry point
│   ├── scraper.ts      # Reddit scraper class
│   ├── types.ts        # TypeScript interfaces
│   └── utils.ts        # Helper functions (ticker extraction, media detection)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## API Reference

### `RedditMemeScraper`

**Constructor:**
```typescript
new RedditMemeScraper(credentials: RedditCredentials, config?: Partial<ScraperConfig>)
```

**Methods:**

- `fetchMemes()` - Fetch memes from all configured subreddits
- `getMemesByTicker(ticker: string)` - Get memes mentioning a specific ticker
- `getTrendingTickers()` - Get map of tickers and their mention counts

### Data Types

**MemePost:**
```typescript
{
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
```

## Development

### Type checking:
```bash
npm run type-check
```

### Linting:
```bash
npm run lint
```

### Build:
```bash
npm run build
```

## Rate Limits

The scraper is configured with a 1-second delay between requests to respect Reddit's API rate limits. For authenticated requests (with username/password), you get higher rate limits (60 requests per minute).

## Legal & Ethical Use

- Respect Reddit's [API Terms](https://www.reddit.com/wiki/api-terms)
- Do not use scraped content for commercial purposes without permission
- Rate limiting is built-in - do not circumvent it
- Consider fair use when republishing meme content

## Troubleshooting

**"Reddit API credentials not found"**  
→ Make sure `.env` file exists and contains valid credentials

**Rate limit errors**  
→ Increase `requestDelay` in `scraper.ts` or add Reddit username/password for authenticated requests

**No memes found**  
→ Lower `minUpvotes` threshold or change `timeframe` to 'week' or 'month'

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Disclaimer

This tool is for educational and research purposes. Always respect Reddit's Terms of Service and API guidelines. The authors are not responsible for misuse of this software.
