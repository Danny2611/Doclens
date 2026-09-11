import type { DocumentResponse } from '@doclens/contracts';
import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { DocumentStatusBadge } from './document-status-badge';

function size(bytes: number): string { return `${(bytes / 1024).toFixed(bytes < 1024 * 1024 ? 1 : 2)} KB`; }

export function DocumentList({ documents }: { documents: DocumentResponse[] }): JSX.Element {
  return <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
    {documents.map((document) => <li key={document.id} className="py-4">
      <Link className="block rounded focus:outline-none focus:ring-2 focus:ring-slate-600" to={`/documents/${document.id}`}>
        <div className="flex items-center justify-between gap-3"><span className="font-medium">{document.originalName}</span><DocumentStatusBadge status={document.status} /></div>
        <p className="mt-1 text-sm text-slate-600">{document.documentType} · {size(document.fileSize)} · {new Date(document.createdAt).toLocaleString()}</p>
      </Link>
    </li>)}
  </ul>;
}
