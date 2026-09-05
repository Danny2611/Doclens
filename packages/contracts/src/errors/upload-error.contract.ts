import type { UploadErrorCodeValue } from '@doclens/domain';

export type UploadErrorCode = UploadErrorCodeValue;

export interface UploadErrorResponse {
  error: {
    code: UploadErrorCode;
  };
}
