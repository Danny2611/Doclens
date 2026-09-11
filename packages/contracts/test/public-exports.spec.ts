import type {
  DocumentResponse,
  CreateUploadIntentRequest,
  CreateUploadIntentResponse,
  UploadErrorCode,
} from '../src';
import { DocumentErrorCode } from '../src';

describe('@doclens/contracts public exports', () => {
  it('exports the upload intent and typed error-code contracts', () => {
    const request: CreateUploadIntentRequest = {
      originalFilename: 'quarterly-report.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
    };
    const response: CreateUploadIntentResponse = {
      uploadUrl: 'https://storage.example.test/upload',
      storageKey: 'documents/uuid',
      method: 'PUT',
      expiresAt: '2026-09-05T00:10:00.000Z',
      requiredHeaders: {
        'content-type': 'application/pdf',
      },
    };
    const errorCode: UploadErrorCode = 'EMPTY_FILE';
    const document: DocumentResponse = {
      id: 'e2b3c4d5-6789-4abc-8def-0123456789ab',
      originalName: 'quarterly-report.pdf',
      documentType: 'PDF',
      mimeType: 'application/pdf',
      fileSize: 1024,
      status: 'UPLOADED',
      pageCount: null,
      createdAt: '2026-09-08T00:00:00.000Z',
      updatedAt: '2026-09-08T00:00:00.000Z',
    };

    expect(request).not.toHaveProperty('storageKey');
    expect(response.method).toBe('PUT');
    expect(errorCode).toBe('EMPTY_FILE');
    expect(document).not.toHaveProperty('storageKey');
    expect(DocumentErrorCode.DOCUMENT_NOT_FOUND).toBe('DOCUMENT_NOT_FOUND');
  });
});
