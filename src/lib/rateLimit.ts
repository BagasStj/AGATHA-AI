import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from '@upstash/redis'
import { kv } from "@vercel/kv";

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

console.log('KV_REST_API_URL:', KV_REST_API_URL);
console.log('KV_REST_API_TOKEN:', KV_REST_API_TOKEN ? 'Set' : 'Not set');

if (typeof window === 'undefined') {
  if (KV_REST_API_URL && KV_REST_API_TOKEN) {
    try {
      redis = new Redis({
        url: KV_REST_API_URL,
        token: KV_REST_API_TOKEN,
      });

      ratelimit = new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(50, "1 d"),
        analytics: true,
      });

      console.log('Redis and Ratelimit initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Redis or Ratelimit:', error);
    }
  } else {
    console.warn('KV_REST_API_URL or KV_REST_API_TOKEN is not set. Rate limiting will be disabled.');
  }
} else {
  console.log('Running in browser environment, skipping Redis initialization');
}

export async function checkRateLimit(userId: string, feature: string) {
  const limit = Number(process.env[`${feature.toUpperCase()}_RATE_LIMIT`]) || 50;
  console.log(`Rate limit for ${feature}:`, limit);

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(limit, "1 d"),
      analytics: true,
    });
  }

  try {
    const { success, limit: rateLimit, reset, remaining } = await ratelimit.limit(`${feature}_ratelimit_${userId}`);
    return { success, limit: rateLimit, reset, remaining };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return { success: false, limit: 0, reset: 0, remaining: 0 };
  }
}

export async function logRateLimitedRequest(userId: string, username: string, feature: string) {
  if (!redis) {
    console.error('Redis is not initialized');
    return;
  }

  try {
    const key = `rate_limited_${username}_${feature}`;
    const now = Date.now();
    await redis.set(key, now, { ex: 86400 }); // Expire after 24 hours
  } catch (error) {
    console.error('Error logging rate limited request:', error);
  }
}