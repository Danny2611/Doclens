import type { SupportedDocumentType } from '@doclens/domain';

export interface DocumentResponse {
  id: string;
  originalName: string;
  documentType: SupportedDocumentType;
  mimeType: string;
  fileSize: number;
  status: string;
  pageCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListResponse {
  data: DocumentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
