import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { appRoutes } from '../src/app/router';
import { apiClient } from '../src/shared/api/api-client';

vi.mock('../src/shared/api/api-client', () => ({
  apiClient: {
    getHealth: vi.fn(),
  },
}));

function renderRootRoute(): void {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const router = createMemoryRouter(appRoutes, { initialEntries: ['/'] });

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('DocumentLibraryPage', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the Document Library shell and loading state', () => {
    vi.mocked(apiClient.getHealth).mockImplementation(() => new Promise(() => undefined));

    renderRootRoute();

    expect(screen.getByRole('heading', { name: 'DocLens' })).toBeInTheDocument();
    expect(screen.getByText('Đang kiểm tra kết nối backend…')).toBeInTheDocument();
  });

  it('renders the connected state when health succeeds', async () => {
    vi.mocked(apiClient.getHealth).mockResolvedValue({ status: 'ok', service: 'api' });

    renderRootRoute();

    expect(await screen.findByText('Backend đã kết nối: api.')).toBeInTheDocument();
  });

  it('renders the unavailable state when health fails', async () => {
    vi.mocked(apiClient.getHealth).mockRejectedValue(new Error('network unavailable'));

    renderRootRoute();

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể kết nối đến backend.');
  });
});
