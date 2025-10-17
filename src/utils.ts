/**
 * Extract stock tickers from text
 * Matches patterns like $TSLA, $SPY, etc.
 */
export function extractTickers(text: string): string[] {
  const tickerRegex = /\$([A-Z]{1,5})\b/g;
  const matches = text.matchAll(tickerRegex);
  const tickers = new Set<string>();
  
  for (const match of matches) {
    tickers.add(match[1]);
  }
  
  return Array.from(tickers);
}

/**
 * Determine if a post contains media (image, gif, video)
 */
export function determinePostType(post: any): 'image' | 'gif' | 'video' | 'gallery' | 'link' {
  // Check if it's a gallery
  if (post.is_gallery) {
    return 'gallery';
  }
  
  // Check post hint
  if (post.post_hint === 'image') {
    return 'image';
  }
  
  if (post.post_hint === 'hosted:video' || post.post_hint === 'rich:video') {
    return 'video';
  }
  
  // Check URL extension
  const url = post.url?.toLowerCase() || '';
  
  if (url.match(/\.(gif|gifv)$/)) {
    return 'gif';
  }
  
  if (url.match(/\.(jpg|jpeg|png|webp)$/)) {
    return 'image';
  }
  
  if (url.match(/\.(mp4|webm|mov)$/)) {
    return 'video';
  }
  
  // Check domain
  if (url.includes('i.redd.it') || url.includes('i.imgur.com')) {
    return 'image';
  }
  
  if (url.includes('v.redd.it')) {
    return 'video';
  }
  
  return 'link';
}

/**
 * Get media URL from a Reddit post
 */
export function getMediaUrl(post: any): string | null {
  // Direct image/video URL
  if (post.url && (post.post_hint === 'image' || post.is_video)) {
    return post.url;
  }
  
  // Reddit video
  if (post.media?.reddit_video?.fallback_url) {
    return post.media.reddit_video.fallback_url;
  }
  
  // Preview image
  if (post.preview?.images?.[0]?.source?.url) {
    return post.preview.images[0].source.url.replace(/&amp;/g, '&');
  }
  
  // Gallery - get first image
  if (post.is_gallery && post.media_metadata) {
    const firstMediaId = Object.keys(post.media_metadata)[0];
    const firstMedia = post.media_metadata[firstMediaId];
    if (firstMedia?.s?.u) {
      return firstMedia.s.u.replace(/&amp;/g, '&');
    }
  }
  
  return null;
}

/**
 * Check if post is a meme (has visual content)
 */
export function isMemePost(post: any): boolean {
  const postType = determinePostType(post);
  return ['image', 'gif', 'video', 'gallery'].includes(postType);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Calculate post age in hours
 */
export function getPostAgeHours(createdUtc: number): number {
  const now = Date.now() / 1000;
  return (now - createdUtc) / 3600;
}
