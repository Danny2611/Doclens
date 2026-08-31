import { validateEnvironment } from '../src/config/env.schema';

describe('validateEnvironment', () => {
  it('uses defaults for the API-only configuration at this stage', () => {
    expect(validateEnvironment({})).toMatchObject({
      NODE_ENV: 'development',
      API_PORT: 3000,
    });
  });

  it('fails fast when API_PORT is invalid', () => {
    expect(() => validateEnvironment({ API_PORT: '0' })).toThrow(
      'Invalid API environment configuration: API_PORT:',
    );
  });

  it('fails fast when NODE_ENV is invalid', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'invalid' })).toThrow(
      'Invalid API environment configuration: NODE_ENV:',
    );
  });
});
