import { PartialType } from "@nestjs/swagger";
import { PutDocumentStatusDto } from "./put-document-status.dto";

export class PatchDocumentStatusDto extends PartialType(PutDocumentStatusDto) {}