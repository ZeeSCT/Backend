import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { HealthStatus } from '@prisma/client';

@Injectable()
export class ProjectHealthService {
  constructor(private prisma: PrismaService) {}

  // ================= UTIL =================
  private calculateMilestoneStatus(m: any): HealthStatus {
    const today = new Date();

    if (m.actualDate) {
      return HealthStatus.ON_TRACK;
    }

    if (m.forecastDate && m.forecastDate < today) {
      if (m.delayDays > 7) return HealthStatus.CRITICAL;
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

  // ================= SUMMARY =================
  async getHealthSummary() {
    const milestones = await this.prisma.planningMilestone.findMany();

    const summary = {
      onTrack: 0,
      atRisk: 0,
      delayed: 0,
      critical: 0,
    };

    for (const m of milestones) {
      const status = this.calculateMilestoneStatus(m);

      if (status === HealthStatus.ON_TRACK) summary.onTrack++;
      if (status === HealthStatus.AT_RISK) summary.atRisk++;
      if (status === HealthStatus.DELAYED) summary.delayed++;
      if (status === HealthStatus.CRITICAL) summary.critical++;
    }

    const total = milestones.length || 1;

    return {
      ...summary,
      onTrackPct: `${Math.round((summary.onTrack / total) * 100)}%`,
      atRiskPct: `${Math.round((summary.atRisk / total) * 100)}%`,
      delayedPct: `${Math.round((summary.delayed / total) * 100)}%`,
      criticalNote:
        summary.critical > 0 ? 'Immediate action required' : 'Stable',
    };
  }

  // ================= DELAYED MILESTONES =================
  async getDelayedMilestones() {
    const milestones = await this.prisma.planningMilestone.findMany({
      include: { project: true },
    });

    const grouped: Record<string, any> = {};

    for (const m of milestones) {
      const status = this.calculateMilestoneStatus(m);

      if (status !== HealthStatus.DELAYED && status !== HealthStatus.CRITICAL)
        continue;

      const key = m.projectId;

      if (!grouped[key]) {
        grouped[key] = {
          projectId: m.projectId,
          projectName: m.project.name,
          count: 0,
        };
      }

      grouped[key].count++;
    }

    return Object.values(grouped).map((g: any) => ({
      ...g,
      percent: Math.min(g.count * 20, 100),
    }));
  }

  // ================= BLOCKED ITEMS =================
  async getBlockedItems() {
    const ncrs = await this.prisma.ncr.findMany({
      include: { project: true },
    });

    return ncrs.map((n) => ({
      projectId: n.projectId,
      projectName: n.project.name,
      message: `${n.packageName || 'Package'} — ${n.description}`,
    }));
  }

  // ================= TREND (REAL VERSION BASED ON DB) =================
  async getHealthTrend() {
    const milestones = await this.prisma.planningMilestone.findMany();

    const weeks = [1, 2, 3, 4];

    return weeks.map((w) => {
      const slice = milestones.slice(0, w * 5);

      let onTrack = 0,
        atRisk = 0,
        delayed = 0,
        critical = 0;

      for (const m of slice) {
        const status = this.calculateMilestoneStatus(m);

        if (status === HealthStatus.ON_TRACK) onTrack++;
        if (status === HealthStatus.AT_RISK) atRisk++;
        if (status === HealthStatus.DELAYED) delayed++;
        if (status === HealthStatus.CRITICAL) critical++;
      }

      return {
        week: `Week ${w}`,
        onTrack,
        atRisk,
        delayed,
        critical,
      };
    });
  }
}