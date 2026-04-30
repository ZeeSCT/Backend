import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { HealthStatus } from '@prisma/client';

@Injectable()
export class ProjectHealthEngine {
  constructor(private prisma: PrismaService) {}

  // ================= CORE ENGINE =================
  async recalculateProjectHealth(projectId: string) {
    const milestones = await this.prisma.planningMilestone.findMany({
      where: { projectId },
    });

    const total = milestones.length || 1;

    const completed = milestones.filter(m => m.actualDate !== null).length;
    const delayed = milestones.filter(m => m.delayDays > 0).length;
    const critical = milestones.filter(m => m.delayDays > 7).length;

    const completionPct = Math.round((completed / total) * 100);

    // ================= RULE ENGINE =================
    let status: HealthStatus = HealthStatus.ON_TRACK;

    if (critical > 0 || completionPct < 40) {
      status = HealthStatus.CRITICAL;
    } 
    else if (delayed > total * 0.3 || completionPct < 70) {
      status = HealthStatus.DELAYED;
    } 
    else if (delayed > 0) {
      status = HealthStatus.AT_RISK;
    }

    // ================= UPDATE PROJECT =================
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        healthStatus: status,
      },
    });

    return {
      projectId,
      status,
      completionPct,
      delayed,
      critical,
    };
  }
}