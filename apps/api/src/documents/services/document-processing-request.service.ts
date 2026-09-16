import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  DOCUMENT_PROCESSING_JOB_CONTRACT_VERSION,
  DOCUMENT_PROCESSING_JOB_NAME,
  parseDocumentProcessingJobPayload,
} from '@doclens/queue';
import { DocumentErrorCode, type ProcessDocumentResponse } from '@doclens/contracts';
import { PrismaService } from '@doclens/database';
import type { Queue } from 'bullmq';
import { API_DOCUMENT_PROCESSING_QUEUE } from '../../queue/api-queue.provider';

@Injectable()
export class DocumentProcessingRequestService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(API_DOCUMENT_PROCESSING_QUEUE) private readonly queue: Queue,
  ) {}
  async request(documentId: string): Promise<ProcessDocumentResponse> {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document)
      throw new NotFoundException({ error: { code: DocumentErrorCode.DOCUMENT_NOT_FOUND } });
    if (document.status !== 'UPLOADED')
      throw new ConflictException({
        error: { code: DocumentErrorCode.DOCUMENT_NOT_ELIGIBLE_FOR_PROCESSING },
      });
    const active = await this.prisma.processingRun.findFirst({
      where: { documentId, status: { in: ['PENDING', 'RUNNING'] } },
    });
    if (active) throw duplicate();
    const last = await this.prisma.processingRun.aggregate({
      where: { documentId },
      _max: { attempt: true },
    });
    let run;
    try {
      run = await this.prisma.processingRun.create({
        data: {
          documentId,
          attempt: (last._max.attempt ?? 0) + 1,
          status: 'PENDING',
          stage: 'QUEUED',
        },
      });
    } catch (error) {
      if (isActiveIndexViolation(error)) throw duplicate();
      throw new ServiceUnavailableException({
        error: { code: DocumentErrorCode.DATABASE_UNAVAILABLE },
      });
    }
    try {
      const payload = parseDocumentProcessingJobPayload({
        version: DOCUMENT_PROCESSING_JOB_CONTRACT_VERSION,
        documentId,
        processingRunId: run.id,
      });
      await this.queue.add(DOCUMENT_PROCESSING_JOB_NAME, payload, {
        jobId: `process-document-${run.id}`,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1_000 },
      });
    } catch {
      try {
        await this.prisma.processingRun.delete({ where: { id: run.id } });
      } catch {
        throw new ServiceUnavailableException({
          error: { code: DocumentErrorCode.DATABASE_UNAVAILABLE },
        });
      }
      throw new ServiceUnavailableException({
        error: { code: DocumentErrorCode.PROCESSING_QUEUE_UNAVAILABLE },
      });
    }
    return {
      documentId,
      processingRunId: run.id,
      status: 'PENDING',
      acceptedAt: run.createdAt.toISOString(),
    };
  }
}
function duplicate(): ConflictException {
  return new ConflictException({ error: { code: DocumentErrorCode.PROCESSING_ALREADY_ACTIVE } });
}
function isActiveIndexViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}
