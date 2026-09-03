export type HealthResponse = {
  status: 'ok';
  service: 'api';
};

export class ApiClientError extends Error {}

type FetchImplementation = typeof fetch;

type ApiClientOptions = {
  baseUrl?: string;
  fetchImplementation?: FetchImplementation;
};

const defaultApiBaseUrl = 'http://localhost:3000/api/v1';

function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const baseUrl = configuredUrl || defaultApiBaseUrl;

  try {
    return new URL(baseUrl).toString().replace(/\/$/, '');
  } catch {
    throw new Error('VITE_API_BASE_URL must be a valid absolute URL.');
  }
}

function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Record<string, unknown>;
  return response.status === 'ok' && response.service === 'api';
}

export function createApiClient({
  baseUrl = getApiBaseUrl(),
  fetchImplementation = fetch,
}: ApiClientOptions = {}) {
  return {
    async getHealth(): Promise<HealthResponse> {
      let response: Response;

      try {
        response = await fetchImplementation(`${baseUrl}/health`, {
          headers: { Accept: 'application/json' },
        });
      } catch {
        throw new ApiClientError('Unable to connect to the DocLens API.');
      }

      if (!response.ok) {
        throw new ApiClientError(`The DocLens API returned HTTP ${response.status}.`);
      }

      const payload: unknown = await response.json();
      if (!isHealthResponse(payload)) {
        throw new ApiClientError('The DocLens API returned an invalid health response.');
      }

      return payload;
    },
  };
}

export const apiClient = createApiClient();
