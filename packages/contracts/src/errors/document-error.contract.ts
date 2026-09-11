export const DocumentErrorCode = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  INVALID_STORAGE_OBJECT: 'INVALID_STORAGE_OBJECT',
  STORAGE_PROVIDER_UNAVAILABLE: 'STORAGE_PROVIDER_UNAVAILABLE',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  INVALID_PAGINATION: 'INVALID_PAGINATION',
  DATABASE_UNAVAILABLE: 'DATABASE_UNAVAILABLE',
} as const;

export type DocumentErrorCode = (typeof DocumentErrorCode)[keyof typeof DocumentErrorCode];

export interface DocumentErrorResponse {
  error: {
    code: DocumentErrorCode;
  };
}
