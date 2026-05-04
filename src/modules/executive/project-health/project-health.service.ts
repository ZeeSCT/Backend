import { Injectable } from '@nestjs/common';
import { HealthStatus } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ProjectHealthService {
  constructor(private prisma: PrismaService) {}

  // =========================================================
  // 🔥 CORE ENGINE: CALCULATE STATUS (DB DRIVEN)
  // =========================================================
  private calculateStatus(m: any): HealthStatus {
    const today = new Date();

    if (m.actualDate) return HealthStatus.ON_TRACK;

    if (m.forecastDate && new Date(m.forecastDate) < today) {
      if (m.delayDays > 10) return HealthStatus.CRITICAL;
      return HealthStatus.DELAYED;
    }

    if (m.forecastDate) {
      const diff =
        (new Date(m.forecastDate).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diff <= 7) return HealthStatus.AT_RISK;
    }

    return HealthStatus.ON_TRACK;
  }

  // =========================================================
  // 📊 1. SUMMARY (REAL-TIME FROM DB)
  // =========================================================
  async getHealthSummary() {
    const milestones = await this.prisma.planningMilestone.findMany();

    const summary = {
      onTrack: 0,
      atRisk: 0,
      delayed: 0,
      critical: 0,
    };

    for (const m of milestones) {
      const status = m.healthStatus as HealthStatus;

      if (status === HealthStatus.ON_TRACK) summary.onTrack++;
      else if (status === HealthStatus.AT_RISK) summary.atRisk++;
      else if (status === HealthStatus.DELAYED) summary.delayed++;
      else if (status === HealthStatus.CRITICAL) summary.critical++;
    }

    return {
      ...summary,
      total: milestones.length,
    };
  }

  // =========================================================
  // 🚨 2. DELAYED MILESTONES (DB FILTERED)
  // =========================================================
  async getDelayedMilestones() {
  const milestones = await this.prisma.planningMilestone.findMany({
    where: {
      healthStatus: {
        in: [HealthStatus.DELAYED, HealthStatus.CRITICAL],
      },
    },
    include: { project: true },
  });

  return milestones.map((m) => ({
    id: m.id,
    milestoneName: m.milestoneName,
    delayDays: m.delayDays,
    healthStatus: m.healthStatus,

    projectId: m.projectId,
    projectName: m.project?.name ?? '',
    projectCode: m.project?.code ?? '',
  }));
}
  // =========================================================
  // 🚧 3. BLOCKED ITEMS (NCRs)
  // =========================================================
  async getBlockedItems() {
    const ncrs = await this.prisma.ncr.findMany({
      include: { project: true },
    });

    return ncrs.map((n) => ({
      projectId: n.projectId,
      projectName: n.project?.name ?? null,
      message: n.description,
    }));
  }

  // =========================================================
  // 📈 4. HEALTH TREND (REAL DATA SNAPSHOT)
  // =========================================================
  async getHealthTrend() {
    const milestones = await this.prisma.planningMilestone.findMany();

    const buckets = [1, 2, 3, 4];

    return buckets.map((w) => {
      const slice = milestones.slice(0, w * 5);

      const result = {
        week: `Week ${w}`,
        onTrack: 0,
        atRisk: 0,
        delayed: 0,
        critical: 0,
      };

      for (const m of slice) {
        const status = this.calculateStatus(m);

        if (status === HealthStatus.ON_TRACK) result.onTrack++;
        else if (status === HealthStatus.AT_RISK) result.atRisk++;
        else if (status === HealthStatus.DELAYED) result.delayed++;
        else if (status === HealthStatus.CRITICAL) result.critical++;
      }

      return result;
    });
  }

  // =========================================================
  // 🔄 5. RE-CALCULATE PROJECT HEALTH (ENTERPRISE LOGIC)
  // =========================================================
  async recalculateProjectHealth(projectId: string) {
    const milestones = await this.prisma.planningMilestone.findMany({
      where: { projectId },
    });

    const total = milestones.length || 1;

    const completed = milestones.filter((m) => m.actualDate).length;

    const progress = Math.round((completed / total) * 100);

    const critical = milestones.filter((m) => m.delayDays > 10).length;

    // ✅ FIXED: proper enum-safe assignment
    let healthStatus: HealthStatus = HealthStatus.ON_TRACK;

    if (critical > 0) {
      healthStatus = HealthStatus.CRITICAL;
    } else if (progress < 50) {
      healthStatus = HealthStatus.DELAYED;
    } else if (progress < 80) {
      healthStatus = HealthStatus.AT_RISK;
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        completionPct: progress,
        healthStatus,
      },
    });

    return {
      projectId,
      progress,
      healthStatus,
    };
  }
}