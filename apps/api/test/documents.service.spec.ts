import { DocumentErrorCode } from '@doclens/contracts';
import { StorageError, StorageErrorCode } from '@doclens/storage';

import { DocumentsService } from '../src/documents/services/documents.service';

const storageKey = 'uploads/8f5e987f-2860-438e-bb28-e64f05c9f75e';

describe('DocumentsService', () => {
  it('returns the concurrently created document after the database unique constraint wins', async () => {
    const existingDocument = {
      id: 'e2b3c4d5-6789-4abc-8def-0123456789ab',
      storageKey,
      originalName: 'report.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024n,
      status: 'UPLOADED',
      pageCount: null,
      createdAt: new Date('2026-09-08T00:00:00.000Z'),
      updatedAt: new Date('2026-09-08T00:00:00.000Z'),
    };
    const prisma = {
      document: {
        findUnique: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(existingDocument),
        create: jest.fn().mockRejectedValue({ code: 'P2002' }),
      },
    };
    const storageProvider = {
      getObjectMetadata: jest.fn().mockResolvedValue({
        contentType: 'application/pdf',
        contentLength: 1024,
      }),
    };
    const service = new DocumentsService(prisma as never, storageProvider as never);

    await expect(service.createDocument({
      storageKey,
      originalFilename: 'report.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
    })).resolves.toMatchObject({ id: existingDocument.id, status: 'UPLOADED' });

    expect(prisma.document.create).toHaveBeenCalledTimes(1);
    expect(storageProvider.getObjectMetadata).toHaveBeenCalledTimes(1);
  });

  it('maps unavailable storage metadata to a safe error response', async () => {
    const service = new DocumentsService({
      document: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as never, {
      getObjectMetadata: jest.fn().mockRejectedValue(
        new StorageError(StorageErrorCode.OBJECT_METADATA_LOOKUP_FAILED, 'provider detail'),
      ),
    } as never);

    await expect(service.createDocument({
      storageKey,
      originalFilename: 'report.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
    })).rejects.toMatchObject({
      response: { error: { code: DocumentErrorCode.STORAGE_PROVIDER_UNAVAILABLE } },
    });
  });
});
