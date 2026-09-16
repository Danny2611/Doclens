import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';
import { DOCUMENT_PROCESSING_QUEUE_NAME, parseBullMqRedisConnection } from '@doclens/queue';
import type { Job } from 'bullmq';

@Injectable()
export class BullMqWorkerFactory {
  constructor(private readonly config: ConfigService) {}
  createForSmokeTest(processor: () => Promise<void>): Worker {
    return new Worker(DOCUMENT_PROCESSING_QUEUE_NAME, processor, {
      connection: parseBullMqRedisConnection(this.config.getOrThrow<string>('REDIS_URL')),
    });
  }
  createDocumentWorker(processor: (job: Job<unknown>) => Promise<void>): Worker {
    return new Worker(DOCUMENT_PROCESSING_QUEUE_NAME, processor, {
      connection: parseBullMqRedisConnection(this.config.getOrThrow<string>('REDIS_URL')),
      concurrency: 1,
    });
  }
}
