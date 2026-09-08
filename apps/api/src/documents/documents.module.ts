import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createS3StorageProvider, type S3StorageConfig } from '@doclens/storage';

import { DocumentsController } from './controllers/documents.controller';
import { DocumentUploadService } from './services/document-upload.service';
import { STORAGE_PROVIDER } from './storage-provider.token';

@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentUploadService,
    {
      provide: STORAGE_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createS3StorageProvider(configService.getOrThrow<S3StorageConfig>('storage')),
    },
  ],
})
export class DocumentsModule {}
