import {
  DocumentStatus,
  PrismaClient,
  ProcessingRunStatus,
  ProcessingStage,
} from '@prisma/client';

const prisma = new PrismaClient();

const seedDocuments = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    originalName: 'project-proposal.pdf',
    mimeType: 'application/pdf',
    fileSize: 1_024_000n,
    storageKey: 'uploads/10000000-0000-4000-8000-000000000001',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    originalName: 'meeting-notes.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 860_000n,
    storageKey: 'uploads/10000000-0000-4000-8000-000000000002',
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    originalName: 'technical-overview.pdf',
    mimeType: 'application/pdf',
    fileSize: 2_450_000n,
    storageKey: 'uploads/10000000-0000-4000-8000-000000000003',
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    originalName: 'research-plan.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 1_700_000n,
    storageKey: 'uploads/10000000-0000-4000-8000-000000000004',
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    originalName: 'architecture-notes.pdf',
    mimeType: 'application/pdf',
    fileSize: 735_000n,
    storageKey: 'uploads/10000000-0000-4000-8000-000000000005',
  },
] as const;

async function main(): Promise<void> {
  for (const document of seedDocuments) {
    await prisma.document.upsert({
      where: { id: document.id },
      update: {
        originalName: document.originalName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        storageKey: document.storageKey,
        status: DocumentStatus.UPLOADED,
        pageCount: null,
        language: null,
        errorCode: null,
        errorMessage: null,
      },
      create: {
        ...document,
        status: DocumentStatus.UPLOADED,
      },
    });

    await prisma.processingRun.upsert({
      where: {
        documentId_attempt: {
          documentId: document.id,
          attempt: 1,
        },
      },
      update: {
        status: ProcessingRunStatus.PENDING,
        stage: ProcessingStage.QUEUED,
        startedAt: null,
        completedAt: null,
        durationMs: null,
        errorCode: null,
        errorMessage: null,
      },
      create: {
        documentId: document.id,
        attempt: 1,
        status: ProcessingRunStatus.PENDING,
        stage: ProcessingStage.QUEUED,
      },
    });
  }

  console.log(`Seeded ${seedDocuments.length} documents and ${seedDocuments.length} processing runs.`);
}

main()
  .catch(() => {
    console.error('Database seed failed.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
