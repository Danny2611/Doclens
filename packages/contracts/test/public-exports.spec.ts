import type {
  CreateUploadIntentRequest,
  CreateUploadIntentResponse,
  UploadErrorCode,
} from '../src';

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

    expect(request).not.toHaveProperty('storageKey');
    expect(response.method).toBe('PUT');
    expect(errorCode).toBe('EMPTY_FILE');
  });
});
