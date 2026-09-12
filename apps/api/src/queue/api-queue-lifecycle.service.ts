import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { API_DOCUMENT_PROCESSING_QUEUE } from './api-queue.provider';
@Injectable()
export class ApiQueueLifecycleService implements OnApplicationShutdown { private closed = false; constructor(@Inject(API_DOCUMENT_PROCESSING_QUEUE) private readonly queue: Queue) {} async onApplicationShutdown(): Promise<void> { if (!this.closed) { this.closed = true; await this.queue.close(); } } }
