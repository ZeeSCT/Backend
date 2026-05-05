import { Module } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ProjectHealthController } from './project-health.controller';
import { ProjectHealthService } from './project-health.service';
 
@Module({
  controllers: [ProjectHealthController],
  providers: [ProjectHealthService, PrismaService],
  exports: [ProjectHealthService],
})
export class ProjectHealthModule {}