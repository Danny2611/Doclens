import type { CreateDocumentRequest, CreateUploadIntentRequest, DocumentResponse } from '@doclens/contracts';
import { useCallback, useRef, useState } from 'react';

import type { ApiClient } from '../../shared/api/api-client';
import { validateBrowserDocumentFile } from './browser-file-validation';

export type UploadState =
  | 'idle'
  | 'validating'
  | 'requesting-upload-intent'
  | 'uploading'
  | 'creating-document'
  | 'success'
  | 'error';

type UploadApiClient = Pick<ApiClient, 'createUploadIntent' | 'createDocument'>;
type FetchImplementation = typeof fetch;

type UseDocumentUploadOptions = {
  apiClient: UploadApiClient;
  fetchImplementation?: FetchImplementation;
};

export function useDocumentUpload({ apiClient, fetchImplementation = fetch }: UseDocumentUploadOptions) {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string>();
  const [document, setDocument] = useState<DocumentResponse>();
  const inProgress = useRef(false);

  const upload = useCallback(async (file: File): Promise<DocumentResponse | undefined> => {
    if (inProgress.current) return undefined;
    inProgress.current = true;
    setError(undefined);
    setDocument(undefined);

    try {
      setState('validating');
      const validationError = validateBrowserDocumentFile(file);
      if (validationError) throw new Error(validationError);

      const metadata: CreateUploadIntentRequest = {
        originalFilename: file.name,
        mimeType: file.type,
        fileSize: file.size,
      };
      setState('requesting-upload-intent');
      const intent = await apiClient.createUploadIntent(metadata);

      setState('uploading');
      const uploadResponse = await fetchImplementation(intent.uploadUrl, {
        method: intent.method,
        headers: intent.requiredHeaders,
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error(`Không thể tải tệp lên kho lưu trữ (HTTP ${uploadResponse.status}).`);
      }

      setState('creating-document');
      const request: CreateDocumentRequest = { ...metadata, storageKey: intent.storageKey };
      const createdDocument = await apiClient.createDocument(request);
      setDocument(createdDocument);
      setState('success');
      return createdDocument;
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Không thể tải tài liệu lên.');
      setState('error');
      return undefined;
    } finally {
      inProgress.current = false;
    }
  }, [apiClient, fetchImplementation]);

  return { state, error, document, upload, isSubmitting: !['idle', 'success', 'error'].includes(state) };
}
