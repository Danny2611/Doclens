import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createS3StorageProvider, type S3StorageConfig } from '@doclens/storage';

import { DocumentsController } from './controllers/documents.controller';
import { DocumentsService } from './services/documents.service';
import { DocumentUploadService } from './services/document-upload.service';
import { DocumentProcessingRequestService } from './services/document-processing-request.service';
import { ApiQueueModule } from '../queue/api-queue.module';
import { STORAGE_PROVIDER } from './storage-provider.token';

@Module({
  imports: [ApiQueueModule],
  controllers: [DocumentsController],
  providers: [
    DocumentUploadService,
    DocumentsService,
    DocumentProcessingRequestService,
    {
      provide: STORAGE_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createS3StorageProvider(configService.getOrThrow<S3StorageConfig>('storage')),
    },
  ],
})
export class DocumentsModule {}
