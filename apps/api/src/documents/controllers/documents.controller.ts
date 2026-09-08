import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type {
  CreateUploadIntentRequest,
  CreateUploadIntentResponse,
} from '@doclens/contracts';

import { CreateUploadIntentRequestPipe } from '../dto/create-upload-url.dto';
import { DocumentUploadService } from '../services/document-upload.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentUploadService: DocumentUploadService) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  createUploadIntent(
    @Body(new CreateUploadIntentRequestPipe()) request: CreateUploadIntentRequest,
  ): Promise<CreateUploadIntentResponse> {
    return this.documentUploadService.createUploadIntent(request);
  }
}
