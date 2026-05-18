import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class DocumentStatusQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  disciplineCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workflowStatusCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  approvalStatusCode?: string;

  @ApiPropertyOptional({
    example: "latest",
    enum: ["latest", "dueDate", "status"],
  })
  @IsOptional()
  @IsString()
  sortBy?: "latest" | "dueDate" | "status";
}