import { Module } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService],
})
export class ProjectsMasterModule {}