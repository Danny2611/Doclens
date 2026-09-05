export const StorageErrorCode = {
  INVALID_STORAGE_CONFIGURATION: 'INVALID_STORAGE_CONFIGURATION',
  INVALID_UPLOAD_INPUT: 'INVALID_UPLOAD_INPUT',
  PRESIGNED_UPLOAD_FAILED: 'PRESIGNED_UPLOAD_FAILED',
} as const;

export type StorageErrorCode = (typeof StorageErrorCode)[keyof typeof StorageErrorCode];

export class StorageError extends Error {
  constructor(
    readonly code: StorageErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'StorageError';
  }
}
