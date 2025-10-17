import Snoowrap from 'snoowrap';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Quick Authentication Test\n');

// Check if credentials are loaded
console.log('Checking .env file...');
console.log('Client ID:', process.env.REDDIT_CLIENT_ID ? '✅ Loaded' : '❌ Missing');
console.log('Client Secret:', process.env.REDDIT_CLIENT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('Username:', process.env.REDDIT_USERNAME || '❌ Missing');
console.log('Password:', process.env.REDDIT_PASSWORD ? '✅ Loaded' : '❌ Missing');

if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET || 
    !process.env.REDDIT_USERNAME || !process.env.REDDIT_PASSWORD) {
  console.error('\n❌ Missing credentials in .env file!');
  console.error('Make sure you copied .env.example to .env and filled in your credentials.');
  process.exit(1);
}

console.log('\n🔐 Testing Reddit API authentication...\n');

try {
  const reddit = new Snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT || 'reddit-meme-scraper:v1.0.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });

  reddit.getMe()
    .then(me => {
      console.log('✅ SUCCESS! Authenticated as:', me.name);
      console.log('📊 Account karma:', me.link_karma + me.comment_karma);
      console.log('\n🎉 Everything is working! Run npm start to scrape memes.\n');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Authentication failed!\n');
      console.error('Status:', err.statusCode);
      console.error('Error:', err.message);
      
      if (err.statusCode === 401) {
        console.error('\n💡 Troubleshooting:');
        console.error('  • Double-check your username and password');
        console.error('  • Make sure 2FA is disabled on your Reddit account');
        console.error('  • Verify the Client ID and Secret are correct');
        console.error('  • Try recreating the Reddit app at https://www.reddit.com/prefs/apps');
      } else if (err.statusCode === 429) {
        console.error('\n💡 You are being rate limited by Reddit.');
        console.error('  • Wait 5-10 minutes and try again');
        console.error('  • Reddit limits requests to 60 per minute');
      }
      
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Error creating Reddit client:', error.message);
  process.exit(1);
}

// Timeout after 30 seconds
setTimeout(() => {
  console.error('\n⏱️  Request timed out after 30 seconds');
  console.error('Check your internet connection');
  process.exit(1);
}, 30000);
