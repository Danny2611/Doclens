import type { JSX } from 'react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { BackendConnectionStatus } from '../shared/components/backend-connection-status';
import { DocumentUploadForm } from '../features/uploads/document-upload-form';
import { DocumentList } from '../features/documents/components/document-list';
import { useDocumentsQuery } from '../features/documents/hooks/document.queries';
import { documentQueryKeys } from '../features/documents/api/document-query-keys';

export function DocumentLibraryPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const documents = useDocumentsQuery(page);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-8 text-slate-800">
      <section
        aria-labelledby="page-title"
        className="w-full max-w-2xl rounded-xl border border-slate-300 bg-white p-8"
      >
        <p className="m-0 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Document intelligence
        </p>
        <h1 id="page-title" className="my-2 text-3xl font-bold">
          DocLens
        </h1>
        <p className="mb-6 mt-0 text-slate-600">
          Nền tảng giúp bạn hiểu tài liệu dài bằng các bản tóm tắt có thể kiểm chứng.
        </p>
        <BackendConnectionStatus />
        <DocumentUploadForm onSuccess={(document) => {
          void queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });
          void navigate(`/documents/${document.id}`);
        }} />
        <section className="mt-8 border-t border-slate-200 pt-6" aria-labelledby="documents-title">
          <h2 id="documents-title" className="text-lg font-semibold">Tài liệu</h2>
          {documents.isPending ? <p role="status">Đang tải danh sách tài liệu…</p> : null}
          {documents.isError ? <p role="alert">Không thể tải danh sách tài liệu. Hãy thử lại.</p> : null}
          {documents.data?.data.length === 0 ? <p>Chưa có tài liệu nào.</p> : null}
          {documents.data?.data.length ? <><DocumentList documents={documents.data.data} /><nav className="mt-4 flex items-center gap-2" aria-label="Phân trang"><button className="rounded border px-3 py-1 disabled:opacity-50" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Trước</button><span>Trang {documents.data.pagination.page} / {documents.data.pagination.totalPages}</span><button className="rounded border px-3 py-1 disabled:opacity-50" type="button" disabled={page >= documents.data.pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Sau</button></nav></> : null}
          {documents.isFetching && documents.data ? <p className="text-sm" role="status">Đang làm mới danh sách…</p> : null}
        </section>
      </section>
    </main>
  );
}
