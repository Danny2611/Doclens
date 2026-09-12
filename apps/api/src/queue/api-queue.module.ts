import { Module } from '@nestjs/common';
import { apiQueueProvider } from './api-queue.provider';
import { ApiQueueLifecycleService } from './api-queue-lifecycle.service';
@Module({ providers: [apiQueueProvider, ApiQueueLifecycleService], exports: [apiQueueProvider] }) export class ApiQueueModule {}
