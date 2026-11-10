import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/utils/env";

const globalForRateLimiter = global as unknown as {
  ratelimiter?: Ratelimit;
  redis: Redis;
};

const redis = globalForRateLimiter.redis || Redis.fromEnv();

const ratelimiter =
  globalForRateLimiter.ratelimiter ||
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "10 s"),
    prefix: "@upstash/ratelimit",
    analytics: true,
    timeout: 2000,
  });

if (env.NODE_ENV !== "production") {
  globalForRateLimiter.ratelimiter = ratelimiter;
  globalForRateLimiter.redis = redis;
}

export default ratelimiter;
