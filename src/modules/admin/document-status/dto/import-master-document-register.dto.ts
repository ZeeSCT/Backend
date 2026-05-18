import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ImportMasterDocumentRegisterDto {
  @ApiPropertyOptional({
    description: "Either projectId or projectCode is required.",
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    description: "Either projectId or projectCode is required.",
    example: "PRJ-001",
  })
  @IsOptional()
  @IsString()
  projectCode?: string;

  @ApiPropertyOptional({
    example: "pre-construction",
    description: "Default stage used for imported document register records.",
  })
  @IsOptional()
  @IsString()
  stageCode?: string;

  @ApiPropertyOptional({
    example: "Document Controller",
  })
  @IsOptional()
  @IsString()
  uploadedBy?: string;
}