import { Module } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { RolePermissionsController } from "./roles.controller";
import { RolePermissionsService } from "./roles.service";

@Module({
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService, PrismaService],
  exports: [RolePermissionsService],
})
export class RolePermissionsModule {}