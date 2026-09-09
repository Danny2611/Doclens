import type { JSX } from 'react';

import { BackendConnectionStatus } from '../shared/components/backend-connection-status';
import { DocumentUploadForm } from '../features/uploads/document-upload-form';

export function DocumentLibraryPage(): JSX.Element {
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
        <DocumentUploadForm />
      </section>
    </main>
  );
}
