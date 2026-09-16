import { z } from 'zod';

export const DOCUMENT_PROCESSING_JOB_CONTRACT_VERSION = 1 as const;
export const documentProcessingJobPayloadSchema = z
  .object({
    version: z.literal(DOCUMENT_PROCESSING_JOB_CONTRACT_VERSION),
    documentId: z.string().uuid(),
    processingRunId: z.string().uuid(),
  })
  .strict();
export type DocumentProcessingJobPayload = z.infer<typeof documentProcessingJobPayloadSchema>;
export function parseDocumentProcessingJobPayload(payload: unknown): DocumentProcessingJobPayload {
  return documentProcessingJobPayloadSchema.parse(payload);
}
