import { BadRequestException, type PipeTransform } from '@nestjs/common';
import { UploadErrorCode } from '@doclens/domain';
import { z } from 'zod';

import type { CreateUploadIntentRequest } from '@doclens/contracts';

const createUploadIntentRequestSchema = z
  .object({
    originalFilename: z.string(),
    mimeType: z.string(),
    fileSize: z.number(),
  })
  .strict();

export class CreateUploadIntentRequestPipe
  implements PipeTransform<unknown, CreateUploadIntentRequest>
{
  transform(value: unknown): CreateUploadIntentRequest {
    const result = createUploadIntentRequestSchema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    const issuePath = result.error.issues[0]?.path[0];

    throw new BadRequestException({
      error: {
        code: getUploadErrorCodeForIssue(issuePath),
      },
    });
  }
}

function getUploadErrorCodeForIssue(issuePath: PropertyKey | undefined): string {
  if (issuePath === 'originalFilename') {
    return UploadErrorCode.UNSUPPORTED_FILE_EXTENSION;
  }

  if (issuePath === 'mimeType') {
    return UploadErrorCode.UNSUPPORTED_MIME_TYPE;
  }

  return UploadErrorCode.INVALID_FILE_SIZE;
}
