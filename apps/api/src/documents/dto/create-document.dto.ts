import { BadRequestException, type PipeTransform } from '@nestjs/common';
import { DocumentErrorCode } from '@doclens/contracts';
import { UploadErrorCode } from '@doclens/domain';
import { z } from 'zod';

import type { CreateDocumentRequest } from '@doclens/contracts';

const createDocumentRequestSchema = z
  .object({
    storageKey: z.string(),
    originalFilename: z.string(),
    mimeType: z.string(),
    fileSize: z.number(),
  })
  .strict();

export class CreateDocumentRequestPipe implements PipeTransform<unknown, CreateDocumentRequest> {
  transform(value: unknown): CreateDocumentRequest {
    const result = createDocumentRequestSchema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    const issuePath = result.error.issues[0]?.path[0];

    throw new BadRequestException({ error: { code: getErrorCodeForIssue(issuePath) } });
  }
}

function getErrorCodeForIssue(issuePath: PropertyKey | undefined): string {
  if (issuePath === 'originalFilename') {
    return UploadErrorCode.UNSUPPORTED_FILE_EXTENSION;
  }

  if (issuePath === 'mimeType') {
    return UploadErrorCode.UNSUPPORTED_MIME_TYPE;
  }

  if (issuePath === 'fileSize') {
    return UploadErrorCode.INVALID_FILE_SIZE;
  }

  return DocumentErrorCode.INVALID_STORAGE_OBJECT;
}
