import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { CreateUploadIntentRequest, CreateUploadIntentResponse } from '@doclens/contracts';
import { validateDocumentFileMetadata } from '@doclens/domain';
import { StorageErrorCode, type StorageProvider } from '@doclens/storage';
import { randomUUID } from 'node:crypto';

import { STORAGE_PROVIDER } from '../storage-provider.token';

@Injectable()
export class DocumentUploadService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async createUploadIntent(
    request: CreateUploadIntentRequest,
  ): Promise<CreateUploadIntentResponse> {
    const validation = validateDocumentFileMetadata(request);

    if (!validation.ok) {
      throw new BadRequestException({
        error: {
          code: validation.error.code,
        },
      });
    }

    const storageKey = `uploads/${randomUUID()}`;

    try {
      const presignedUpload = await this.storageProvider.createPresignedUpload({
        objectKey: storageKey,
        contentType: request.mimeType,
      });

      return {
        ...presignedUpload,
        storageKey,
      };
    } catch {
      throw new ServiceUnavailableException({
        error: {
          code: StorageErrorCode.PRESIGNED_UPLOAD_FAILED,
        },
      });
    }
  }
}
