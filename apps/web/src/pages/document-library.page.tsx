import type { JSX } from 'react';

import { BackendConnectionStatus } from '../shared/components/backend-connection-status';

export function DocumentLibraryPage(): JSX.Element {
  return (
    <main className="page-shell">
      <section aria-labelledby="page-title" className="document-library">
        <p className="eyebrow">Document intelligence</p>
        <h1 id="page-title">DocLens</h1>
        <p className="description">
          Nền tảng giúp bạn hiểu tài liệu dài bằng các bản tóm tắt có thể kiểm chứng.
        </p>
        <BackendConnectionStatus />
      </section>
    </main>
  );
}
