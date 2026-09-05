export interface CreatePresignedUploadInput {
  objectKey: string;
  contentType: string;
}

export interface PresignedUpload {
  uploadUrl: string;
  method: 'PUT';
  expiresAt: string;
  requiredHeaders: Record<string, string>;
}

export interface StorageProvider {
  createPresignedUpload(input: CreatePresignedUploadInput): Promise<PresignedUpload>;
}
