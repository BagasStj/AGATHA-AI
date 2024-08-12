import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from '@upstash/redis'

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

try {
  redis = new Redis({
    url: process.env.KV_REST_API_URL || '',
    token: process.env.KV_REST_API_TOKEN || '',
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(50, "1 d"), // 50 requests per day
  });
} catch (error) {
  console.error('Failed to initialize Redis or Ratelimit:', error);
}

export async function checkRateLimit(userId: string) {
  if (!ratelimit) {
    console.error('Ratelimit is not initialized');
    return { success: false, limit: 0, reset: 0, remaining: 0 };
  }

  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(`chat_ratelimit_${userId}`);
    return { success, limit, reset, remaining };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return { success: false, limit: 0, reset: 0, remaining: 0 };
  }
}

export async function logRateLimitedRequest(userId: string, username: string) {
  if (!redis) {
    console.error('Redis is not initialized');
    return;
  }

  try {
    const key = `rate_limited_${username}`;
    const now = Date.now();
    await redis.set(key, now, { ex: 86400 }); // Expire after 24 hours
  } catch (error) {
    console.error('Error logging rate limited request:', error);
  }
}