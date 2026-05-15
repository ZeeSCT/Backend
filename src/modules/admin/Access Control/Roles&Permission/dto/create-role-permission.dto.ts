import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { UserRole } from "@prisma/client";

export class CreateRolePermissionDto {
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsBoolean()
  adminView?: boolean;

  @IsOptional()
  @IsBoolean()
  adminCreate?: boolean;

  @IsOptional()
  @IsBoolean()
  adminEdit?: boolean;

  @IsOptional()
  @IsBoolean()
  adminDelete?: boolean;

  @IsOptional()
  @IsBoolean()
  executiveDashboardView?: boolean;

  @IsOptional()
  @IsBoolean()
  pmDashboardView?: boolean;

  @IsOptional()
  @IsBoolean()
  projectView?: boolean;

  @IsOptional()
  @IsBoolean()
  projectCreate?: boolean;

  @IsOptional()
  @IsBoolean()
  projectEdit?: boolean;

  @IsOptional()
  @IsBoolean()
  projectDelete?: boolean;

  @IsOptional()
  @IsBoolean()
  planningView?: boolean;

  @IsOptional()
  @IsBoolean()
  planningCreate?: boolean;

  @IsOptional()
  @IsBoolean()
  planningEdit?: boolean;

  @IsOptional()
  @IsBoolean()
  planningDelete?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}