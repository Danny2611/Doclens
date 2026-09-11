import { describe, expect, it, vi } from 'vitest';

import { ApiClientError, createApiClient } from '../src/shared/api/api-client';

describe('API client', () => {
  it('requests the documented health endpoint', async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok', service: 'api' }), { status: 200 }),
    );
    const client = createApiClient({
      baseUrl: 'http://localhost:3000/api/v1',
      fetchImplementation,
    });

    await expect(client.getHealth()).resolves.toEqual({ status: 'ok', service: 'api' });
    expect(fetchImplementation).toHaveBeenCalledWith('http://localhost:3000/api/v1/health', {
      headers: { Accept: 'application/json' },
    });
  });

  it('rejects an invalid health response', async () => {
    const client = createApiClient({
      fetchImplementation: vi.fn().mockResolvedValue(new Response('{}', { status: 200 })),
    });

    await expect(client.getHealth()).rejects.toBeInstanceOf(ApiClientError);
  });
});
