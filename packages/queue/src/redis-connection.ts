import type { ConnectionOptions } from 'bullmq';

export function parseBullMqRedisConnection(redisUrl: string): ConnectionOptions {
  const url = new URL(redisUrl);
  if (url.protocol !== 'redis:' && url.protocol !== 'rediss:')
    throw new Error('REDIS_URL must use redis: or rediss:.');
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}
