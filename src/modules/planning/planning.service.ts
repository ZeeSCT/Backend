import { Injectable } from '@nestjs/common';
import { HealthStatus } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class PlanningService {
  constructor(private prisma: PrismaService) {}

  // ================= UTILITY =================
  private calculateMilestoneProgress(
    milestones: { actualDate: Date | null }[],
  ): number {
    if (!milestones?.length) return 0;

    const completed = milestones.filter(
      (m) => m.actualDate !== null,
    ).length;

    return Math.round((completed / milestones.length) * 100);
  }

  // ================= SUMMARY =================
  async summary(projectId: string) {
    const [
      project,
      totalActivities,
      totalMilestones,
      criticalActivities,
      delayedActivities,
      negativeFloat,
      resourceShortages,
      milestones,
    ] = await Promise.all([
      this.prisma.project.findUnique({
        where: { id: projectId },
      }),

      this.prisma.planningActivity.count({
        where: { projectId },
      }),

      this.prisma.planningMilestone.count({
        where: { projectId },
      }),

      this.prisma.planningActivity.count({
        where: {
          projectId,
          isCritical: true,
        },
      }),

      this.prisma.planningActivity.count({
        where: {
          projectId,
          healthStatus: {
            in: [HealthStatus.DELAYED, HealthStatus.CRITICAL],
          },
        },
      }),

      this.prisma.planningActivity.count({
        where: {
          projectId,
          floatDays: { lt: 0 },
        },
      }),

      this.prisma.planningResource.count({
        where: {
          projectId,
          healthStatus: {
            in: [
              HealthStatus.AT_RISK,
              HealthStatus.DELAYED,
              HealthStatus.CRITICAL,
            ],
          },
        },
      }),

      this.prisma.planningMilestone.findMany({
        where: { projectId },
        select: {
          actualDate: true,
        },
      }),
    ]);

    const milestoneProgress =
      this.calculateMilestoneProgress(milestones);

    return {
      project,
      totalActivities,
      totalMilestones,
      criticalActivities,
      delayedActivities,
      negativeFloat,
      resourceShortages,

      // ✅ ENGINE METRIC (NO STATIC DATA)
      milestoneProgress,
    };
  }

  // ================= ACTIVITIES =================
  activities(projectId: string) {
    return this.prisma.planningActivity.findMany({
      where: { projectId },
      orderBy: [
        { plannedStart: 'asc' },
        { activityId: 'asc' },
      ],
      take: 500,
    });
  }

  // ================= MILESTONES =================
  milestones(projectId: string) {
    return this.prisma.planningMilestone.findMany({
      where: { projectId },
      orderBy: [{ baselineDate: 'asc' }],
    });
  }

  // ================= RESOURCES =================
  resources(projectId: string) {
    return this.prisma.planningResource.findMany({
      where: { projectId },
      orderBy: [{ requiredDate: 'asc' }],
    });
  }

  // ================= CRITICAL PATH =================
  criticalPath(projectId: string) {
    return this.prisma.planningActivity.findMany({
      where: {
        projectId,
        OR: [
          { isCritical: true },
          { floatDays: { lte: 0 } },
        ],
      },
      orderBy: [
        { floatDays: 'asc' },
        { plannedStart: 'asc' },
      ],
    });
  }

  // ================= DRILLDOWN =================
  async drilldown(projectId: string) {
    const [
      summary,
      activities,
      milestones,
      resources,
      criticalPath,
    ] = await Promise.all([
      this.summary(projectId),
      this.activities(projectId),
      this.milestones(projectId),
      this.resources(projectId),
      this.criticalPath(projectId),
    ]);

    return {
      summary,
      activities,
      milestones,
      resources,
      criticalPath,
    };
  }
}