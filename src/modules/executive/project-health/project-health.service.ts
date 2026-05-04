import { BadRequestException, Injectable } from '@nestjs/common';
import { HealthStatus, Prisma, RecordStatus } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

const allowedCategories = [
  'all',
  'its',
  'traffic',
  'its-maint',
  'traffic-maint',
];

const healthLabels: Record<HealthStatus, string> = {
  ON_TRACK: 'On track',
  AT_RISK: 'At risk',
  DELAYED: 'Delayed',
  CRITICAL: 'Critical',
};

@Injectable()
export class ProjectHealthService {
  constructor(private readonly prisma: PrismaService) {}

  // ======================================================
  // SHARED PROJECT FETCHER
  // ======================================================

  private async getProjects(category = 'all') {
    if (!allowedCategories.includes(category)) {
      throw new BadRequestException('Invalid portfolio category');
    }

    const projectWhere: Prisma.ProjectWhereInput = {
      status: RecordStatus.ACTIVE,

      ...(category !== 'all'
        ? {
            OR: [
              {
                portfolio: category,
              },
              {
                portfolioCategory: {
                  code: category,
                },
              },
            ],
          }
        : {}),
    };

    return this.prisma.project.findMany({
      where: projectWhere,

      select: {
        id: true,
        code: true,
        name: true,
        clientName: true,
        blockedItems: true,

        milestones: {
          where: {
           healthStatus: {
             in: [
              HealthStatus.AT_RISK,
              HealthStatus.DELAYED,
              HealthStatus.CRITICAL,
             ]
            },
          },

          select: {
            id: true,
          },
        },
      },

      orderBy: {
        name: 'asc',
      },
    });
  }

  // ======================================================
  // PROJECT SUMMARY API
  // ======================================================

  async getSummary(category = 'all') {
    const projects = await this.getProjects(category);

    const summary = {
      ON_TRACK: 0,
      AT_RISK: 0,
      DELAYED: 0,
      CRITICAL: 0,
    };

    for (const project of projects) {
      const pending = project.milestones.length;

      let status: keyof typeof summary;

      if (pending === 0) {
        status = 'ON_TRACK';
      } else if (pending === 1) {
        status = 'AT_RISK';
      } else if (pending <= 3) {
        status = 'DELAYED';
      } else {
        status = 'CRITICAL';
      }

      summary[status]++;
    }

    const totalProjects = projects.length;

    return Object.entries(summary).map(([status, count]) => ({
      status,
      label: healthLabels[status as HealthStatus],
      value: count,
      percentage:
        totalProjects > 0
          ? Math.round((count / totalProjects) * 100)
          : 0,
    }));
  }

  // ======================================================
  // DELAYED MILESTONES BY PROJECT
  // ======================================================

  async getDelayedMilestones(category = 'all') {
    const projects = await this.getProjects(category);

    const maxMilestones = Math.max(
      ...projects.map((p) => p.milestones.length),
      0,
    );

    return projects
  .map((project) => {
    const pending = project.milestones.length;

    let status = 'ON_TRACK';

    if (pending === 1) {
      status = 'AT_RISK';
    } else if (pending >= 2 && pending <= 3) {
      status = 'DELAYED';
    } else if (pending > 3) {
      status = 'CRITICAL';
    }

    return {
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      clientName: project.clientName,
      pendingMilestones: pending,
      status,
      label: pending === 1 ? '1 milestone' : `${pending} milestones`,
      widthPct:
        maxMilestones > 0
          ? Math.max(Math.round((pending / maxMilestones) * 100), 20)
          : 0,
    };
  })
  .filter((item) => item.pendingMilestones > 0) // 🔥 ADD THIS
  .sort((a, b) => b.pendingMilestones - a.pendingMilestones);
  }

  // ======================================================
  // BLOCKED ITEMS BY PROJECT
  // ======================================================

  async getBlockedItems(category = 'all') {
    const projects = await this.getProjects(category);

    const maxBlocked = Math.max(
      ...projects.map((p) => p.blockedItems ?? 0),
      0,
    );

    return projects
  .map((project) => {
    const blocked = project.blockedItems ?? 0;

    return {
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      clientName: project.clientName,
      blockedItems: blocked,
      label:
        blocked === 1
          ? '1 blocked item'
          : `${blocked} blocked items`,
      widthPct:
        maxBlocked > 0
          ? Math.max(Math.round((blocked / maxBlocked) * 100), 20)
          : 0,
    };
  })
  .filter((item) => item.blockedItems > 0) // 🔥 THIS IS THE FIX
  .sort((a, b) => b.blockedItems - a.blockedItems);
  }

  // ======================================================
  // HEALTH TREND - LAST 4 WEEKS
  // ======================================================

  async getHealthTrend() {
    return [
      {
        week: 'Week 1',
        onTrack: 10,
        atRisk: 7,
        delayed: 5,
        critical: 2,
      },
      {
        week: 'Week 2',
        onTrack: 11,
        atRisk: 7,
        delayed: 4,
        critical: 2,
      },
      {
        week: 'Week 3',
        onTrack: 11,
        atRisk: 6,
        delayed: 5,
        critical: 2,
      },
      {
        week: 'Week 4 (now)',
        onTrack: 12,
        atRisk: 6,
        delayed: 4,
        critical: 2,
      },
    ];
  }
}