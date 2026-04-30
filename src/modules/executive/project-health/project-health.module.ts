import { Module } from '@nestjs/common';
import { ProjectHealthController } from './project-health.controller';
import { ProjectHealthService } from './project-health.service';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [ProjectHealthController],
  providers: [ProjectHealthService, PrismaService],
})
export class ProjectHealthModule {}