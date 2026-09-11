import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../../shared/api/api-client';
import { documentQueryKeys } from '../api/document-query-keys';

export function useDocumentsQuery(page: number, limit = 20) {
  return useQuery({ queryKey: documentQueryKeys.list(page, limit), queryFn: () => apiClient.listDocuments(page, limit) });
}

export function useDocumentQuery(id: string) {
  return useQuery({ queryKey: documentQueryKeys.detail(id), queryFn: () => apiClient.getDocument(id), enabled: Boolean(id) });
}
