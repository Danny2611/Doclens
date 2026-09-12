const { DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { createS3Client, createS3StorageProvider, parseS3StorageConfig } = require('../dist');

const SMOKE_TEST_PREFIX = 'smoke-tests/';
const FIXTURE_CONTENT_TYPE = 'application/pdf';
const FIXTURE_CONTENT = Buffer.from('%PDF-1.4\n% DocLens smoke test\n');

class SmokeTestError extends Error {
  constructor(stage, category, statusCode) {
    const status = statusCode === undefined ? '' : ` with HTTP status ${statusCode}`;

    super(`Storage smoke test failed during ${stage} (${category})${status}.`);
    this.name = 'SmokeTestError';
  }
}

async function run() {
  let config;
  let client;
  let objectKey;
  let failure;

  try {
    try {
      config = parseS3StorageConfig(process.env);
    } catch {
      throw new SmokeTestError('configuration', 'INVALID_STORAGE_CONFIGURATION');
    }

    objectKey = `${SMOKE_TEST_PREFIX}${crypto.randomUUID()}.pdf`;
    client = createS3Client(config);
    const provider = createS3StorageProvider(config);
    let upload;

    try {
      upload = await provider.createPresignedUpload({
        objectKey,
        contentType: FIXTURE_CONTENT_TYPE,
      });
    } catch {
      throw new SmokeTestError('presigning', 'PRESIGNED_UPLOAD_FAILED');
    }

    if (
      upload.method !== 'PUT' ||
      upload.requiredHeaders['content-type'] !== FIXTURE_CONTENT_TYPE
    ) {
      throw new SmokeTestError('presigning', 'INVALID_UPLOAD_REQUIREMENTS');
    }

    let uploadResponse;

    try {
      uploadResponse = await fetch(upload.uploadUrl, {
        method: upload.method,
        headers: upload.requiredHeaders,
        body: FIXTURE_CONTENT,
      });
    } catch {
      throw new SmokeTestError('upload', 'UPLOAD_REQUEST_FAILED');
    }

    if (!uploadResponse.ok) {
      throw new SmokeTestError('upload', 'UPLOAD_RESPONSE_FAILED', uploadResponse.status);
    }

    let metadata;

    try {
      metadata = await client.send(
        new HeadObjectCommand({
          Bucket: config.bucket,
          Key: objectKey,
        }),
      );
    } catch {
      throw new SmokeTestError('metadata verification', 'OBJECT_METADATA_UNAVAILABLE');
    }

    if (
      metadata.ContentType !== FIXTURE_CONTENT_TYPE ||
      metadata.ContentLength !== FIXTURE_CONTENT.length
    ) {
      throw new SmokeTestError('metadata verification', 'OBJECT_METADATA_MISMATCH');
    }
  } catch (error) {
    failure =
      error instanceof SmokeTestError
        ? error
        : new SmokeTestError('execution', 'UNEXPECTED_STORAGE_FAILURE');
  } finally {
    if (config && client && objectKey) {
      try {
        await client.send(
          new DeleteObjectCommand({
            Bucket: config.bucket,
            Key: objectKey,
          }),
        );
      } catch {
        if (!failure) {
          failure = new SmokeTestError('cleanup', 'TEMPORARY_OBJECT_CLEANUP_FAILED');
        }
      }
    }
  }

  if (failure) {
    throw failure;
  }

  process.stdout.write(
    `Storage smoke test passed for bucket ${config.bucket} and ${SMOKE_TEST_PREFIX}\n`,
  );
}

run().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
