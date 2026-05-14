import { Type } from "class-transformer";
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AssignResourceDto {
  @ApiProperty({
    example: "clx_resource_id",
  })
  @IsString()
  resourceId!: string;

  @ApiProperty({
    example: 50,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  allocationPercent!: number;

  @ApiProperty({
    example: "2026-05-11",
  })
  @IsDateString()
  plannedStart!: string;

  @ApiProperty({
    example: "2026-05-23",
  })
  @IsDateString()
  plannedFinish!: string;

  @ApiPropertyOptional({
    example: 96,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  plannedHours?: number;

  @ApiPropertyOptional({
    example: "Assign for controller cabinet installation.",
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}