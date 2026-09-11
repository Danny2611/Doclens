import type {
  CreateDocumentRequest,
  CreateUploadIntentRequest,
  CreateUploadIntentResponse,
  DocumentListResponse,
  DocumentResponse,
} from '@doclens/contracts';

export type HealthResponse = {
  status: 'ok';
  service: 'api';
};

export class ApiClientError extends Error {
  constructor(message: string, readonly code?: string, readonly status?: number) {
    super(message);
  }
}

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

function isUploadIntentResponse(value: unknown): value is CreateUploadIntentResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Record<string, unknown>;
  return (
    typeof response.uploadUrl === 'string' &&
    typeof response.storageKey === 'string' &&
    response.method === 'PUT' &&
    typeof response.expiresAt === 'string' &&
    !!response.requiredHeaders &&
    typeof response.requiredHeaders === 'object'
  );
}

function isDocumentResponse(value: unknown): value is DocumentResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Record<string, unknown>;
  return typeof response.id === 'string' && typeof response.originalName === 'string';
}

function isDocumentListResponse(value: unknown): value is DocumentListResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Record<string, unknown>;
  return Array.isArray(response.data) && !!response.pagination && typeof response.pagination === 'object';
}

async function getErrorCode(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && typeof (body as Record<string, unknown>).code === 'string') {
      return (body as Record<string, string>).code;
    }
  } catch {
    // The response body is optional for an API failure.
  }
  return undefined;
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

    async createUploadIntent(request: CreateUploadIntentRequest): Promise<CreateUploadIntentResponse> {
      const response = await requestJson(`${baseUrl}/documents/upload-url`, request, fetchImplementation);
      const payload: unknown = await response.json();
      if (!isUploadIntentResponse(payload)) {
        throw new ApiClientError('The DocLens API returned an invalid upload intent response.');
      }
      return payload;
    },

    async createDocument(request: CreateDocumentRequest): Promise<DocumentResponse> {
      const response = await requestJson(`${baseUrl}/documents`, request, fetchImplementation);
      const payload: unknown = await response.json();
      if (!isDocumentResponse(payload)) {
        throw new ApiClientError('The DocLens API returned an invalid document response.');
      }
      return payload;
    },

    async listDocuments(page = 1, limit = 20): Promise<DocumentListResponse> {
      const response = await requestGet(`${baseUrl}/documents?page=${page}&limit=${limit}`, fetchImplementation);
      const payload: unknown = await response.json();
      if (!isDocumentListResponse(payload)) throw new ApiClientError('The DocLens API returned an invalid document list response.');
      return payload;
    },

    async getDocument(id: string): Promise<DocumentResponse> {
      const response = await requestGet(`${baseUrl}/documents/${encodeURIComponent(id)}`, fetchImplementation);
      const payload: unknown = await response.json();
      if (!isDocumentResponse(payload)) throw new ApiClientError('The DocLens API returned an invalid document response.');
      return payload;
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

async function requestJson(
  url: string,
  body: unknown,
  fetchImplementation: FetchImplementation,
): Promise<Response> {
  let response: Response;
  try {
    response = await fetchImplementation(url, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiClientError('Unable to connect to the DocLens API.');
  }
  if (!response.ok) {
    throw new ApiClientError(`The DocLens API returned HTTP ${response.status}.`, await getErrorCode(response), response.status);
  }
  return response;
}

async function requestGet(url: string, fetchImplementation: FetchImplementation): Promise<Response> {
  let response: Response;
  try {
    response = await fetchImplementation(url, { headers: { Accept: 'application/json' } });
  } catch {
    throw new ApiClientError('Unable to connect to the DocLens API.');
  }
  if (!response.ok) throw new ApiClientError(`The DocLens API returned HTTP ${response.status}.`, await getErrorCode(response), response.status);
  return response;
}

export const apiClient = createApiClient();
