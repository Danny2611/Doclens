import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import {
  createS3Client,
  S3StorageProvider,
  StorageError,
  StorageErrorCode,
  type S3StorageConfig,
} from '../src';

const storageConfig: S3StorageConfig = {
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  bucket: 'doclens-documents',
  accessKeyId: 'doclensminio',
  secretAccessKey: 'doclensminio_local_password',
  forcePathStyle: true,
  presignedUploadExpirationSeconds: 600,
};

describe('S3StorageProvider', () => {
  it('creates a signed PUT upload requirement with the configured object key and content type', async () => {
    const client = new S3Client({ region: 'us-east-1' });
    const presignPutObjectUrl = jest.fn().mockResolvedValue('https://storage.example.test/signed');
    const provider = new S3StorageProvider(storageConfig, {
      client,
      presignPutObjectUrl,
      now: () => new Date('2026-09-05T00:00:00.000Z'),
    });

    await expect(
      provider.createPresignedUpload({
        objectKey: 'documents/8f5e987f-2860-438e-bb28-e64f05c9f75e',
        contentType: 'application/pdf',
      }),
    ).resolves.toEqual({
      uploadUrl: 'https://storage.example.test/signed',
      method: 'PUT',
      expiresAt: '2026-09-05T00:10:00.000Z',
      requiredHeaders: {
        'content-type': 'application/pdf',
      },
    });

    const command = presignPutObjectUrl.mock.calls[0]?.[1] as PutObjectCommand;

    expect(command.input).toMatchObject({
      Bucket: 'doclens-documents',
      Key: 'documents/8f5e987f-2860-438e-bb28-e64f05c9f75e',
      ContentType: 'application/pdf',
    });
    expect(presignPutObjectUrl).toHaveBeenCalledWith(client, command, { expiresIn: 600 });
  });

  it('enables MinIO path-style addressing when configured', () => {
    expect(createS3Client(storageConfig).config.forcePathStyle).toBe(true);
  });

  it('maps signing failures without exposing SDK details or credentials', async () => {
    const provider = new S3StorageProvider(storageConfig, {
      client: new S3Client({ region: 'us-east-1' }),
      presignPutObjectUrl: jest
        .fn()
        .mockRejectedValue(new Error('doclensminio_local_password should not escape')),
    });

    await expect(
      provider.createPresignedUpload({
        objectKey: 'documents/8f5e987f-2860-438e-bb28-e64f05c9f75e',
        contentType: 'application/pdf',
      }),
    ).rejects.toEqual(
      new StorageError(
        StorageErrorCode.PRESIGNED_UPLOAD_FAILED,
        'Unable to create a presigned upload URL.',
      ),
    );
  });

  it('rejects an empty object key before calling the presigner', async () => {
    const presignPutObjectUrl = jest.fn();
    const provider = new S3StorageProvider(storageConfig, {
      client: new S3Client({ region: 'us-east-1' }),
      presignPutObjectUrl,
    });

    await expect(
      provider.createPresignedUpload({ objectKey: '', contentType: 'application/pdf' }),
    ).rejects.toMatchObject({ code: StorageErrorCode.INVALID_UPLOAD_INPUT });
    expect(presignPutObjectUrl).not.toHaveBeenCalled();
  });

  it('retrieves provider-independent object metadata', async () => {
    const send = jest.fn().mockResolvedValue({
      ContentType: 'application/pdf',
      ContentLength: 1024,
    });
    const provider = new S3StorageProvider(storageConfig, {
      client: { send } as unknown as S3Client,
    });

    await expect(
      provider.getObjectMetadata({ objectKey: 'uploads/8f5e987f-2860-438e-bb28-e64f05c9f75e' }),
    ).resolves.toEqual({
      contentType: 'application/pdf',
      contentLength: 1024,
    });

    expect(send).toHaveBeenCalledWith(expect.any(HeadObjectCommand));
    const command = send.mock.calls[0]?.[0] as HeadObjectCommand;
    expect(command.input).toEqual({
      Bucket: 'doclens-documents',
      Key: 'uploads/8f5e987f-2860-438e-bb28-e64f05c9f75e',
    });
  });

  it('maps a missing object to a stable storage error', async () => {
    const provider = new S3StorageProvider(storageConfig, {
      client: {
        send: jest.fn().mockRejectedValue({ $metadata: { httpStatusCode: 404 } }),
      } as unknown as S3Client,
    });

    await expect(
      provider.getObjectMetadata({ objectKey: 'uploads/8f5e987f-2860-438e-bb28-e64f05c9f75e' }),
    ).rejects.toEqual(
      new StorageError(StorageErrorCode.OBJECT_NOT_FOUND, 'The storage object was not found.'),
    );
  });

  it('maps metadata lookup failures without exposing SDK details', async () => {
    const provider = new S3StorageProvider(storageConfig, {
      client: {
        send: jest.fn().mockRejectedValue(new Error('provider detail must not escape')),
      } as unknown as S3Client,
    });

    await expect(
      provider.getObjectMetadata({ objectKey: 'uploads/8f5e987f-2860-438e-bb28-e64f05c9f75e' }),
    ).rejects.toEqual(
      new StorageError(
        StorageErrorCode.OBJECT_METADATA_LOOKUP_FAILED,
        'Unable to retrieve storage object metadata.',
      ),
    );
  });
});
