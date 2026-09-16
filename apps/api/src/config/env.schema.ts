import { z } from 'zod';

import { parseS3StorageConfig, type StorageEnvironment } from '@doclens/storage';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  S3_ENDPOINT: z.string().min(1),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: z.enum(['true', 'false']).optional(),
  S3_PRESIGNED_UPLOAD_EXPIRATION_SECONDS: z.string().optional(),
  REDIS_URL: z.string().url(),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(config: Record<string, unknown>): Environment {
  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid API environment configuration: ${issues}`);
  }

  try {
    parseS3StorageConfig(toStorageEnvironment(result.data));
  } catch {
    throw new Error('Invalid API environment configuration: storage configuration is invalid.');
  }

  if (!['redis:', 'rediss:'].includes(new URL(result.data.REDIS_URL).protocol))
    throw new Error('Invalid API environment configuration: REDIS_URL must use redis: or rediss:.');
  return result.data;
}

function toStorageEnvironment(environment: Environment): StorageEnvironment {
  return {
    S3_ENDPOINT: environment.S3_ENDPOINT,
    S3_REGION: environment.S3_REGION,
    S3_BUCKET: environment.S3_BUCKET,
    S3_ACCESS_KEY_ID: environment.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: environment.S3_SECRET_ACCESS_KEY,
    S3_FORCE_PATH_STYLE: environment.S3_FORCE_PATH_STYLE,
    S3_PRESIGNED_UPLOAD_EXPIRATION_SECONDS: environment.S3_PRESIGNED_UPLOAD_EXPIRATION_SECONDS,
  };
}
