import { Redis } from "ioredis";

// Use environment variable or default to local Redis
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(redisUrl);

// Test Redis connection on startup
redis
  .ping()
  .then((result) => {
    console.log(`[Redis] Connected successfully: ${result}`);
  })
  .catch((err) => {
    console.error("[Redis] Connection error:", err);
    process.exit(1);
  });

const connectionOpts = {
  host: redis.options.host,
  port: redis.options.port,
};

export { connectionOpts, redis };
