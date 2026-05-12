import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { SanitizeString } from "@/common/decorators/sanitize-string.decorator";

export class CreateProjectDto {
  @ApiProperty({ example: "PRJ-001" })
  @SanitizeString({ uppercase: true })
  @IsString()
  @MaxLength(40)
  @Matches(/^[A-Z0-9][A-Z0-9_-]*$/, {
    message:
      "Project code can only contain uppercase letters, numbers, hyphens, and underscores.",
  })
  code!: string;

  @ApiProperty({ example: "Al Barsha MEP Works" })
  @SanitizeString()
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: "EMAAR" })
  @SanitizeString()
  @IsString()
  @MaxLength(120)
  clientName!: string;

  @ApiProperty({
    example: "its",
    description: "Portfolio code like its, traffic, its-maint, traffic-maint",
  })
  @SanitizeString({ lowercase: true })
  @IsString()
  @IsIn(["its", "traffic", "its-maint", "traffic-maint"])
  portfolio!: string;

  @ApiPropertyOptional({ example: "cmor2lwhw000swgjyhxmxqipz" })
  @IsOptional()
  @SanitizeString()
  @IsString()
  @MaxLength(80)
  projectManagerId?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  completionPct?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  plannedProgress?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  actualProgress?: number;
}