import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@doclens/database';
import type { CreatePresignedUploadInput, StorageProvider } from '@doclens/storage';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { STORAGE_PROVIDER } from '../src/documents/storage-provider.token';

const pdfMimeType = 'application/pdf';
const docxMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('POST /api/v1/documents/upload-url', () => {
  let app: INestApplication;
  let createPresignedUpload: jest.MockedFunction<StorageProvider['createPresignedUpload']>;

  beforeAll(async () => {
    createPresignedUpload = jest.fn(async (input: CreatePresignedUploadInput) => ({
      uploadUrl: 'https://storage.example.test/presigned-upload',
      method: 'PUT' as const,
      expiresAt: '2026-09-06T00:10:00.000Z',
      requiredHeaders: {
        'content-type': input.contentType,
      },
    }));

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(STORAGE_PROVIDER)
      .useValue({ createPresignedUpload })
      .overrideProvider(PrismaService)
      .useValue({ document: {} })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    createPresignedUpload.mockClear();
    createPresignedUpload.mockImplementation(async (input) => ({
      uploadUrl: 'https://storage.example.test/presigned-upload',
      method: 'PUT',
      expiresAt: '2026-09-06T00:10:00.000Z',
      requiredHeaders: {
        'content-type': input.contentType,
      },
    }));
  });

  it.each([
    ['report.pdf', pdfMimeType],
    ['report.docx', docxMimeType],
  ])('accepts a supported %s upload intent', async (originalFilename, mimeType) => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/documents/upload-url')
      .send({ originalFilename, mimeType, fileSize: 1024 })
      .expect(200);

    expect(response.body).toMatchObject({
      uploadUrl: 'https://storage.example.test/presigned-upload',
      method: 'PUT',
      expiresAt: '2026-09-06T00:10:00.000Z',
      requiredHeaders: {
        'content-type': mimeType,
      },
    });
    expect(response.body.storageKey).toMatch(/^uploads\/[0-9a-f-]{36}$/);
    expect(response.body.storageKey).not.toContain(originalFilename);
    expect(createPresignedUpload).toHaveBeenCalledWith({
      objectKey: response.body.storageKey,
      contentType: mimeType,
    });
  });

  it.each([
    ['empty file', { originalFilename: 'report.pdf', mimeType: pdfMimeType, fileSize: 0 }, 'EMPTY_FILE'],
    [
      'file larger than 20 MiB',
      { originalFilename: 'report.pdf', mimeType: pdfMimeType, fileSize: 20 * 1024 * 1024 + 1 },
      'FILE_TOO_LARGE',
    ],
    ['unsupported extension', { originalFilename: 'report.doc', mimeType: 'application/msword', fileSize: 1 }, 'UNSUPPORTED_FILE_EXTENSION'],
    ['unsupported MIME type', { originalFilename: 'report.pdf', mimeType: 'text/plain', fileSize: 1 }, 'UNSUPPORTED_MIME_TYPE'],
    ['extension and MIME type mismatch', { originalFilename: 'report.pdf', mimeType: docxMimeType, fileSize: 1 }, 'DOCUMENT_TYPE_MISMATCH'],
  ])('rejects %s with a stable error code', async (_description, body, code) => {
    await request(app.getHttpServer())
      .post('/api/v1/documents/upload-url')
      .send(body)
      .expect(400)
      .expect({
        error: {
          code,
        },
      });

    expect(createPresignedUpload).not.toHaveBeenCalled();
  });

  it('maps a storage failure to a safe 503 response', async () => {
    createPresignedUpload.mockRejectedValueOnce(new Error('internal storage detail'));

    const response = await request(app.getHttpServer())
      .post('/api/v1/documents/upload-url')
      .send({ originalFilename: 'report.pdf', mimeType: pdfMimeType, fileSize: 1 })
      .expect(503)
      .expect({
        error: {
          code: 'PRESIGNED_UPLOAD_FAILED',
        },
      });

    expect(response.text).not.toContain('internal storage detail');
  });
});
