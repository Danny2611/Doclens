import { withStartupTimeout } from '../../src/infrastructure/connection-timeout';

describe('withStartupTimeout', () => {
  it('returns a completed operation result', async () => {
    await expect(withStartupTimeout(async () => 'connected', 50, 'Redis')).resolves.toBe('connected');
  });

  it('fails a stalled operation within the configured bound', async () => {
    await expect(
      withStartupTimeout(() => new Promise<never>(() => undefined), 10, 'Redis'),
    ).rejects.toThrow('Redis did not respond within 10ms.');
  });
});
