import { Module } from '@nestjs/common';

import { AppConfigModule } from './config/config.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [AppConfigModule, HealthModule, DocumentsModule],
})
export class AppModule {}
