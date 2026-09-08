import { validateEnvironment } from '../src/config/env.schema';

const validStorageEnvironment = {
  S3_ENDPOINT: 'http://127.0.0.1:9000',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'doclens-test',
  S3_ACCESS_KEY_ID: 'test-access-key',
  S3_SECRET_ACCESS_KEY: 'test-secret-key',
};

describe('validateEnvironment', () => {
  it('uses API defaults when required storage configuration is valid', () => {
    expect(validateEnvironment(validStorageEnvironment)).toMatchObject({
      NODE_ENV: 'development',
      API_PORT: 3000,
    });
  });

  it('fails fast when API_PORT is invalid', () => {
    expect(() => validateEnvironment({ ...validStorageEnvironment, API_PORT: '0' })).toThrow(
      'Invalid API environment configuration: API_PORT:',
    );
  });

  it('fails fast when NODE_ENV is invalid', () => {
    expect(() => validateEnvironment({ ...validStorageEnvironment, NODE_ENV: 'invalid' })).toThrow(
      'Invalid API environment configuration: NODE_ENV:',
    );
  });

  it('fails fast with a safe message when storage configuration is invalid', () => {
    expect(() => validateEnvironment({ ...validStorageEnvironment, S3_ENDPOINT: 'not-a-url' }))
      .toThrow('Invalid API environment configuration: storage configuration is invalid.');
  });
});
