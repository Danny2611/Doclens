import { Module } from '@nestjs/common';
import { DocumentJobProcessor } from './document-job.processor';
import { DocumentProcessingLifecycleService } from './document-processing-lifecycle.service';
import { WorkerInfrastructureModule } from '../infrastructure/worker-infrastructure.module';
@Module({
  imports: [WorkerInfrastructureModule],
  providers: [DocumentJobProcessor, DocumentProcessingLifecycleService],
})
export class DocumentProcessingModule {}
