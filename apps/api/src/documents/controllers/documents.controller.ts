import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import type {
  CreateDocumentRequest,
  DocumentListResponse,
  DocumentResponse,
  CreateUploadIntentRequest,
  CreateUploadIntentResponse,
} from '@doclens/contracts';

import { CreateDocumentRequestPipe } from '../dto/create-document.dto';
import { DocumentIdPipe } from '../dto/document-id.dto';
import { ListDocumentsQueryPipe, type ListDocumentsQuery } from '../dto/list-documents.query';
import { CreateUploadIntentRequestPipe } from '../dto/create-upload-url.dto';
import { DocumentsService } from '../services/documents.service';
import { DocumentUploadService } from '../services/document-upload.service';
import { DocumentProcessingRequestService } from '../services/document-processing-request.service';
import type { ProcessDocumentResponse } from '@doclens/contracts';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentUploadService: DocumentUploadService,
    private readonly documentsService: DocumentsService,
    private readonly documentProcessingRequestService: DocumentProcessingRequestService,
  ) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  createUploadIntent(
    @Body(new CreateUploadIntentRequestPipe()) request: CreateUploadIntentRequest,
  ): Promise<CreateUploadIntentResponse> {
    return this.documentUploadService.createUploadIntent(request);
  }

  @Post(':id/process')
  @HttpCode(HttpStatus.ACCEPTED)
  processDocument(@Param('id', new DocumentIdPipe()) id: string): Promise<ProcessDocumentResponse> {
    return this.documentProcessingRequestService.request(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createDocument(
    @Body(new CreateDocumentRequestPipe()) request: CreateDocumentRequest,
  ): Promise<DocumentResponse> {
    return this.documentsService.createDocument(request);
  }

  @Get()
  listDocuments(
    @Query(new ListDocumentsQueryPipe()) query: ListDocumentsQuery,
  ): Promise<DocumentListResponse> {
    return this.documentsService.listDocuments(query);
  }

  @Get(':id')
  getDocument(@Param('id', new DocumentIdPipe()) id: string): Promise<DocumentResponse> {
    return this.documentsService.getDocument(id);
  }
}
