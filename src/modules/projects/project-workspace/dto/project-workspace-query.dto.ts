import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class ProjectWorkspaceQueryDto {
  @ApiPropertyOptional({
    example: "all",
    description:
      "Portfolio category code. Example: all, its, traffic, its-maint, traffic-maint.",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    const nextValue = String(value ?? "").trim();
    return nextValue || "all";
  })
  category?: string = "all";

  @ApiPropertyOptional({
    example: "cmp6xruu90028xcjyz1ov4bvy",
    description: "Selected project id.",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    const nextValue = String(value ?? "").trim();
    return nextValue || undefined;
  })
  projectId?: string;
}