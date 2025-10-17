# Reddit API Rate Limiting Guide

## 🚨 Important: Reddit is Strict About Rate Limits

Reddit actively monitors API usage and will block requests that are too aggressive. This guide helps you use the scraper without getting blocked.

---

## ⚙️ Default Configuration (Safe)

The scraper ships with **conservative defaults** that work reliably:

```typescript
{
  subreddits: ['wallstreetbets'],  // ONE subreddit
  minUpvotes: 10,                   // Lower threshold
  limit: 10,                        // 10 posts max
  requestDelay: 5000                // 5-second delay
}
```

**This configuration:**
- ✅ Fetches ~10 posts in ~50 seconds
- ✅ Respects Reddit's rate limits
- ✅ Works consistently

---

## 📈 Scaling Up Safely

Want to scrape more? Scale up **gradually**:

### Step 1: Increase Posts per Subreddit
```typescript
limit: 20  // Up from 10
```
**Test it first!** If it works, continue.

### Step 2: Add More Subreddits
```typescript
subreddits: ['wallstreetbets', 'stocks']  // Add one at a time
```
**Wait 10+ minutes between test runs.**

### Step 3: Adjust Delay (Carefully)
```typescript
requestDelay: 3000  // Down from 5000ms
```
**Only if Step 1 & 2 work reliably.**

---

## 🛑 What NOT to Do

❌ **Don't use these aggressive settings:**
```typescript
{
  subreddits: ['wallstreetbets', 'stocks', 'investing', 'cryptocurrency'],
  limit: 50,
  requestDelay: 1000
}
```
**This WILL get you blocked!** Reddit will detect:
- Too many subreddits at once
- Too many posts per subreddit
- Requests coming too fast

---

## ⏱️ Reddit's Rate Limits

### Authenticated Requests (what we use)
- **60 requests per minute** (official limit)
- **In practice:** ~30-40 requests/min is safer
- **Burst protection:** Slow down after 10+ requests

### What Counts as a Request?
- Each subreddit fetch = 1 request
- Each post fetch = 0 requests (included in subreddit fetch)
- Authentication = 1 request (happens once)

### Example Calculation
```
Subreddits: 4
Posts per subreddit: 50
Delay: 1 second

Total requests: 4
Time: ~4 seconds
```
**Seems safe, but Reddit also monitors:**
- Request patterns (bursts trigger blocks)
- IP address reputation
- Account age/karma
- Time of day

---

## 🔍 Signs You're Being Rate Limited

### Error Messages
```
429 - Too Many Requests
403 - Forbidden
```

### Symptoms
- Scraper hangs indefinitely
- "Unauthorized" errors (even with valid credentials)
- Timeouts after working previously

### Solution
1. **Stop immediately**
2. **Wait 15-30 minutes**
3. **Reduce limits** (cut in half)
4. **Increase delay** (double it)
5. **Try again**

---

## 🎯 Recommended Strategies

### Strategy 1: Multiple Small Runs
Instead of:
```typescript
{ subreddits: ['a', 'b', 'c', 'd'], limit: 50 }
```

Do this:
```typescript
// Run 1
{ subreddits: ['wallstreetbets'], limit: 20 }
// Wait 10 minutes
// Run 2
{ subreddits: ['stocks'], limit: 20 }
// Wait 10 minutes
// Run 3
{ subreddits: ['cryptocurrency'], limit: 20 }
```

### Strategy 2: Schedule Runs
Don't scrape continuously. Instead:
- **Morning run**: 7-9 AM
- **Afternoon run**: 2-4 PM
- **Evening run**: 7-9 PM

Use cron or Task Scheduler.

### Strategy 3: Focus on Quality Over Quantity
```typescript
{
  subreddits: ['wallstreetbets'],
  minUpvotes: 100,  // Higher threshold
  limit: 20         // Fewer posts
}
```
Get 20 high-quality memes instead of 200 low-quality ones.

---

## 🧪 Testing New Configurations

Always test before deploying:

### Step 1: Run Quick Test
```bash
node quick-test.js
```
Verifies authentication works.

### Step 2: Run Minimal Test
```typescript
{
  subreddits: ['wallstreetbets'],
  limit: 5,
  requestDelay: 10000  // 10 seconds
}
```

### Step 3: Monitor Output
Look for:
- ✅ "Found X memes" - Success!
- ❌ Hangs for 30+ seconds - Rate limited
- ❌ 429/403 errors - Blocked

### Step 4: Adjust and Retry
- If blocked: Increase delay, decrease limit
- If successful: Gradually increase load
- Always wait 15+ minutes between tests

---

## 🔐 Account Health

### Keep Your Account in Good Standing
- **Don't scrape 24/7**
- **Use reasonable delays**
- **Don't scrape from multiple IPs simultaneously**
- **Don't share credentials across multiple apps**

### Account Reputation Matters
- New accounts: More likely to be blocked
- Low karma accounts: More scrutiny
- Accounts with violations: Instant blocks

**Your account (arjundivecha):**
- Karma: 272
- Status: Good standing ✅

---

## 📊 Performance vs. Safety

| Config | Posts | Time | Safety | Use Case |
|--------|-------|------|--------|----------|
| Ultra Safe | 5 | 25s | 🟢🟢🟢 | Testing |
| Safe (Default) | 10 | 50s | 🟢🟢 | Daily use |
| Moderate | 20 | 1m 40s | 🟡 | Occasional |
| Aggressive | 50 | 4m 10s | 🔴 | Risky |
| Very Aggressive | 100+ | 8m+ | ⛔ | Will fail |

---

## 🛠️ Troubleshooting

### Problem: Scraper times out
**Cause:** Reddit is silently blocking requests  
**Fix:** Reduce limits by 50%, double delay

### Problem: Works in workspace, fails locally
**Cause:** Different IP reputation  
**Fix:** Use even more conservative settings locally

### Problem: Works once, then fails
**Cause:** Hit daily limit or triggered monitoring  
**Fix:** Wait until tomorrow, use lower limits

### Problem: Quick test works, scraper doesn't
**Cause:** Single request works, multiple requests blocked  
**Fix:** This is exactly your issue - use conservative defaults

---

## ✅ Final Recommendations

**For Daily Use:**
```typescript
{
  subreddits: ['wallstreetbets'],
  minUpvotes: 10,
  limit: 10,
  requestDelay: 5000
}
```

**For Occasional Deep Dives:**
```typescript
{
  subreddits: ['wallstreetbets'],
  minUpvotes: 50,
  limit: 25,
  requestDelay: 8000
}
```

**Run 2-3 times per day maximum.**

---

**Remember:** It's better to get 10 good memes reliably than to get blocked trying for 100! 🎯
