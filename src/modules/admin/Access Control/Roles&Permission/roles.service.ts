import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateRolePermissionDto } from "./dto/create-role-permission.dto";
import { UpdateRolePermissionDto } from "./dto/update-role-permission.dto";

@Injectable()
export class RolePermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rolePermission.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByRole(role: UserRole) {
    const permission = await this.prisma.rolePermission.findUnique({
      where: { role },
    });

    if (!permission) {
      throw new NotFoundException("Role permission not found");
    }

    return permission;
  }

  async create(dto: CreateRolePermissionDto) {
    const existing = await this.prisma.rolePermission.findUnique({
      where: { role: dto.role },
    });

    if (existing) {
      throw new BadRequestException("Permission already exists for this role");
    }

    return this.prisma.rolePermission.create({
      data: {
        ...dto,
      },
    });
  }

  async update(id: string, dto: UpdateRolePermissionDto) {
    const existing = await this.prisma.rolePermission.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Role permission not found");
    }

    return this.prisma.rolePermission.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.rolePermission.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Role permission not found");
    }

    await this.prisma.rolePermission.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Role permission deleted successfully",
    };
  }

  async seedDefaults() {
    const defaults: CreateRolePermissionDto[] = [
      {
        role: UserRole.SUPER_ADMIN,
        adminView: true,
        adminCreate: true,
        adminEdit: true,
        adminDelete: true,
        executiveDashboardView: true,
        pmDashboardView: true,
        projectView: true,
        projectCreate: true,
        projectEdit: true,
        projectDelete: true,
        planningView: true,
        planningCreate: true,
        planningEdit: true,
        planningDelete: true,
      },
      {
        role: UserRole.PROJECT_MANAGER,
        adminView: false,
        adminCreate: false,
        adminEdit: false,
        adminDelete: false,
        executiveDashboardView: false,
        pmDashboardView: true,
        projectView: true,
        projectCreate: true,
        projectEdit: true,
        projectDelete: true,
        planningView: true,
        planningCreate: true,
        planningEdit: true,
        planningDelete: true,
      },
      {
        role: UserRole.ENGINEER,
        adminView: false,
        adminCreate: false,
        adminEdit: false,
        adminDelete: false,
        executiveDashboardView: false,
        pmDashboardView: true,
        projectView: true,
        projectCreate: false,
        projectEdit: true,
        projectDelete: false,
        planningView: true,
        planningCreate: false,
        planningEdit: false,
        planningDelete: false,
      },
      {
        role: UserRole.ADMIN,
        adminView: false,
        adminCreate: false,
        adminEdit: false,
        adminDelete: false,
        executiveDashboardView: true,
        pmDashboardView: false,
        projectView: false,
        projectCreate: false,
        projectEdit: false,
        projectDelete: false,
        planningView: false,
        planningCreate: false,
        planningEdit: false,
        planningDelete: false,
      },
    ];

    for (const permission of defaults) {
      await this.prisma.rolePermission.upsert({
        where: { role: permission.role },
        update: permission,
        create: permission,
      });
    }

    return {
      success: true,
      message: "Default role permissions seeded successfully",
    };
  }
}