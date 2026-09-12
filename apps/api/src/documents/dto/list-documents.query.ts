import { BadRequestException, type PipeTransform } from '@nestjs/common';
import { DocumentErrorCode } from '@doclens/contracts';
import { z } from 'zod';

const listDocumentsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

export class ListDocumentsQueryPipe implements PipeTransform<unknown, ListDocumentsQuery> {
  transform(value: unknown): ListDocumentsQuery {
    const result = listDocumentsQuerySchema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    throw new BadRequestException({
      error: {
        code: DocumentErrorCode.INVALID_PAGINATION,
      },
    });
  }
}
