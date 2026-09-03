import { Module } from '@nestjs/common';

import { WorkerConfigModule } from './config/config.module';
import { WorkerInfrastructureModule } from './infrastructure/worker-infrastructure.module';

@Module({
  imports: [WorkerConfigModule, WorkerInfrastructureModule],
})
export class WorkerModule {}
