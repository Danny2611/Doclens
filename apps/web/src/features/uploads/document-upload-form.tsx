import type { ChangeEvent, JSX } from 'react';
import { useState } from 'react';

import { apiClient } from '../../shared/api/api-client';
import { validateBrowserDocumentFile } from './browser-file-validation';
import { useDocumentUpload } from './use-document-upload';

const acceptedTypes = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function DocumentUploadForm(): JSX.Element {
  const [file, setFile] = useState<File>();
  const [selectionError, setSelectionError] = useState<string>();
  const upload = useDocumentUpload({ apiClient });

  function selectFile(event: ChangeEvent<HTMLInputElement>): void {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile);
    setSelectionError(selectedFile ? validateBrowserDocumentFile(selectedFile) : undefined);
  }

  return (
    <section className="mt-6 border-t border-slate-200 pt-6" aria-labelledby="upload-title">
      <h2 id="upload-title" className="text-lg font-semibold">Tải tài liệu lên</h2>
      <p className="mt-1 text-sm text-slate-600">Hỗ trợ PDF hoặc DOCX, tối đa 20 MB.</p>
      <label className="mt-4 block text-sm font-medium" htmlFor="document-file">Chọn tệp</label>
      <input id="document-file" className="mt-1 block w-full" type="file" accept={acceptedTypes} onChange={selectFile} disabled={upload.isSubmitting} />
      {selectionError ? <p className="mt-2 text-sm text-red-700" role="alert">{selectionError}</p> : null}
      <button className="mt-4 rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50" type="button" disabled={!file || !!selectionError || upload.isSubmitting} onClick={() => file && void upload.upload(file)}>
        {upload.isSubmitting ? 'Đang tải lên…' : 'Tải tài liệu'}
      </button>
      {upload.state !== 'idle' && upload.state !== 'error' && upload.state !== 'success' ? <p className="mt-2 text-sm" role="status">Đang xử lý: {upload.state}.</p> : null}
      {upload.error ? <p className="mt-2 text-sm text-red-700" role="alert">{upload.error}</p> : null}
      {upload.document ? <p className="mt-2 text-sm text-green-700" role="status">Đã tạo tài liệu: {upload.document.originalName}.</p> : null}
    </section>
  );
}
