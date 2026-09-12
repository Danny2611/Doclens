import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Worker } from 'bullmq';
import { BullMqWorkerFactory } from '../infrastructure/bullmq-worker.factory';
import { DocumentJobProcessor } from './document-job.processor';

@Injectable()
export class DocumentProcessingLifecycleService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private worker?: Worker;
  constructor(
    private readonly factory: BullMqWorkerFactory,
    private readonly processor: DocumentJobProcessor,
  ) {}
  onApplicationBootstrap(): void {
    this.worker ??= this.factory.createDocumentWorker((job) => this.processor.process(job));
  }
  async onApplicationShutdown(): Promise<void> {
    const worker = this.worker;
    this.worker = undefined;
    if (worker) await worker.close();
  }
}
