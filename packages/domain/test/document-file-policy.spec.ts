import {
  MAX_DOCUMENT_FILE_SIZE_BYTES,
  UploadErrorCode,
  validateDocumentFileMetadata,
} from '../src';

describe('validateDocumentFileMetadata', () => {
  it.each([
    {
      originalFilename: 'report.pdf',
      mimeType: 'application/pdf',
      fileSize: 1,
      documentType: 'PDF',
    },
    {
      originalFilename: 'REPORT.PDF',
      mimeType: 'application/pdf',
      fileSize: MAX_DOCUMENT_FILE_SIZE_BYTES,
      documentType: 'PDF',
    },
    {
      originalFilename: 'report.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: 1,
      documentType: 'DOCX',
    },
  ])('accepts supported metadata for $documentType', ({ documentType, ...metadata }) => {
    expect(validateDocumentFileMetadata(metadata)).toEqual({
      ok: true,
      documentType,
    });
  });

  it.each([
    {
      name: 'an empty file',
      metadata: { originalFilename: 'empty.pdf', mimeType: 'application/pdf', fileSize: 0 },
      code: UploadErrorCode.EMPTY_FILE,
    },
    {
      name: 'a file larger than 20 MiB',
      metadata: {
        originalFilename: 'large.pdf',
        mimeType: 'application/pdf',
        fileSize: MAX_DOCUMENT_FILE_SIZE_BYTES + 1,
      },
      code: UploadErrorCode.FILE_TOO_LARGE,
    },
    {
      name: 'a non-finite file size',
      metadata: { originalFilename: 'invalid.pdf', mimeType: 'application/pdf', fileSize: Number.NaN },
      code: UploadErrorCode.INVALID_FILE_SIZE,
    },
    {
      name: 'a negative file size',
      metadata: { originalFilename: 'invalid.pdf', mimeType: 'application/pdf', fileSize: -1 },
      code: UploadErrorCode.INVALID_FILE_SIZE,
    },
    {
      name: 'a non-integer file size',
      metadata: { originalFilename: 'invalid.pdf', mimeType: 'application/pdf', fileSize: 1.5 },
      code: UploadErrorCode.INVALID_FILE_SIZE,
    },
    {
      name: 'an unsafe integer file size',
      metadata: {
        originalFilename: 'invalid.pdf',
        mimeType: 'application/pdf',
        fileSize: Number.MAX_SAFE_INTEGER + 1,
      },
      code: UploadErrorCode.INVALID_FILE_SIZE,
    },
    {
      name: 'an unsupported extension',
      metadata: { originalFilename: 'legacy.doc', mimeType: 'application/msword', fileSize: 1 },
      code: UploadErrorCode.UNSUPPORTED_FILE_EXTENSION,
    },
    {
      name: 'an unsupported MIME type',
      metadata: { originalFilename: 'report.pdf', mimeType: 'text/plain', fileSize: 1 },
      code: UploadErrorCode.UNSUPPORTED_MIME_TYPE,
    },
    {
      name: 'mismatched PDF extension and DOCX MIME type',
      metadata: {
        originalFilename: 'report.pdf',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: 1,
      },
      code: UploadErrorCode.DOCUMENT_TYPE_MISMATCH,
    },
  ])('rejects $name with a stable error code', ({ metadata, code }) => {
    expect(validateDocumentFileMetadata(metadata)).toEqual({
      ok: false,
      error: { code },
    });
  });
});
