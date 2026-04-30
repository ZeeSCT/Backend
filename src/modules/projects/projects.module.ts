import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectMutationService } from './project-mutation.service';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [ProjectsController],

  providers: [
    ProjectsService,
    ProjectMutationService,
    PrismaService,
  ],

  exports: [
    ProjectsService,
    ProjectMutationService,
  ],
})
export class ProjectsModule {}