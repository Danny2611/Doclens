import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  CreateDocumentRequest,
  DocumentListResponse,
  DocumentResponse,
} from '@doclens/contracts';
import { DocumentErrorCode } from '@doclens/contracts';
import { PrismaService } from '@doclens/database';
import { validateDocumentFileMetadata } from '@doclens/domain';
import { StorageError, StorageErrorCode, type StorageProvider } from '@doclens/storage';

import type { ListDocumentsQuery } from '../dto/list-documents.query';
import { presentDocument } from '../presenters/document.presenter';
import { STORAGE_PROVIDER } from '../storage-provider.token';

const SERVER_GENERATED_STORAGE_KEY = /^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async createDocument(request: CreateDocumentRequest): Promise<DocumentResponse> {
    this.validateStorageKey(request.storageKey);

    const existingDocument = await this.findDocumentByStorageKey(request.storageKey);

    if (existingDocument) {
      return presentDocument(existingDocument);
    }

    this.validateDeclaredFileMetadata(request);

    const actualMetadata = await this.retrieveObjectMetadata(request.storageKey);
    this.validateActualObjectMetadata(request, actualMetadata);

    try {
      const document = await this.prisma.document.create({
        data: {
          storageKey: request.storageKey,
          originalName: request.originalFilename,
          mimeType: request.mimeType,
          fileSize: BigInt(request.fileSize),
          status: 'UPLOADED',
        },
      });

      return presentDocument(document);
    } catch (error) {
      if (isUniqueStorageKeyViolation(error)) {
        const concurrentlyCreatedDocument = await this.findDocumentByStorageKey(request.storageKey);

        if (concurrentlyCreatedDocument) {
          return presentDocument(concurrentlyCreatedDocument);
        }
      }

      throw databaseUnavailable();
    }
  }

  async listDocuments(query: ListDocumentsQuery): Promise<DocumentListResponse> {
    const [documents, total] = await this.executeDatabaseOperation(() =>
      Promise.all([
        this.prisma.document.findMany({
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.document.count(),
      ]),
    );

    return {
      data: documents.map(presentDocument),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getDocument(id: string): Promise<DocumentResponse> {
    const document = await this.executeDatabaseOperation(() =>
      this.prisma.document.findUnique({ where: { id } }),
    );

    if (!document) {
      throw new NotFoundException({
        error: {
          code: DocumentErrorCode.DOCUMENT_NOT_FOUND,
        },
      });
    }

    return presentDocument(document);
  }

  private validateStorageKey(storageKey: string): void {
    if (!SERVER_GENERATED_STORAGE_KEY.test(storageKey)) {
      throw new BadRequestException({
        error: {
          code: DocumentErrorCode.INVALID_STORAGE_OBJECT,
        },
      });
    }
  }

  private validateDeclaredFileMetadata(request: CreateDocumentRequest): void {
    const validation = validateDocumentFileMetadata(request);

    if (!validation.ok) {
      throw new BadRequestException({
        error: {
          code: validation.error.code,
        },
      });
    }
  }

  private async retrieveObjectMetadata(storageKey: string) {
    try {
      return await this.storageProvider.getObjectMetadata({ objectKey: storageKey });
    } catch (error) {
      if (error instanceof StorageError && error.code === StorageErrorCode.OBJECT_NOT_FOUND) {
        throw new NotFoundException({
          error: {
            code: DocumentErrorCode.FILE_NOT_FOUND,
          },
        });
      }

      throw new ServiceUnavailableException({
        error: {
          code: DocumentErrorCode.STORAGE_PROVIDER_UNAVAILABLE,
        },
      });
    }
  }

  private validateActualObjectMetadata(
    request: CreateDocumentRequest,
    actualMetadata: { contentType?: string; contentLength?: number },
  ): void {
    const actualValidation = validateDocumentFileMetadata({
      originalFilename: request.originalFilename,
      mimeType: actualMetadata.contentType ?? '',
      fileSize: actualMetadata.contentLength ?? Number.NaN,
    });

    if (!actualValidation.ok
      || actualMetadata.contentType !== request.mimeType
      || actualMetadata.contentLength !== request.fileSize) {
      throw new BadRequestException({
        error: {
          code: DocumentErrorCode.INVALID_STORAGE_OBJECT,
        },
      });
    }
  }

  private async findDocumentByStorageKey(storageKey: string) {
    return this.executeDatabaseOperation(() =>
      this.prisma.document.findUnique({ where: { storageKey } }),
    );
  }

  private async executeDatabaseOperation<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch {
      throw databaseUnavailable();
    }
  }
}

function isUniqueStorageKeyViolation(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && error.code === 'P2002';
}

function databaseUnavailable(): ServiceUnavailableException {
  return new ServiceUnavailableException({
    error: {
      code: DocumentErrorCode.DATABASE_UNAVAILABLE,
    },
  });
}
