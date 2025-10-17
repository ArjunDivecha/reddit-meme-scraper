# Implementation Notes

## Reddit API Rate Limit Headers

Reddit provides real-time rate limit information in response headers. Here's how to monitor them:

### Available Headers

```
X-Ratelimit-Used: 15.0
X-Ratelimit-Remaining: 85.0  
X-Ratelimit-Reset: 1729296000
```

### What They Mean

- **X-Ratelimit-Used**: Number of requests used in current 10-minute window
- **X-Ratelimit-Remaining**: Requests remaining before hitting limit (100 total)
- **X-Ratelimit-Reset**: Unix timestamp when limit resets

### Future Enhancement: Rate Limit Monitoring

To add automatic rate limit monitoring to the scraper:

```typescript
// In scraper.ts, after making a request
const headers = response.headers;
const used = parseFloat(headers['x-ratelimit-used']);
const remaining = parseFloat(headers['x-ratelimit-remaining']);
const reset = parseInt(headers['x-ratelimit-reset']);

console.log(`Rate limit: ${used} used, ${remaining} remaining`);

if (remaining < 20) {
  console.warn('⚠️ Approaching rate limit! Slowing down...');
  // Increase delay automatically
}
```

### Why We Don't Implement This Yet

1. **Snoowrap abstraction**: The library handles requests internally
2. **Conservative defaults**: Our settings are well under limits
3. **Simplicity**: Adds complexity for minimal benefit with current usage

If you need high-volume scraping, consider:
- Implementing custom rate limit tracking
- Using multiple OAuth apps (separate client IDs)
- Upgrading to Reddit's paid API tier

---

## Current Implementation Strategy

### Request Pattern
```
1. Authenticate (1 request) 
2. For each subreddit:
   - Fetch posts (1 request per subreddit)
   - Wait 5 seconds
3. Done
```

### Why 5-Second Delay?

- **Official limit**: 100 req/min = 1 request every 0.6 seconds (theoretical)
- **Conservative approach**: 5 seconds = 12 req/min (safe)
- **Room for bursting**: Allows occasional faster requests without triggering abuse detection
- **IP reputation**: Slower = better reputation = less likely to be flagged

### Request Budget Examples

**Current defaults (1 subreddit, 10 posts):**
```
Authentication: 1 request
Subreddit fetch: 1 request
Total: 2 requests
Time: ~5 seconds
% of limit: 2% (very safe)
```

**Moderate (2 subreddits, 20 posts each):**
```
Authentication: 1 request
Subreddit fetches: 2 requests  
Total: 3 requests
Time: ~10 seconds
% of limit: 3% (safe)
```

**Aggressive (4 subreddits, 50 posts each):**
```
Authentication: 1 request
Subreddit fetches: 4 requests
Total: 5 requests  
Time: ~20 seconds
% of limit: 5% (safe but may trigger secondary protections)
```

---

## Burst vs Sustained Rate

Reddit's limit is **averaged over 10 minutes**. This means:

### Allowed Bursting
```
Minute 1: 20 requests (fast scraping)
Minutes 2-10: 80 requests spread out
Total: 100 requests in 10 minutes ✅
```

### Prohibited Pattern
```
Minutes 1-10: Consistently 10-15 requests/minute
Total: 100-150 requests in 10 minutes ❌
Triggers: Sustained high-rate behavior detection
```

### Why Our Approach Works
```
Every 10 minutes: 2-5 requests
Well under limit, no burst detection
Sustainable indefinitely
```

---

## Error Codes Reference

### 401 Unauthorized
- **Cause**: Invalid credentials or expired token
- **Fix**: Check .env file, regenerate Reddit app credentials

### 403 Forbidden  
- **Cause**: Account banned, app disabled, or endpoint restricted
- **Fix**: Check Reddit account status, verify app type is "script"

### 429 Too Many Requests
- **Cause**: Exceeded rate limit
- **Headers**: Check X-Ratelimit-* for details
- **Fix**: Wait for X-Ratelimit-Reset time, then reduce request frequency

### Timeout/Hang
- **Cause**: Reddit silently dropping requests (soft ban)
- **Detection**: No response after 30+ seconds
- **Fix**: Wait 30 minutes, use more conservative settings

---

## Testing Checklist

Before increasing limits, verify:

- [ ] Quick test passes (`node quick-test.js`)
- [ ] Single subreddit works with current delay
- [ ] Can fetch 5 posts successfully
- [ ] Can fetch 10 posts successfully
- [ ] Can fetch 20 posts successfully
- [ ] Second subreddit works after 10-minute wait
- [ ] No 429/403 errors
- [ ] No timeouts or hangs

Only then consider:
- Increasing post limit to 25
- Adding third subreddit
- Reducing delay to 3 seconds

---

## Deployment Considerations

### Development vs Production

**Development (your local machine):**
- Unknown IP reputation
- May be flagged as new/suspicious
- Use ultra-conservative settings initially
- Test with 5-10 posts only

**Production (cloud server):**
- Consistent IP address
- Build reputation over time  
- Can gradually increase to moderate settings
- Monitor for blocks and adjust

### Scheduled Scraping

If running on a schedule (cron, Task Scheduler):

```bash
# Good: 3 times per day, 10-minute runtime
0 8 * * * /path/to/scraper  # 8 AM
0 14 * * * /path/to/scraper # 2 PM  
0 20 * * * /path/to/scraper # 8 PM

# Bad: Every 5 minutes
*/5 * * * * /path/to/scraper  # Will get banned!
```

### Monitoring

Log these metrics:
- Requests per run
- Success/failure rate
- Time to complete
- Any error messages

If success rate drops below 90%, reduce limits immediately.

---

## Alternative Approaches

### 1. Reddit Data API (Paid)
- $0.24 per 1,000 calls
- Higher limits
- Commercial support
- Best for: Production apps, high volume

### 2. Reddit Pushshift API
- Historical data
- Different rate limits
- No longer officially maintained
- Best for: Historical analysis

### 3. Web Scraping
- No API limits
- Against Reddit TOS
- Risk of IP ban
- Not recommended

### 4. Multiple OAuth Apps
- Create 2-3 separate apps
- Rotate between them
- 100 req/min per app
- Best for: Medium-high volume needs

---

## Performance Optimization

Current bottlenecks:

1. **5-second delay** - intentional, don't reduce
2. **Single-threaded** - OK for current usage
3. **Sequential subreddit processing** - could parallelize but not recommended

### What NOT to optimize

❌ Don't reduce delay below 3 seconds
❌ Don't parallelize subreddit fetching
❌ Don't implement connection pooling
❌ Don't cache authentication tokens aggressively

Why? Reddit's anti-abuse systems detect these patterns.

### What you CAN optimize

✅ Filter posts client-side (reduce data transfer)
✅ Cache results locally (reduce repeat requests)
✅ Process data asynchronously after fetching
✅ Use webhooks for real-time updates (separate service)

---

## Summary

**Key Principles:**
1. Official limit (100 req/min) is not the practical limit
2. Conservative = reliable
3. Burst detection is real
4. IP reputation matters
5. Account health affects access

**Current implementation:**
- 2-5 requests per 10-minute run
- 5-second delays
- Single subreddit default
- Well under all limits
- Should work reliably for years

**Before scaling up:**
- Test incrementally
- Monitor for blocks
- Wait between tests  
- Document what works

This approach prioritizes **reliability over speed**, which is appropriate for a meme scraper that doesn't need real-time data.
