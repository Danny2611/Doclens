import { Module } from '@nestjs/common';

import { WorkerConfigModule } from './config/config.module';
import { WorkerInfrastructureModule } from './infrastructure/worker-infrastructure.module';
import { DocumentProcessingModule } from './document-processing/document-processing.module';

@Module({
  imports: [WorkerConfigModule, WorkerInfrastructureModule, DocumentProcessingModule],
})
export class WorkerModule {}
