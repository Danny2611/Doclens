import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@doclens/database';

import { WorkerRedisClient } from '../../src/infrastructure/redis.provider';
import { WorkerDependenciesService } from '../../src/infrastructure/worker-dependencies.service';

describe('WorkerDependenciesService', () => {
  const createService = (options?: {
    postgresError?: Error;
    redisError?: Error;
  }): {
    service: WorkerDependenciesService;
    prisma: jest.Mocked<Pick<PrismaService, '$connect' | '$disconnect' | '$queryRaw'>>;
    redis: jest.Mocked<WorkerRedisClient>;
  } => {
    const prisma = {
      $connect: jest.fn().mockRejectedValue(options?.postgresError),
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Pick<PrismaService, '$connect' | '$disconnect' | '$queryRaw'>>;

    if (!options?.postgresError) {
      prisma.$connect.mockResolvedValue(undefined);
    }

    const redis = {
      connect: jest.fn().mockRejectedValue(options?.redisError),
      ping: jest.fn().mockResolvedValue('PONG'),
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
    } as unknown as jest.Mocked<WorkerRedisClient>;

    if (!options?.redisError) {
      redis.connect.mockResolvedValue(undefined);
    }

    const configService = {
      getOrThrow: jest.fn().mockReturnValue(50),
    } as unknown as ConfigService;

    return {
      service: new WorkerDependenciesService(
        prisma as unknown as PrismaService,
        redis,
        configService,
      ),
      prisma,
      redis,
    };
  };

  it('connects PostgreSQL and Redis during startup', async () => {
    const { service, prisma, redis } = createService();

    await expect(service.onApplicationBootstrap()).resolves.toBeUndefined();
    expect(prisma.$connect).toHaveBeenCalledTimes(1);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(redis.connect).toHaveBeenCalledTimes(1);
    expect(redis.ping).toHaveBeenCalledTimes(1);
  });

  it('fails clearly and cleans up when PostgreSQL is unavailable', async () => {
    const { service, prisma, redis } = createService({ postgresError: new Error('connection refused') });

    await expect(service.onApplicationBootstrap()).rejects.toThrow(
      'Worker startup failed: PostgreSQL is unavailable.',
    );
    expect(redis.connect).not.toHaveBeenCalled();
    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
    expect(redis.disconnect).toHaveBeenCalledTimes(1);
  });

  it('fails clearly and cleans up when Redis is unavailable', async () => {
    const { service, prisma, redis } = createService({ redisError: new Error('connection refused') });

    await expect(service.onApplicationBootstrap()).rejects.toThrow(
      'Worker startup failed: Redis is unavailable.',
    );
    expect(prisma.$connect).toHaveBeenCalledTimes(1);
    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
    expect(redis.disconnect).toHaveBeenCalledTimes(1);
  });

  it('closes Redis and Prisma during graceful shutdown', async () => {
    const { service, prisma, redis } = createService();

    await service.onApplicationShutdown();
    expect(redis.quit).toHaveBeenCalledTimes(1);
    expect(redis.disconnect).toHaveBeenCalledTimes(1);
    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
  });
});
