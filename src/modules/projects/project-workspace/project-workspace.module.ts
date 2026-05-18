import { Module } from "@nestjs/common";
import { PrismaModule } from "@/common/prisma/prisma.module";
import { ProjectWorkspaceController } from "./project-workspace.controller";
import { ProjectWorkspaceService } from "./project-workspace.service";

@Module({
  imports: [PrismaModule],
  providers: [ProjectWorkspaceService],
  exports: [ProjectWorkspaceService],
})
export class ProjectWorkspaceModule {}