import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@doclens/database';
import { StorageError, StorageErrorCode } from '@doclens/storage';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { STORAGE_PROVIDER } from '../src/documents/storage-provider.token';

const pdfMimeType = 'application/pdf';
const docxMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const storageKey = 'uploads/8f5e987f-2860-438e-bb28-e64f05c9f75e';

type DocumentRecord = {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  fileSize: bigint;
  status: string;
  pageCount: number | null;
  createdAt: Date;
  updatedAt: Date;
};

describe('Document create and query endpoints', () => {
  let app: INestApplication;
  let records: DocumentRecord[];
  let objectMetadata: { contentType?: string; contentLength?: number };
  let getObjectMetadata: jest.Mock;
  let documentRepository: {
    findUnique: jest.Mock;
    create: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
  };

  beforeAll(async () => {
    records = [];
    objectMetadata = { contentType: pdfMimeType, contentLength: 1024 };
    getObjectMetadata = jest.fn(async () => objectMetadata);
    documentRepository = {
      findUnique: jest.fn(({ where }) =>
        Promise.resolve(records.find((document) =>
          where.storageKey
            ? document.storageKey === where.storageKey
            : document.id === where.id,
        ) ?? null),
      ),
      create: jest.fn(({ data }) => {
        if (records.some((document) => document.storageKey === data.storageKey)) {
          return Promise.reject({ code: 'P2002' });
        }

        const record: DocumentRecord = {
          id: 'e2b3c4d5-6789-4abc-8def-0123456789ab',
          storageKey: data.storageKey,
          originalName: data.originalName,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
          status: data.status,
          pageCount: null,
          createdAt: new Date('2026-09-08T00:00:00.000Z'),
          updatedAt: new Date('2026-09-08T00:00:00.000Z'),
        };
        records.push(record);
        return Promise.resolve(record);
      }),
      findMany: jest.fn(({ skip, take }) =>
        Promise.resolve([...records]
          .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
          .slice(skip, skip + take)),
      ),
      count: jest.fn(() => Promise.resolve(records.length)),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(STORAGE_PROVIDER)
      .useValue({
        createPresignedUpload: jest.fn(),
        getObjectMetadata,
      })
      .overrideProvider(PrismaService)
      .useValue({ document: documentRepository })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    records.length = 0;
    objectMetadata = { contentType: pdfMimeType, contentLength: 1024 };
    getObjectMetadata.mockClear();
    Object.values(documentRepository).forEach((method) => method.mockClear());
  });

  it.each([
    ['report.pdf', pdfMimeType, 'PDF'],
    ['report.docx', docxMimeType, 'DOCX'],
  ])('creates an UPLOADED document from a verified %s object', async (originalFilename, mimeType, documentType) => {
    objectMetadata = { contentType: mimeType, contentLength: 1024 };

    const response = await request(app.getHttpServer())
      .post('/api/v1/documents')
      .send({ storageKey, originalFilename, mimeType, fileSize: 1024 })
      .expect(201);

    expect(response.body).toEqual({
      id: 'e2b3c4d5-6789-4abc-8def-0123456789ab',
      originalName: originalFilename,
      documentType,
      mimeType,
      fileSize: 1024,
      status: 'UPLOADED',
      pageCount: null,
      createdAt: '2026-09-08T00:00:00.000Z',
      updatedAt: '2026-09-08T00:00:00.000Z',
    });
    expect(response.body).not.toHaveProperty('storageKey');
    expect(getObjectMetadata).toHaveBeenCalledWith({ objectKey: storageKey });
  });

  it('rejects an invalid storage key before requesting object metadata', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/documents')
      .send({ storageKey: 'uploads/arbitrary-key', originalFilename: 'report.pdf', mimeType: pdfMimeType, fileSize: 1024 })
      .expect(400)
      .expect({ error: { code: 'INVALID_STORAGE_OBJECT' } });

    expect(getObjectMetadata).not.toHaveBeenCalled();
  });

  it('rejects a missing storage object without provider details', async () => {
    getObjectMetadata.mockRejectedValueOnce(
      new StorageError(StorageErrorCode.OBJECT_NOT_FOUND, 'provider path must not escape'),
    );

    const response = await request(app.getHttpServer())
      .post('/api/v1/documents')
      .send({ storageKey, originalFilename: 'report.pdf', mimeType: pdfMimeType, fileSize: 1024 })
      .expect(404)
      .expect({ error: { code: 'FILE_NOT_FOUND' } });

    expect(response.text).not.toContain('provider path must not escape');
  });

  it.each([
    ['an oversized actual object', { contentType: pdfMimeType, contentLength: 20 * 1024 * 1024 + 1 }],
    ['a mismatched actual Content-Type', { contentType: docxMimeType, contentLength: 1024 }],
    ['a mismatched actual size', { contentType: pdfMimeType, contentLength: 1025 }],
  ])('rejects %s', async (_description, metadata) => {
    objectMetadata = metadata;

    await request(app.getHttpServer())
      .post('/api/v1/documents')
      .send({ storageKey, originalFilename: 'report.pdf', mimeType: pdfMimeType, fileSize: 1024 })
      .expect(400)
      .expect({ error: { code: 'INVALID_STORAGE_OBJECT' } });

    expect(documentRepository.create).not.toHaveBeenCalled();
  });

  it('is idempotent for repeated requests using the same storage key', async () => {
    const requestBody = { storageKey, originalFilename: 'report.pdf', mimeType: pdfMimeType, fileSize: 1024 };

    const firstResponse = await request(app.getHttpServer())
      .post('/api/v1/documents')
      .send(requestBody)
      .expect(201);
    const secondResponse = await request(app.getHttpServer())
      .post('/api/v1/documents')
      .send(requestBody)
      .expect(201);

    expect(secondResponse.body.id).toBe(firstResponse.body.id);
    expect(documentRepository.create).toHaveBeenCalledTimes(1);
    expect(getObjectMetadata).toHaveBeenCalledTimes(1);
  });

  it('returns newest-first paginated documents without storage keys', async () => {
    records.push(
      createDocumentRecord('first', 'uploads/11111111-1111-4111-8111-111111111111', '2026-09-07T00:00:00.000Z'),
      createDocumentRecord('second', 'uploads/22222222-2222-4222-8222-222222222222', '2026-09-08T00:00:00.000Z'),
    );

    const response = await request(app.getHttpServer())
      .get('/api/v1/documents?page=1&limit=1')
      .expect(200);

    expect(response.body).toMatchObject({
      data: [{ id: 'second', originalName: 'second.pdf' }],
      pagination: { page: 1, limit: 1, total: 2, totalPages: 2 },
    });
    expect(response.body.data[0]).not.toHaveProperty('storageKey');
  });

  it('uses page 1 and limit 20 by default and rejects a limit above 100', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/documents')
      .expect(200)
      .expect({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

    await request(app.getHttpServer())
      .get('/api/v1/documents?limit=101')
      .expect(400)
      .expect({ error: { code: 'INVALID_PAGINATION' } });
  });

  it('returns detail by ID and a stable not-found response', async () => {
    records.push(createDocumentRecord('known', storageKey, '2026-09-08T00:00:00.000Z'));

    await request(app.getHttpServer())
      .get('/api/v1/documents/known')
      .expect(404)
      .expect({ error: { code: 'DOCUMENT_NOT_FOUND' } });

    const knownId = 'e2b3c4d5-6789-4abc-8def-0123456789ab';
    records[0]!.id = knownId;

    const response = await request(app.getHttpServer())
      .get(`/api/v1/documents/${knownId}`)
      .expect(200);

    expect(response.body).toEqual(expect.objectContaining({ id: knownId, originalName: 'known.pdf' }));
  });
});

function createDocumentRecord(id: string, recordStorageKey: string, createdAt: string): DocumentRecord {
  const timestamp = new Date(createdAt);

  return {
    id,
    storageKey: recordStorageKey,
    originalName: `${id}.pdf`,
    mimeType: pdfMimeType,
    fileSize: 1024n,
    status: 'UPLOADED',
    pageCount: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
