import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DocumentUploadForm } from '../src/features/uploads/document-upload-form';

const { createUploadIntent, createDocument } = vi.hoisted(() => ({
  createUploadIntent: vi.fn(),
  createDocument: vi.fn(),
}));

vi.mock('../src/shared/api/api-client', () => ({
  apiClient: { createUploadIntent, createDocument },
}));

describe('DocumentUploadForm', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });
  it('validates a selected file before any API request', () => {
    render(<DocumentUploadForm />);
    const input = screen.getByLabelText('Chọn tệp');
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByRole('alert')).toHaveTextContent('Chỉ hỗ trợ tệp PDF hoặc DOCX');
    expect(screen.getByRole('button', { name: 'Tải tài liệu' })).toBeDisabled();
    expect(createUploadIntent).not.toHaveBeenCalled();
  });

  it('creates a document only after a successful direct PUT', async () => {
    const put = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', put);
    createUploadIntent.mockResolvedValue({
      uploadUrl: 'https://example.test/signed-upload',
      storageKey: 'uploads/test.pdf',
      method: 'PUT',
      expiresAt: '2026-09-08T00:00:00.000Z',
      requiredHeaders: { 'content-type': 'application/pdf' },
    });
    createDocument.mockResolvedValue({ id: 'document-1', originalName: 'test.pdf' });
    render(<DocumentUploadForm />);
    const file = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Chọn tệp'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Tải tài liệu' }));

    await waitFor(() =>
      expect(createDocument).toHaveBeenCalledWith({
        storageKey: 'uploads/test.pdf',
        originalFilename: 'test.pdf',
        mimeType: 'application/pdf',
        fileSize: 3,
      }),
    );
    expect(put).toHaveBeenCalledWith('https://example.test/signed-upload', {
      method: 'PUT',
      headers: { 'content-type': 'application/pdf' },
      body: file,
    });
    expect(await screen.findByText('Đã tạo tài liệu: test.pdf.')).toBeInTheDocument();
  });

  it('does not create a document when PUT fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
    createUploadIntent.mockResolvedValue({
      uploadUrl: 'https://example.test/signed-upload',
      storageKey: 'uploads/test.pdf',
      method: 'PUT',
      expiresAt: '2026-09-08T00:00:00.000Z',
      requiredHeaders: { 'content-type': 'application/pdf' },
    });
    render(<DocumentUploadForm />);
    fireEvent.change(screen.getByLabelText('Chọn tệp'), {
      target: { files: [new File(['pdf'], 'test.pdf', { type: 'application/pdf' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tải tài liệu' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 403');
    expect(createDocument).not.toHaveBeenCalled();
  });
});
