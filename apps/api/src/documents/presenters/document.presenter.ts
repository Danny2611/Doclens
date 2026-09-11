import type { DocumentResponse } from '@doclens/contracts';
import { SUPPORTED_DOCUMENT_TYPES } from '@doclens/domain';

interface PersistedDocument {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: bigint;
  status: string;
  pageCount: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export function presentDocument(document: PersistedDocument): DocumentResponse {
  const documentType = SUPPORTED_DOCUMENT_TYPES.find(
    (supportedType) => supportedType.mimeType === document.mimeType,
  )?.type;

  if (!documentType) {
    throw new Error('Persisted document has an unsupported MIME type.');
  }

  return {
    id: document.id,
    originalName: document.originalName,
    documentType,
    mimeType: document.mimeType,
    fileSize: Number(document.fileSize),
    status: document.status,
    pageCount: document.pageCount,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}
