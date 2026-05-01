import { Controller, Get, Query } from '@nestjs/common';
import {
  DocumentStatusService,
  DocumentationStage,
  PortfolioCategoryCode,
} from './documentation-status.service';

@Controller('/executive/documentation-status')
export class DocumentStatusController {
  constructor(private readonly documentStatusService: DocumentStatusService) {}

  @Get()
  getDocumentStatus(
    @Query('category') category: PortfolioCategoryCode = 'all',
    @Query('stage') stage: DocumentationStage = 'pre-construction',
  ) {
    return this.documentStatusService.getDocumentStatus(category, stage);
  }
}