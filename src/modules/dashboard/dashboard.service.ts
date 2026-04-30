import { Injectable } from '@nestjs/common';
import { HealthStatus } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

// =========================================================
// 🔧 CONFIG (CENTRAL RULE ENGINE - EASY TO CHANGE LATER)
// =========================================================
const HEALTH_RULES = {
  CRITICAL_DELAY_DAYS: 10,
  DELAY_THRESHOLD_PERCENT: 30,
  AT_RISK_COMPLETION: 80,
  DELAYED_COMPLETION: 50,
};

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // =========================================================
  // 🔥 UTILITY: STATUS CHECKERS (BEST PRACTICE)
  // =========================================================
  private isBadResourceStatus(status: HealthStatus) {
    return (
      status === HealthStatus.AT_RISK ||
      status === HealthStatus.DELAYED ||
      status === HealthStatus.CRITICAL
    );
  }

  private isBadMilestoneStatus(status: HealthStatus) {
    return (
      status === HealthStatus.DELAYED ||
      status === HealthStatus.CRITICAL
    );
  }

  // =========================================================
  // 🔥 ENGINE: MILESTONE HEALTH CALCULATION
  // =========================================================
  private calculateMilestoneMetrics(milestones: any[]) {
    const total = milestones?.length || 0;

    if (total === 0) {
      return {
        completionPct: 0,
        delayed: 0,
        critical: 0,
        healthStatus: HealthStatus.ON_TRACK,
      };
    }

    const completed = milestones.filter(
      (m) => m.actualDate !== null,
    ).length;

    const delayed = milestones.filter(
      (m) => m.delayDays > 0,
    ).length;

    const critical = milestones.filter(
      (m) =>
        m.healthStatus === HealthStatus.CRITICAL ||
        m.delayDays > HEALTH_RULES.CRITICAL_DELAY_DAYS,
    ).length;

    const completionPct = Math.round(
      (completed / total) * 100,
    );

    // =========================================================
    // 🧠 HEALTH ENGINE (PRODUCTION RULES)
    // =========================================================
    let healthStatus: HealthStatus = HealthStatus.ON_TRACK;

    if (critical > 0) {
      healthStatus = HealthStatus.CRITICAL;
    } else if (
      completionPct < HEALTH_RULES.DELAYED_COMPLETION ||
      delayed > total * HEALTH_RULES.DELAY_THRESHOLD_PERCENT / 100
    ) {
      healthStatus = HealthStatus.DELAYED;
    } else if (
      completionPct < HEALTH_RULES.AT_RISK_COMPLETION ||
      delayed > 0
    ) {
      healthStatus = HealthStatus.AT_RISK;
    }

    return {
      completionPct,
      delayed,
      critical,
      healthStatus,
    };
  }

  // =========================================================
  // 📊 EXECUTIVE DASHBOARD
  // =========================================================
  async executive() {
    const [
      activeProjects,
      delayedMilestones,
      pendingApprovals,
      criticalActivities,
      openNcrs,
      materialShortages,
      tenders,
    ] = await Promise.all([
      this.prisma.project.count({ where: { status: 'ACTIVE' } }),

      this.prisma.planningMilestone.count({
        where: {
          healthStatus: {
            in: [HealthStatus.DELAYED, HealthStatus.CRITICAL],
          },
        },
      }),

      this.prisma.tender.count({
        where: { stage: 'APPROVAL_PENDING' },
      }),

      this.prisma.planningActivity.count({
        where: { isCritical: true },
      }),

      this.prisma.ncr.count(),

      this.prisma.planningResource.count({
        where: {
          healthStatus: {
            in: [
              HealthStatus.AT_RISK,
              HealthStatus.DELAYED,
              HealthStatus.CRITICAL,
            ],
          },
        },
      }),

      this.prisma.tender.count(),
    ]);

    const projects = await this.prisma.project.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        projectManager: { select: { name: true } },
        milestones: true,
      },
    });

    const enrichedProjects = projects.map((p) => {
      const metrics = this.calculateMilestoneMetrics(
        p.milestones,
      );

      return {
        ...p,
        progress: metrics.completionPct,
        healthStatus: metrics.healthStatus,
      };
    });

    return {
      kpis: {
        activeProjects,
        portfolioCompletion: 0, // TODO: avg(project progress)
        delayedMilestones,
        pendingApprovals,
        criticalActivities,
        openNcrs,
        materialShortages,
        tenders,
      },
      projects: enrichedProjects,
    };
  }

  // =========================================================
  // 📁 PORTFOLIO VIEW
  // =========================================================
  async planningPortfolio() {
    const projects = await this.prisma.project.findMany({
      include: {
        activities: true,
        milestones: true,
        resources: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => {
      const metrics = this.calculateMilestoneMetrics(
        p.milestones,
      );

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        clientName: p.clientName,
        healthStatus: metrics.healthStatus,

        // 📊 REAL-TIME PROGRESS (MILESTONE BASED)
        progress: metrics.completionPct,

        totalActivities: p.activities.length,
        criticalActivities: p.activities.filter(
          (a) => a.isCritical,
        ).length,

        delayedMilestones: p.milestones.filter(
          (m) => this.isBadMilestoneStatus(m.healthStatus),
        ).length,

        resourceShortages: p.resources.filter((r) =>
          this.isBadResourceStatus(r.healthStatus),
        ).length,
      };
    });
  }
}