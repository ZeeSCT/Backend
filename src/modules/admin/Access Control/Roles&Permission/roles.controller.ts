import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { SuperAdminGuard } from "@/common/guards/super-admin.guard";
import { RolePermissionsService } from "./roles.service";
import { CreateRolePermissionDto } from "./dto/create-role-permission.dto";
import { UpdateRolePermissionDto } from "./dto/update-role-permission.dto";

@ApiTags("Role Permissions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller("/roles")
export class RolePermissionsController {
  constructor(private readonly service: RolePermissionsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":role")
  findByRole(@Param("role") role: UserRole) {
    return this.service.findByRole(role);
  }

  @Post()
  create(@Body() dto: CreateRolePermissionDto) {
    return this.service.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateRolePermissionDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.service.delete(id);
  }

  @Post("seed/defaults")
  seedDefaults() {
    return this.service.seedDefaults();
  }
}