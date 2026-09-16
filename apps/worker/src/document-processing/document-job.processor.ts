import { Injectable } from '@nestjs/common';
import { parseDocumentProcessingJobPayload } from '@doclens/queue';
import { PrismaService } from '@doclens/database';
import type { Job } from 'bullmq';

@Injectable()
export class DocumentJobProcessor {
  constructor(private readonly prisma: PrismaService) {}

  async process(job: Job<unknown>): Promise<void> {
    const payload = parseDocumentProcessingJobPayload(job.data);
    const run = await this.prisma.processingRun.findUnique({
      where: { id: payload.processingRunId },
    });
    const document = await this.prisma.document.findUnique({ where: { id: payload.documentId } });
    if (!run || !document || run.documentId !== payload.documentId) {
      throw new Error('Invalid document processing job reference.');
    }
    if (run.status === 'COMPLETED' || run.status === 'FAILED') return;

    if (run.status === 'PENDING') {
      const claimed = await this.prisma.processingRun.updateMany({
        where: { id: run.id, status: 'PENDING' },
        data: { status: 'RUNNING', startedAt: new Date() },
      });
      if (claimed.count === 0) return;
    }

    // Day 3 proves lifecycle ownership only; parsing and AI work begin in later tasks.
    const completed = await this.prisma.processingRun.updateMany({
      where: { id: run.id, status: 'RUNNING' },
      data: { status: 'COMPLETED', completedAt: new Date(), errorCode: null, errorMessage: null },
    });
    if (completed.count === 0) return;
  }
}
