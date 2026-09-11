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

export interface GetObjectMetadataInput {
  objectKey: string;
}

/** Provider-independent metadata returned after an uploaded object is verified. */
export interface StorageObjectMetadata {
  contentType?: string;
  contentLength?: number;
}

export interface StorageProvider {
  createPresignedUpload(input: CreatePresignedUploadInput): Promise<PresignedUpload>;
  getObjectMetadata(input: GetObjectMetadataInput): Promise<StorageObjectMetadata>;
}
