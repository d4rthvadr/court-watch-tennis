import { Redis } from 'ioredis';

// Use environment variable or default to local Redis
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl);
