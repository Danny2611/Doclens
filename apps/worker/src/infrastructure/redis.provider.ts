import { ConfigService } from '@nestjs/config';
import type { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const WORKER_REDIS = Symbol('WORKER_REDIS');

export type WorkerRedisClient = Pick<Redis, 'connect' | 'ping' | 'quit' | 'disconnect'>;

export const workerRedisProvider: Provider = {
  provide: WORKER_REDIS,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): WorkerRedisClient => {
    const timeoutMs = configService.getOrThrow<number>('worker.startupTimeoutMs');
    const redis = new Redis(configService.getOrThrow<string>('REDIS_URL'), {
      lazyConnect: true,
      connectTimeout: timeoutMs,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
    });

    redis.on('error', () => undefined);
    return redis;
  },
};
