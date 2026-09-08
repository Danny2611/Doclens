import { NotFoundException, type PipeTransform } from '@nestjs/common';
import { DocumentErrorCode } from '@doclens/contracts';
import { z } from 'zod';

const documentIdSchema = z.string().uuid();

export class DocumentIdPipe implements PipeTransform<unknown, string> {
  transform(value: unknown): string {
    const result = documentIdSchema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    throw new NotFoundException({
      error: {
        code: DocumentErrorCode.DOCUMENT_NOT_FOUND,
      },
    });
  }
}
