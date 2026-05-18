import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class PutDocumentStatusDto {
  @ApiPropertyOptional({
    description: "Optional. If provided, the existing document is updated by id.",
  })
  @IsOptional()
  @IsString()
  id?: string;

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

  @ApiProperty({ example: "ITS-DRW-001" })
  @IsString()
  documentNo!: string;

  @ApiProperty({ example: "Traffic Signal Controller Cabinet Layout" })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    example: "Traffic Signal Controller Cabinet Layout.pdf",
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ example: "R03" })
  @IsOptional()
  @IsString()
  revision?: string;

  @ApiPropertyOptional({ example: "design" })
  @IsOptional()
  @IsString()
  stageCode?: string;

  @ApiPropertyOptional({ example: "its" })
  @IsOptional()
  @IsString()
  disciplineCode?: string;

  @ApiPropertyOptional({ example: "engineering" })
  @IsOptional()
  @IsString()
  ownerCode?: string;

  @ApiPropertyOptional({ example: "under-review" })
  @IsOptional()
  @IsString()
  workflowStatusCode?: string;

  @ApiPropertyOptional({ example: "client-pending" })
  @IsOptional()
  @IsString()
  approvalStatusCode?: string;

  @ApiPropertyOptional({ example: "2026-03-18" })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 68 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  progressPct?: number;

  @ApiPropertyOptional({ example: "Comment received" })
  @IsOptional()
  @IsString()
  lastUpdate?: string;

  @ApiPropertyOptional({
    example: "Pending client comments on cabinet layout.",
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ example: "Document Controller" })
  @IsOptional()
  @IsString()
  uploadedBy?: string;
}