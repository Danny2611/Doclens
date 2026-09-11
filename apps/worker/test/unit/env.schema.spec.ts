import { validateEnvironment } from '../../src/config/env.schema';

describe('validateEnvironment', () => {
  it('accepts the worker dependency configuration', () => {
    expect(
      validateEnvironment({
        DATABASE_URL: 'postgresql://doclens:password@localhost:5433/doclens',
        REDIS_URL: 'redis://localhost:6379',
      }),
    ).toMatchObject({
      NODE_ENV: 'development',
      WORKER_STARTUP_TIMEOUT_MS: 5_000,
    });
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => validateEnvironment({ REDIS_URL: 'redis://localhost:6379' })).toThrow(
      'Invalid worker environment configuration: DATABASE_URL:',
    );
  });

  it('rejects an invalid REDIS_URL', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'postgresql://doclens:password@localhost:5433/doclens',
        REDIS_URL: 'not-a-valid-redis-url',
      }),
    ).toThrow('Invalid worker environment configuration: REDIS_URL:');
  });
});
