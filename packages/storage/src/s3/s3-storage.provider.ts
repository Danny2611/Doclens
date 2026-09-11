import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type {
  CreatePresignedUploadInput,
  GetObjectMetadataInput,
  PresignedUpload,
  StorageProvider,
  StorageObjectMetadata,
} from '../contracts/storage-provider.interface';
import type { S3StorageConfig } from '../config/s3-storage.config';
import { StorageError, StorageErrorCode } from '../errors/storage.errors';

type PresignPutObjectUrl = (
  client: S3Client,
  command: PutObjectCommand,
  options: { expiresIn: number },
) => Promise<string>;

interface S3StorageProviderDependencies {
  client?: S3Client;
  presignPutObjectUrl?: PresignPutObjectUrl;
  now?: () => Date;
}

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly presignPutObjectUrl: PresignPutObjectUrl;
  private readonly now: () => Date;

  constructor(
    private readonly config: S3StorageConfig,
    dependencies: S3StorageProviderDependencies = {},
  ) {
    this.client = dependencies.client ?? createS3Client(config);
    this.presignPutObjectUrl = dependencies.presignPutObjectUrl ?? getSignedUrl;
    this.now = dependencies.now ?? (() => new Date());
  }

  async createPresignedUpload(input: CreatePresignedUploadInput): Promise<PresignedUpload> {
    validateUploadInput(input);

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: input.objectKey,
      ContentType: input.contentType,
    });

    try {
      const uploadUrl = await this.presignPutObjectUrl(this.client, command, {
        expiresIn: this.config.presignedUploadExpirationSeconds,
      });

      return {
        uploadUrl,
        method: 'PUT',
        expiresAt: new Date(
          this.now().getTime() + this.config.presignedUploadExpirationSeconds * 1000,
        ).toISOString(),
        requiredHeaders: {
          'content-type': input.contentType,
        },
      };
    } catch {
      throw new StorageError(
        StorageErrorCode.PRESIGNED_UPLOAD_FAILED,
        'Unable to create a presigned upload URL.',
      );
    }
  }

  async getObjectMetadata(input: GetObjectMetadataInput): Promise<StorageObjectMetadata> {
    validateObjectKey(input.objectKey);

    try {
      const output = await this.client.send(new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: input.objectKey,
      }));

      return {
        contentType: output.ContentType,
        contentLength: output.ContentLength,
      };
    } catch (error) {
      if (isObjectNotFound(error)) {
        throw new StorageError(
          StorageErrorCode.OBJECT_NOT_FOUND,
          'The storage object was not found.',
        );
      }

      throw new StorageError(
        StorageErrorCode.OBJECT_METADATA_LOOKUP_FAILED,
        'Unable to retrieve storage object metadata.',
      );
    }
  }
}

export function createS3StorageProvider(config: S3StorageConfig): StorageProvider {
  return new S3StorageProvider(config);
}

export function createS3Client(config: S3StorageConfig): S3Client {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function validateUploadInput(input: CreatePresignedUploadInput): void {
  if (input.contentType.trim() === '') {
    throw new StorageError(
      StorageErrorCode.INVALID_UPLOAD_INPUT,
      'Upload input is invalid.',
    );
  }

  validateObjectKey(input.objectKey);
}

function validateObjectKey(objectKey: string): void {
  if (objectKey.trim() === '') {
    throw new StorageError(
      StorageErrorCode.INVALID_UPLOAD_INPUT,
      'Upload input is invalid.',
    );
  }
}

function isObjectNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { name?: unknown; $metadata?: { httpStatusCode?: unknown } };

  return candidate.name === 'NotFound' || candidate.$metadata?.httpStatusCode === 404;
}
