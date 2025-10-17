import dotenv from 'dotenv';
import { RedditMemeScraper } from './scraper.js';
import { RedditCredentials, ScraperConfig } from './types.js';
import { writeFileSync } from 'fs';

// Load environment variables
dotenv.config();

async function main() {
  // Load credentials from environment
  const credentials: RedditCredentials = {
    clientId: process.env.REDDIT_CLIENT_ID || '',
    clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    userAgent: process.env.REDDIT_USER_AGENT || 'reddit-meme-scraper:v1.0.0',
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  };

  // Validate credentials
  if (!credentials.clientId || !credentials.clientSecret) {
    console.error('❌ Error: Reddit API credentials not found!');
    console.error('Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in your .env file');
    console.error('See .env.example for details on how to get these credentials');
    process.exit(1);
  }

  // For script apps, username and password are required
  if (!credentials.username || !credentials.password) {
    console.error('❌ Error: Reddit username and password are required for script apps!');
    console.error('Please set REDDIT_USERNAME and REDDIT_PASSWORD in your .env file');
    console.error('Script apps require your Reddit account credentials to authenticate');
    process.exit(1);
  }

  // Configure scraper
  const config: Partial<ScraperConfig> = {
    subreddits: ['wallstreetbets', 'stocks', 'investing', 'cryptocurrency'],
    minUpvotes: 100,
    minComments: 0,
    timeframe: 'day',
    limit: 50,
    includeNSFW: false,
  };

  console.log('🚀 Reddit Meme Scraper Starting...');
  console.log('📋 Configuration:');
  console.log(`   Subreddits: ${config.subreddits?.join(', ')}`);
  console.log(`   Min Upvotes: ${config.minUpvotes}`);
  console.log(`   Timeframe: ${config.timeframe}`);
  console.log(`   Limit per subreddit: ${config.limit}`);

  // Initialize scraper
  const scraper = new RedditMemeScraper(credentials, config);

  try {
    // Fetch memes
    console.log('\n📥 Fetching memes...');
    const memes = await scraper.fetchMemes();

    console.log(`\n✨ Total memes found: ${memes.length}`);

    if (memes.length === 0) {
      console.log('No memes found matching the criteria.');
      return;
    }

    // Display top memes
    console.log('\n🔥 Top 10 Memes by Engagement:\n');
    memes.slice(0, 10).forEach((meme, index) => {
      console.log(`${index + 1}. ${meme.title}`);
      console.log(`   📊 ${meme.engagement.upvotes} upvotes | ${meme.engagement.comments} comments | ${meme.engagement.awards} awards`);
      console.log(`   🏷️  r/${meme.subreddit} | ${meme.postType}`);
      if (meme.tickers.length > 0) {
        console.log(`   💹 Tickers: ${meme.tickers.join(', ')}`);
      }
      console.log(`   🔗 ${meme.url}`);
      if (meme.mediaUrl) {
        console.log(`   🖼️  ${meme.mediaUrl}`);
      }
      console.log('');
    });

    // Get trending tickers
    console.log('\n📈 Trending Tickers:\n');
    const trendingTickers = await scraper.getTrendingTickers();
    
    if (trendingTickers.size === 0) {
      console.log('No tickers mentioned in recent memes.');
    } else {
      const topTickers = Array.from(trendingTickers.entries()).slice(0, 10);
      topTickers.forEach(([ticker, count], index) => {
        console.log(`${index + 1}. $${ticker} - mentioned ${count} times`);
      });
    }

    // Save results to JSON
    const outputFile = 'memes-output.json';
    const output = {
      scrapedAt: new Date().toISOString(),
      totalMemes: memes.length,
      memes: memes,
      trendingTickers: Object.fromEntries(trendingTickers),
    };

    writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`\n💾 Results saved to ${outputFile}`);

  } catch (error) {
    console.error('\n❌ Error during scraping:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the scraper
main().catch(console.error);
