import type { JSX } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClientError } from '../shared/api/api-client';
import { DocumentStatusBadge } from '../features/documents/components/document-status-badge';
import { useDocumentQuery } from '../features/documents/hooks/document.queries';

export function DocumentDetailPage(): JSX.Element {
  const { documentId = '' } = useParams();
  const query = useDocumentQuery(documentId);
  if (!documentId) return <main className="p-8"><p role="alert">Document ID không hợp lệ.</p></main>;
  if (query.isPending) return <main className="p-8"><p role="status">Đang tải tài liệu…</p></main>;
  if (query.isError) {
    const notFound = query.error instanceof ApiClientError && query.error.status === 404;
    return <main className="p-8"><p role="alert">{notFound ? 'Không tìm thấy tài liệu.' : 'Không thể tải tài liệu. Hãy thử lại.'}</p><Link to="/">Quay lại thư viện</Link></main>;
  }
  const document = query.data;
  return <main className="mx-auto max-w-2xl p-8"><Link className="text-sm underline" to="/">← Thư viện tài liệu</Link><h1 className="mt-6 text-3xl font-bold">{document.originalName}</h1><div className="mt-4"><DocumentStatusBadge status={document.status} /></div><dl className="mt-6 grid gap-3 text-sm"><div><dt className="font-medium">Loại</dt><dd>{document.documentType}</dd></div><div><dt className="font-medium">Dung lượng</dt><dd>{document.fileSize} bytes</dd></div>{document.pageCount !== null ? <div><dt className="font-medium">Số trang</dt><dd>{document.pageCount}</dd></div> : null}<div><dt className="font-medium">Tạo lúc</dt><dd>{new Date(document.createdAt).toLocaleString()}</dd></div></dl></main>;
}
