import { UploadErrorCode, type UploadErrorCode as UploadErrorCodeValue } from './document.errors';

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const PRESIGNED_UPLOAD_EXPIRATION_SECONDS = 10 * 60;

export const SUPPORTED_DOCUMENT_TYPES = [
  {
    type: 'PDF',
    extension: '.pdf',
    mimeType: 'application/pdf',
  },
  {
    type: 'DOCX',
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
] as const;

export type SupportedDocumentType = (typeof SUPPORTED_DOCUMENT_TYPES)[number]['type'];
export type SupportedDocumentExtension = (typeof SUPPORTED_DOCUMENT_TYPES)[number]['extension'];
export type SupportedDocumentMimeType = (typeof SUPPORTED_DOCUMENT_TYPES)[number]['mimeType'];

export interface DocumentFileMetadata {
  originalFilename: string;
  mimeType: string;
  fileSize: number;
}

export interface DocumentFileValidationError {
  code: UploadErrorCodeValue;
}

export type DocumentFileValidationResult =
  | {
      ok: true;
      documentType: SupportedDocumentType;
    }
  | {
      ok: false;
      error: DocumentFileValidationError;
    };

export function validateDocumentFileMetadata(
  metadata: DocumentFileMetadata,
): DocumentFileValidationResult {
  const fileSizeError = validateFileSize(metadata.fileSize);

  if (fileSizeError) {
    return {
      ok: false,
      error: { code: fileSizeError },
    };
  }

  const extension = getFilenameExtension(metadata.originalFilename);
  const documentTypeForExtension = SUPPORTED_DOCUMENT_TYPES.find(
    (documentType) => documentType.extension === extension,
  );

  if (!documentTypeForExtension) {
    return {
      ok: false,
      error: { code: UploadErrorCode.UNSUPPORTED_FILE_EXTENSION },
    };
  }

  const documentTypeForMimeType = SUPPORTED_DOCUMENT_TYPES.find(
    (documentType) => documentType.mimeType === metadata.mimeType,
  );

  if (!documentTypeForMimeType) {
    return {
      ok: false,
      error: { code: UploadErrorCode.UNSUPPORTED_MIME_TYPE },
    };
  }

  if (documentTypeForExtension.type !== documentTypeForMimeType.type) {
    return {
      ok: false,
      error: { code: UploadErrorCode.DOCUMENT_TYPE_MISMATCH },
    };
  }

  return {
    ok: true,
    documentType: documentTypeForExtension.type,
  };
}

function validateFileSize(fileSize: number): UploadErrorCodeValue | undefined {
  if (!Number.isFinite(fileSize) || !Number.isSafeInteger(fileSize) || fileSize < 0) {
    return UploadErrorCode.INVALID_FILE_SIZE;
  }

  if (fileSize === 0) {
    return UploadErrorCode.EMPTY_FILE;
  }

  if (fileSize > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    return UploadErrorCode.FILE_TOO_LARGE;
  }

  return undefined;
}

function getFilenameExtension(originalFilename: string): string {
  const extensionStart = originalFilename.lastIndexOf('.');

  if (extensionStart < 0) {
    return '';
  }

  return originalFilename.slice(extensionStart).toLowerCase();
}
