import { Module } from '@nestjs/common';
import { DatabaseModule } from '@doclens/database';

import { workerRedisProvider } from './redis.provider';
import { WorkerDependenciesService } from './worker-dependencies.service';

@Module({
  imports: [DatabaseModule],
  providers: [workerRedisProvider, WorkerDependenciesService],
})
export class WorkerInfrastructureModule {}
