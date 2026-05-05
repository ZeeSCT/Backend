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
              { portfolio: category },
              { portfolioCategory: { code: category } },
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

        _count: {
          select: {
            milestones: {
              where: {
                healthStatus: {
                  in: [
                    HealthStatus.AT_RISK,
                    HealthStatus.DELAYED,
                    HealthStatus.CRITICAL,
                  ],
                },
              },
            },
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
      const pending = project._count.milestones;

      let status: keyof typeof summary;

      switch (true) {
        case pending === 0:
          status = 'ON_TRACK';
          break;

        case pending === 1:
          status = 'AT_RISK';
          break;

        case pending >= 2 && pending <= 3:
          status = 'DELAYED';
          break;

        default:
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
      ...projects.map((p) => p._count.milestones),
      0,
    );

    return projects
      .map((project) => {
        const pending = project._count.milestones;

        let status: keyof typeof healthLabels;

        switch (true) {
          case pending === 1:
            status = 'AT_RISK';
            break;

          case pending >= 2 && pending <= 3:
            status = 'DELAYED';
            break;

          case pending > 3:
            status = 'CRITICAL';
            break;

          default:
            status = 'ON_TRACK';
        }

        return {
          projectId: project.id,
          projectCode: project.code,
          projectName: project.name,
          clientName: project.clientName,
          pendingMilestones: pending,
          status,
          label:
            pending === 1 ? '1 milestone' : `${pending} milestones`,
          widthPct:
            maxMilestones > 0
              ? Math.max(
                  Math.round((pending / maxMilestones) * 100),
                  20,
                )
              : 0,
        };
      })
      .filter((item) => item.pendingMilestones > 0)
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
              ? Math.max(
                  Math.round((blocked / maxBlocked) * 100),
                  20,
                )
              : 0,
        };
      })
      .filter((item) => item.blockedItems > 0)
      .sort((a, b) => b.blockedItems - a.blockedItems);
  }

  // ======================================================
  // HEALTH TREND - DATABASE DRIVEN (NO HARDCODE)
  // ======================================================

  private getWeekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  async getHealthTrend() {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 28);

    const records = await this.prisma.project.findMany({
      where: {
        status: RecordStatus.ACTIVE,
        updatedAt: {
          gte: fromDate,
        },
      },
      select: {
        updatedAt: true,
        healthStatus: true,
      },
    });

    const trendMap: Record<string, any> = {};

    for (const r of records) {
      const week = this.getWeekStart(r.updatedAt)
        .toISOString()
        .slice(0, 10);

      if (!trendMap[week]) {
        trendMap[week] = {
          week,
          ON_TRACK: 0,
          AT_RISK: 0,
          DELAYED: 0,
          CRITICAL: 0,
        };
      }

      trendMap[week][r.healthStatus]++;
    }

    return Object.values(trendMap)
      .sort((a: any, b: any) => a.week.localeCompare(b.week))
      .slice(-4)
      .map((w: any, index: number) => ({
        week: `Week ${index + 1}`,
        onTrack: w.ON_TRACK,
        atRisk: w.AT_RISK,
        delayed: w.DELAYED,
        critical: w.CRITICAL,
      }));
  }
}