import { Module } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { ResourceAssignmentController } from "./resource-assignment.controller";
import { ResourceAssignmentService } from "./resource-assignment.service";

@Module({
  controllers: [ResourceAssignmentController],
  providers: [ResourceAssignmentService, PrismaService],
})
export class ResourceAssignmentModule {}