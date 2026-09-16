import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().refine(isRedisUrl, 'must use redis: or rediss:'),
  WORKER_STARTUP_TIMEOUT_MS: z.coerce.number().int().min(100).max(60_000).default(5_000),
});

export type WorkerEnvironment = z.infer<typeof environmentSchema>;

export function validateEnvironment(config: Record<string, unknown>): WorkerEnvironment {
  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid worker environment configuration: ${issues}`);
  }

  return result.data;
}

function isRedisUrl(value: string): boolean {
  try {
    return ['redis:', 'rediss:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
