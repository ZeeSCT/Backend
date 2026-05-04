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
export class PortfolioOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(category = 'all') {
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

    const projects = await this.prisma.project.findMany({
      where: projectWhere,
      include: {
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        portfolioCategory: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const projectIds = projects.map((project) => project.id);

    const delayedMilestones =
      projectIds.length === 0
        ? 0
        : await this.prisma.planningMilestone.count({
            where: {
              projectId: {
                in: projectIds,
              },
              OR: [
                {
                  delayDays: {
                    gt: 0,
                  },
                },
                {
                  healthStatus: {
                    in: [HealthStatus.DELAYED, HealthStatus.CRITICAL],
                  },
                },
              ],
            },
          });

    const activeProjects = projects.length;

    const portfolioCompletion =
      activeProjects === 0
        ? 0
        : Math.round(
            projects.reduce(
              (sum, project) => sum + project.completionPct,
              0,
            ) / activeProjects,
          );

    const pendingApprovals = projects.reduce(
      (sum, project) => sum + project.delayedApprovals,
      0,
    );

    const blockedItems = projects.reduce(
      (sum, project) => sum + project.blockedItems,
      0,
    );

    const billingReadyAmount = projects.reduce(
      (sum, project) => sum + Number(project.billingReadyAmount ?? 0),
      0,
    );

    const billingReadyProjects = projects.filter(
      (project) => project.billingReadyAmount !== null,
    ).length;

    const healthCounts = {
      onTrack: projects.filter(
        (project) => project.healthStatus === HealthStatus.ON_TRACK,
      ).length,
      atRisk: projects.filter(
        (project) => project.healthStatus === HealthStatus.AT_RISK,
      ).length,
      delayed: projects.filter(
        (project) => project.healthStatus === HealthStatus.DELAYED,
      ).length,
      critical: projects.filter(
        (project) => project.healthStatus === HealthStatus.CRITICAL,
      ).length,
    };

    const topIssues = [...projects]
      .filter((project) => project.topIssue)
      .sort((a, b) => {
        const priorityDiff =
          this.getHealthPriority(a.healthStatus) -
          this.getHealthPriority(b.healthStatus);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return (b.topIssueAgeDays ?? 0) - (a.topIssueAgeDays ?? 0);
      })
      .slice(0, 5)
      .map((project) => ({
        id: project.id,
        projectName: project.name,
        projectCode: project.code,
        categoryCode:
          project.portfolioCategory?.code ?? project.portfolio,
        categoryName:
          project.portfolioCategory?.name ?? project.portfolio,
        health: healthLabels[project.healthStatus],
        healthStatus: project.healthStatus,
        issueTitle: project.topIssue,
        issueAgeDays: project.topIssueAgeDays,
      }));

    const projectSummary = projects.map((project) => ({
      id: project.id,
      code: project.code,
      project: project.name,
      clientName: project.clientName,
      categoryCode:
        project.portfolioCategory?.code ?? project.portfolio,
      categoryName:
        project.portfolioCategory?.name ?? project.portfolio,
      pm: project.projectManager?.name ?? 'Unassigned',
      pmEmail: project.projectManager?.email ?? null,
      completion: project.completionPct,
      plannedProgress: project.plannedProgress,
      actualProgress: project.actualProgress,
      health: healthLabels[project.healthStatus],
      healthStatus: project.healthStatus,
      delayedApprovals: project.delayedApprovals,
      blocked: project.blockedItems,
      contractValue: Number(project.contractValue ?? 0),
      billingReadyAmount:
        project.billingReadyAmount !== null
          ? Number(project.billingReadyAmount)
          : null,
      billingReady:
        project.billingReadyAmount !== null
          ? Number(project.billingReadyAmount)
          : null,
      topIssue: project.topIssue,
    }));

    return {
      selectedCategory: category,
      kpis: {
        activeProjects,
        portfolioCompletion,
        delayedMilestones,
        pendingApprovals,
        blockedItems,
        billingReadyAmount,
        billingReadyProjects,
      },
      healthStatus: {
        total: activeProjects,
        counts: healthCounts,
      },
      topIssues,
      projects: projectSummary,
    };
  }

  private getHealthPriority(healthStatus: HealthStatus) {
    switch (healthStatus) {
      case HealthStatus.CRITICAL:
        return 1;
      case HealthStatus.DELAYED:
        return 2;
      case HealthStatus.AT_RISK:
        return 3;
      case HealthStatus.ON_TRACK:
        return 4;
      default:
        return 5;
    }
  }
}