import { UploadErrorCode, validateDocumentFileMetadata } from '@doclens/domain';

export function validateBrowserDocumentFile(file: File): string | undefined {
  const result = validateDocumentFileMetadata({
    originalFilename: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });

  if (result.ok) return undefined;

  switch (result.error.code) {
    case UploadErrorCode.EMPTY_FILE:
      return 'Tệp không được để trống.';
    case UploadErrorCode.FILE_TOO_LARGE:
      return 'Tệp vượt quá giới hạn 20 MB.';
    case UploadErrorCode.UNSUPPORTED_FILE_EXTENSION:
    case UploadErrorCode.UNSUPPORTED_MIME_TYPE:
    case UploadErrorCode.DOCUMENT_TYPE_MISMATCH:
      return 'Chỉ hỗ trợ tệp PDF hoặc DOCX với đúng định dạng.';
    default:
      return 'Metadata của tệp không hợp lệ.';
  }
}
