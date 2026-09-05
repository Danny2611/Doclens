import { PRESIGNED_UPLOAD_EXPIRATION_SECONDS } from '@doclens/domain';

import {
  parseS3StorageConfig,
  StorageError,
  StorageErrorCode,
} from '../src';

const validEnvironment = {
  S3_ENDPOINT: 'http://localhost:9000',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'doclens-documents',
  S3_ACCESS_KEY_ID: 'doclensminio',
  S3_SECRET_ACCESS_KEY: 'doclensminio_local_password',
  S3_FORCE_PATH_STYLE: 'true',
};

describe('parseS3StorageConfig', () => {
  it('parses a MinIO-compatible configuration and defaults expiration to 10 minutes', () => {
    expect(parseS3StorageConfig(validEnvironment)).toEqual({
      endpoint: 'http://localhost:9000/',
      region: 'us-east-1',
      bucket: 'doclens-documents',
      accessKeyId: 'doclensminio',
      secretAccessKey: 'doclensminio_local_password',
      forcePathStyle: true,
      presignedUploadExpirationSeconds: PRESIGNED_UPLOAD_EXPIRATION_SECONDS,
    });
  });

  it.each([
    ['a missing endpoint', { ...validEnvironment, S3_ENDPOINT: undefined }],
    ['a malformed endpoint', { ...validEnvironment, S3_ENDPOINT: 'not-a-url' }],
    ['a missing bucket', { ...validEnvironment, S3_BUCKET: '' }],
    ['an invalid path-style value', { ...validEnvironment, S3_FORCE_PATH_STYLE: 'yes' }],
    ['a non-positive expiration', { ...validEnvironment, S3_PRESIGNED_UPLOAD_EXPIRATION_SECONDS: '0' }],
  ])('rejects %s', (_description, environment) => {
    const error = captureError(() => parseS3StorageConfig(environment));

    expect(error).toBeInstanceOf(StorageError);
    expect(error).toMatchObject({
      code: StorageErrorCode.INVALID_STORAGE_CONFIGURATION,
    });
  });

  it('uses the configured expiration', () => {
    expect(
      parseS3StorageConfig({
        ...validEnvironment,
        S3_PRESIGNED_UPLOAD_EXPIRATION_SECONDS: '300',
      }).presignedUploadExpirationSeconds,
    ).toBe(300);
  });
});

function captureError(operation: () => unknown): unknown {
  try {
    operation();
  } catch (error) {
    return error;
  }

  throw new Error('Expected the operation to throw.');
}
