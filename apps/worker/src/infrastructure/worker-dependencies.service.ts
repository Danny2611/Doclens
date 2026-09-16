import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@doclens/database';

import { withStartupTimeout } from './connection-timeout';
import { WORKER_REDIS, WorkerRedisClient } from './redis.provider';

@Injectable()
export class WorkerDependenciesService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly startupTimeoutMs: number;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(WORKER_REDIS) private readonly redis: WorkerRedisClient,
    configService: ConfigService,
  ) {
    this.startupTimeoutMs = configService.getOrThrow<number>('worker.startupTimeoutMs');
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.connectPostgreSQL();
      await this.connectRedis();
    } catch (error) {
      await this.closeConnections();
      throw error;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.closeConnections();
  }

  private async connectPostgreSQL(): Promise<void> {
    try {
      await withStartupTimeout(
        async () => {
          await this.prisma.$connect();
          await this.prisma.$queryRaw`SELECT 1`;
        },
        this.startupTimeoutMs,
        'PostgreSQL',
      );
    } catch {
      throw new Error('Worker startup failed: PostgreSQL is unavailable.');
    }
  }

  private async connectRedis(): Promise<void> {
    try {
      await withStartupTimeout(
        async () => {
          await this.redis.connect();
          await this.redis.ping();
        },
        this.startupTimeoutMs,
        'Redis',
      );
    } catch {
      throw new Error('Worker startup failed: Redis is unavailable.');
    }
  }

  private async closeConnections(): Promise<void> {
    await Promise.allSettled([this.redis.quit(), this.prisma.$disconnect()]);
    this.redis.disconnect();
  }
}
