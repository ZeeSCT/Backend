import { BadRequestException, Injectable } from "@nestjs/common";
import { HealthStatus, Prisma, RecordStatus } from "@prisma/client";
import { PrismaService } from "../../../common/prisma/prisma.service";

type HealthLookupMap = Map<
  string,
  {
    code: string;
    label: string;
    severity: string | null;
    displayOrder: number;
  }
>;

function fallbackLabel(code: string) {
  return code
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

@Injectable()
export class PortfolioOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(category = "all") {
    const selectedCategory = await this.normalizeCategory(category);
    const selectedCategoryLabel =
      await this.getCategoryLabel(selectedCategory);

    const healthLookup = await this.getHealthLookupMap();

    const projectWhere: Prisma.ProjectWhereInput = {
      status: RecordStatus.ACTIVE,

      ...(selectedCategory !== "all"
        ? {
            OR: [
              {
                portfolio: selectedCategory,
              },
              {
                portfolioCategory: {
                  code: selectedCategory,
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
        createdAt: "desc",
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
          this.getHealthPriority(a.healthStatus, healthLookup) -
          this.getHealthPriority(b.healthStatus, healthLookup);

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
        categoryCode: project.portfolioCategory?.code ?? project.portfolio,
        categoryName: project.portfolioCategory?.name ?? project.portfolio,
        health: this.getHealthLabel(project.healthStatus, healthLookup),
        healthStatus: project.healthStatus,
        issueTitle: project.topIssue,
        issueAgeDays: project.topIssueAgeDays,
      }));

    const projectSummary = projects.map((project) => ({
      id: project.id,
      code: project.code,
      project: project.name,
      clientName: project.clientName,
      categoryCode: project.portfolioCategory?.code ?? project.portfolio,
      categoryName: project.portfolioCategory?.name ?? project.portfolio,
      pm: project.projectManager?.name ?? "Unassigned",
      pmEmail: project.projectManager?.email ?? null,
      completion: project.completionPct,
      plannedProgress: project.plannedProgress,
      actualProgress: project.actualProgress,
      health: this.getHealthLabel(project.healthStatus, healthLookup),
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
      selectedCategory,
      selectedCategoryLabel,
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

  private async normalizeCategory(category?: string): Promise<string> {
    const normalized = (category || "all").toLowerCase();

    if (normalized === "all") {
      return "all";
    }

    const exists = await this.prisma.portfolioCategory.findFirst({
      where: {
        code: normalized,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!exists) {
      throw new BadRequestException("Invalid portfolio category");
    }

    return normalized;
  }

  private async getCategoryLabel(category: string): Promise<string> {
    if (category === "all") {
      return "All portfolios";
    }

    const found = await this.prisma.portfolioCategory.findFirst({
      where: {
        code: category,
        isActive: true,
      },
      select: {
        name: true,
      },
    });

    if (!found) {
      throw new BadRequestException("Invalid portfolio category");
    }

    return found.name;
  }

  private async getHealthLookupMap(): Promise<HealthLookupMap> {
    const rows = await this.prisma.projectHealthStatusLookup.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    return new Map(
      rows.map((row) => [
        row.code,
        {
          code: row.code,
          label: row.label,
          severity: row.severity,
          displayOrder: row.displayOrder,
        },
      ]),
    );
  }

  private getHealthLabel(
    healthStatus: HealthStatus,
    healthLookup: HealthLookupMap,
  ) {
    return healthLookup.get(healthStatus)?.label ?? fallbackLabel(healthStatus);
  }

  private getHealthPriority(
    healthStatus: HealthStatus,
    healthLookup: HealthLookupMap,
  ) {
    const lookup = healthLookup.get(healthStatus);

    if (lookup) {
      return -lookup.displayOrder;
    }

    switch (healthStatus) {
      case HealthStatus.CRITICAL:
        return -4;
      case HealthStatus.DELAYED:
        return -3;
      case HealthStatus.AT_RISK:
        return -2;
      case HealthStatus.ON_TRACK:
        return -1;
      default:
        return 0;
    }
  }
}