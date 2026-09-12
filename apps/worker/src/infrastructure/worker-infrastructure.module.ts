import { Module } from '@nestjs/common';
import { DatabaseModule } from '@doclens/database';

import { workerRedisProvider } from './redis.provider';
import { WorkerDependenciesService } from './worker-dependencies.service';
import { BullMqWorkerFactory } from './bullmq-worker.factory';

@Module({
  imports: [DatabaseModule],
  providers: [workerRedisProvider, WorkerDependenciesService, BullMqWorkerFactory],
})
export class WorkerInfrastructureModule {}
