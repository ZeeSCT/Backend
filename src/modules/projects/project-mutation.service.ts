import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ProjectMutationService {
  constructor(private prisma: PrismaService) {}

  async updateProject(id: string, data: any) {
    const existing = await this.prisma.project.findUnique({
      where: { id },
    });

    const updated = await this.prisma.project.update({
      where: { id },
      data,
    });

    // 🚨 EVENT-BASED HISTORY TRACKING
    if (
      existing &&
      data.healthStatus &&
      existing.healthStatus !== data.healthStatus
    ) {
      await this.prisma.projectHealthHistory.create({
        data: {
          projectId: id,
          oldStatus: existing.healthStatus,
          newStatus: data.healthStatus,
          changedAt: new Date(),
        },
      });
    }

    return updated;
  }
}