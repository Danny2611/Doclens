import { Module } from '@nestjs/common';
import { DatabaseModule } from '@doclens/database';

import { AppConfigModule } from './config/config.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthModule } from './health/health.module';
import { ApiQueueModule } from './queue/api-queue.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, HealthModule, DocumentsModule, ApiQueueModule],
})
export class AppModule {}
