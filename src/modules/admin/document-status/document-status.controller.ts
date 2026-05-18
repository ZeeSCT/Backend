import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImportMasterDocumentRegisterDto } from "./dto/import-master-document-register.dto";
import { MasterDocumentRegisterImportService } from "./master-document-register-import.service";
import { DocumentStatusService } from "./document-status.service";
import { DocumentStatusQueryDto } from "./dto/document-status-query.dto";
import { PatchDocumentStatusDto } from "./dto/patch-document-status.dto";
import { PutDocumentStatusDto } from "./dto/put-document-status.dto";

@ApiTags("Document Status Register")
@ApiBearerAuth()
@Controller("document-status")
export class DocumentStatusController {
  constructor(
    private readonly documentStatusService: DocumentStatusService,
    private readonly masterDocumentRegisterImportService: MasterDocumentRegisterImportService,
  ) {}

  @Post("import-excel")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Import Master Document Register Excel file",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["file", "projectCode"],
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Master Document Register Excel file",
        },
        projectCode: {
          type: "string",
          example: "PRJ-001",
        },
        projectId: {
          type: "string",
          example: "",
        },
        stageCode: {
          type: "string",
          example: "pre-construction",
        },
        uploadedBy: {
          type: "string",
          example: "Document Controller",
        },
      },
    },
  })
  importMasterDocumentRegister(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportMasterDocumentRegisterDto,
  ) {
    return this.masterDocumentRegisterImportService.importExcel(file, dto);
  }

  @Get("lookups")
  @ApiOperation({
    summary: "Get document status register lookup values",
  })
  getLookups() {
    return this.documentStatusService.getLookups();
  }

  @Get("documents")
  @ApiOperation({
    summary: "Get document status register records",
  })
  getDocuments(@Query() query: DocumentStatusQueryDto) {
    return this.documentStatusService.getDocuments(query);
  }

  @Get("documents/:id")
  @ApiOperation({
    summary: "Get one document status register record",
  })
  getDocumentById(@Param("id") id: string) {
    return this.documentStatusService.getDocumentById(id);
  }

  @Put("documents")
  @ApiOperation({
    summary: "Create or replace a document register record",
  })
  putDocument(@Body() dto: PutDocumentStatusDto) {
    return this.documentStatusService.putDocument(dto);
  }

  @Patch("documents/:id")
  @ApiOperation({
    summary: "Partially update a document register record",
  })
  patchDocument(@Param("id") id: string, @Body() dto: PatchDocumentStatusDto) {
    return this.documentStatusService.patchDocument(id, dto);
  }

  @Delete("documents")
  @ApiOperation({
    summary: "Soft delete document register records",
  })
  deleteDocuments(@Query() query: DocumentStatusQueryDto) {
    return this.documentStatusService.deleteDocuments(query);
  }

  @Delete("documents/:id")
  @ApiOperation({
    summary: "Soft delete one document register record",
  })
  deleteDocument(@Param("id") id: string) {
    return this.documentStatusService.deleteDocument(id);
  }
}
