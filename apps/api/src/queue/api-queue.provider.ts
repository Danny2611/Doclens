import { ConfigService } from '@nestjs/config';
import type { Provider } from '@nestjs/common';
import { Queue } from 'bullmq';
import { DOCUMENT_PROCESSING_QUEUE_NAME, parseBullMqRedisConnection } from '@doclens/queue';

export const API_DOCUMENT_PROCESSING_QUEUE = Symbol('API_DOCUMENT_PROCESSING_QUEUE');
export const apiQueueProvider: Provider = { provide: API_DOCUMENT_PROCESSING_QUEUE, inject: [ConfigService], useFactory: (config: ConfigService) => new Queue(DOCUMENT_PROCESSING_QUEUE_NAME, { connection: parseBullMqRedisConnection(config.getOrThrow<string>('REDIS_URL')) }) };
