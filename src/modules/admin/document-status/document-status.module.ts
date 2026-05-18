import { Module } from "@nestjs/common";
import { PrismaModule } from "@/common/prisma/prisma.module";
import { DocumentStatusController } from "./document-status.controller";
import { DocumentStatusService } from "./document-status.service";
import { MasterDocumentRegisterExcelParserService } from "./master-document-register-excel-parser.service";
import { MasterDocumentRegisterImportService } from "./master-document-register-import.service";

@Module({
  imports: [PrismaModule],
  controllers: [DocumentStatusController],
  providers: [
    DocumentStatusService,
    MasterDocumentRegisterExcelParserService,
    MasterDocumentRegisterImportService,
  ],
  exports: [
    DocumentStatusService,
    MasterDocumentRegisterImportService,
  ],
})
export class DocumentStatusModule {}