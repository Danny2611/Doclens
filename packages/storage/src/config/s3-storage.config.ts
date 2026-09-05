import { PRESIGNED_UPLOAD_EXPIRATION_SECONDS } from '@doclens/domain';

import { StorageError, StorageErrorCode } from '../errors/storage.errors';

export interface S3StorageConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
  presignedUploadExpirationSeconds: number;
}

export type StorageEnvironment = Record<string, string | undefined>;

export function parseS3StorageConfig(environment: StorageEnvironment): S3StorageConfig {
  const endpoint = parseEndpoint(environment.S3_ENDPOINT);
  const region = requireValue(environment.S3_REGION);
  const bucket = requireValue(environment.S3_BUCKET);
  const accessKeyId = requireValue(environment.S3_ACCESS_KEY_ID);
  const secretAccessKey = requireValue(environment.S3_SECRET_ACCESS_KEY);

  return {
    endpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: parseBoolean(environment.S3_FORCE_PATH_STYLE, false),
    presignedUploadExpirationSeconds: parseExpiration(
      environment.S3_PRESIGNED_UPLOAD_EXPIRATION_SECONDS,
    ),
  };
}

function parseEndpoint(value: string | undefined): string {
  const endpoint = requireValue(value);

  try {
    const url = new URL(endpoint);

    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) {
      throw new Error('Invalid storage endpoint.');
    }

    return url.toString();
  } catch {
    throw invalidConfiguration();
  }
}

function requireValue(value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw invalidConfiguration();
  }

  return value;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw invalidConfiguration();
}

function parseExpiration(value: string | undefined): number {
  if (value === undefined || value === '') {
    return PRESIGNED_UPLOAD_EXPIRATION_SECONDS;
  }

  const expiration = Number(value);

  if (!Number.isSafeInteger(expiration) || expiration <= 0) {
    throw invalidConfiguration();
  }

  return expiration;
}

function invalidConfiguration(): StorageError {
  return new StorageError(
    StorageErrorCode.INVALID_STORAGE_CONFIGURATION,
    'Storage configuration is invalid.',
  );
}
