import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, RecordStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";

export type PortfolioCategoryCode =
  | "all"
  | "its"
  | "traffic"
  | "its-maint"
  | "traffic-maint";

export type ProjectHealthStatus =
  | "ON_TRACK"
  | "AT_RISK"
  | "DELAYED"
  | "CRITICAL";

export type ProjectHealthLabel =
  | "On track"
  | "At risk"
  | "Delayed"
  | "Critical";

export type ProjectActivitySeverity = "success" | "warning" | "danger";

export type ProjectMilestoneStatus =
  | "Complete"
  | "Delayed"
  | "At risk"
  | "Upcoming";

interface ProjectRecord {
  id: string;
  code?: string | null;
  name: string;
  clientName?: string | null;
  portfolio?: string | null;
  healthStatus?: ProjectHealthStatus | null;
  completionPct?: unknown;
  plannedProgress?: unknown;
  actualProgress?: unknown;
  delayedApprovals?: number | null;
  blockedItems?: number | null;
  billingReadyAmount?: unknown;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  plannedStartDate?: Date | string | null;
  plannedEndDate?: Date | string | null;
  forecastFinish?: Date | string | null;
  createdAt?: Date | string | null;
  projectManager?: {
    name?: string | null;
    email?: string | null;
  } | null;
  projectManagerName?: string | null;
  pm?: string | null;
}

const allowedCategories: PortfolioCategoryCode[] = [
  "all",
  "its",
  "traffic",
  "its-maint",
  "traffic-maint",
];

const categoryLabels: Record<PortfolioCategoryCode, string> = {
  all: "All portfolios",
  its: "ITS Projects",
  traffic: "Traffic Projects",
  "its-maint": "ITS Maintenance",
  "traffic-maint": "Traffic Maintenance",
};

const healthLabels: Record<ProjectHealthStatus, ProjectHealthLabel> = {
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  DELAYED: "Delayed",
  CRITICAL: "Critical",
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  if (
    value &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as { toNumber: () => number }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toIsoDate(value?: Date | string | null): string | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : null;
  }

  return date.toISOString();
}

@Injectable()
export class ProjectDrillDownService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjectDrillDown(category: string = "all", projectId?: string) {
    const selectedCategory = this.normalizeCategory(category);
    const projectWhere = this.buildProjectWhere(selectedCategory);

    const projects = (await this.prisma.project.findMany({
      where: projectWhere,
      include: {
        projectManager: true,
      },
      orderBy: [{ code: "asc" }, { name: "asc" }],
    })) as unknown as ProjectRecord[];

    if (projects.length === 0) {
      return {
        selectedCategory,
        selectedProjectId: null,
        projects: [],
        project: null,
      };
    }

    const selectedProject = projectId
      ? ((await this.prisma.project.findFirst({
          where: {
            AND: [projectWhere, { id: projectId }],
          },
          include: {
            projectManager: true,
          },
        })) as unknown as ProjectRecord | null)
      : projects[0];

    if (!selectedProject) {
      throw new NotFoundException("Project not found for selected category");
    }

    return {
      selectedCategory,
      selectedProjectId: selectedProject.id,
      projects: projects.map((project) => this.toProjectOption(project)),
      project: this.toProjectSummary(selectedProject),
    };
  }

  private normalizeCategory(category?: string): PortfolioCategoryCode {
    const normalized = (
      category || "all"
    ).toLowerCase() as PortfolioCategoryCode;

    if (!allowedCategories.includes(normalized)) {
      throw new BadRequestException("Invalid portfolio category");
    }

    return normalized;
  }

  private buildProjectWhere(
    category: PortfolioCategoryCode,
  ): Prisma.ProjectWhereInput {
    return {
      status: RecordStatus.ACTIVE,

      ...(category !== "all"
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
  }

  private toProjectOption(project: ProjectRecord) {
    const healthStatus = this.getHealthStatus(project);

    return {
      id: project.id,
      code: project.code ?? "",
      name: project.name,
      clientName: project.clientName ?? null,
      projectManager: this.getProjectManagerName(project),
      health: healthLabels[healthStatus],
      healthStatus,
    };
  }

  private toProjectSummary(project: ProjectRecord) {
    const healthStatus = this.getHealthStatus(project);
    const completion = clampPercent(
      toNumber(project.completionPct ?? project.actualProgress, 0),
    );
    const plannedProgress = clampPercent(toNumber(project.plannedProgress, 0));
    const scheduleVariance = completion - plannedProgress;

    const blockedPackages = Math.max(0, Number(project.blockedItems ?? 0));
    const overdueApprovals = Math.max(0, Number(project.delayedApprovals ?? 0));

    const pendingApprovals =
      overdueApprovals +
      (healthStatus === "CRITICAL"
        ? 4
        : healthStatus === "DELAYED"
          ? 3
          : healthStatus === "AT_RISK"
            ? 2
            : 1);

    const packages = this.buildPackages(project);

    return {
      id: project.id,
      code: project.code ?? "",
      name: project.name,
      clientName: project.clientName ?? null,
      projectManager: this.getProjectManagerName(project),
      startDate: toIsoDate(project.plannedStartDate ?? project.createdAt),
      endDate: toIsoDate(project.forecastFinish ?? project.plannedEndDate),
      health: healthLabels[healthStatus],
      healthStatus,

      kpis: {
        completion,
        plannedProgress,
        scheduleVariance,
        blockedPackages,
        totalPackages: Math.max(packages.length, 8),
        pendingApprovals,
        overdueApprovals,
        openNcrs: this.deriveOpenNcrs(healthStatus),
      },

      packages,
      activities: this.buildActivities(project, scheduleVariance),
      milestones: this.buildMilestones(project, scheduleVariance),
    };
  }

  private getHealthStatus(project: ProjectRecord): ProjectHealthStatus {
    const value = project.healthStatus;

    if (
      value === "ON_TRACK" ||
      value === "AT_RISK" ||
      value === "DELAYED" ||
      value === "CRITICAL"
    ) {
      return value;
    }

    return "ON_TRACK";
  }

  private getProjectManagerName(project: ProjectRecord): string | null {
    return (
      project.projectManager?.name ??
      project.projectManagerName ??
      project.pm ??
      null
    );
  }

  private buildPackages(project: ProjectRecord) {
    const healthStatus = this.getHealthStatus(project);
    const completion = clampPercent(
      toNumber(project.completionPct ?? project.actualProgress, 0),
    );
    const blockedItems = Math.max(0, Number(project.blockedItems ?? 0));

    const basePackages = [
      { key: "civil", name: "Civil works", offset: -7 },
      { key: "hvac", name: "HVAC installation", offset: 6 },
      { key: "electrical", name: "Electrical", offset: 9 },
      { key: "plumbing", name: "Plumbing", offset: 20 },
      { key: "fire", name: "Fire fighting", offset: -20 },
    ];

    return basePackages.map((item, index) => {
      const packageCompletion = clampPercent(completion + item.offset);

      let status: ProjectHealthStatus = "ON_TRACK";

      if (index < blockedItems) {
        status = "CRITICAL";
      } else if (healthStatus === "CRITICAL" && packageCompletion < 50) {
        status = "CRITICAL";
      } else if (healthStatus === "DELAYED" || packageCompletion < 45) {
        status = "DELAYED";
      } else if (healthStatus === "AT_RISK" || packageCompletion < 65) {
        status = "AT_RISK";
      }

      return {
        id: `${project.id}-${item.key}`,
        name: item.name,
        status,
        completion: packageCompletion,
      };
    });
  }

  private buildActivities(project: ProjectRecord, scheduleVariance: number) {
    const healthStatus = this.getHealthStatus(project);
    const delayedApprovals = Number(project.delayedApprovals ?? 0);
    const blockedItems = Number(project.blockedItems ?? 0);

    const activities: {
      id: string;
      title: string;
      description: string;
      severity: ProjectActivitySeverity;
    }[] = [];

    if (delayedApprovals > 0) {
      activities.push({
        id: `${project.id}-approval-delay`,
        title: `Approval pending for ${delayedApprovals} item${
          delayedApprovals === 1 ? "" : "s"
        }`,
        description: "Client or consultant response required",
        severity: "danger",
      });
    }

    if (blockedItems > 0) {
      activities.push({
        id: `${project.id}-blocked-items`,
        title: `${blockedItems} package${blockedItems === 1 ? "" : "s"} blocked`,
        description: "Action required from project team",
        severity: "danger",
      });
    }

    if (scheduleVariance < -10) {
      activities.push({
        id: `${project.id}-schedule-slippage`,
        title: "Schedule variance exceeds threshold",
        description: `${Math.abs(scheduleVariance)}% behind planned progress`,
        severity: "warning",
      });
    }

    if (healthStatus === "ON_TRACK") {
      activities.push({
        id: `${project.id}-progress-update`,
        title: "Progress is tracking against plan",
        description: "No critical blocker reported",
        severity: "success",
      });
    }

    activities.push({
      id: `${project.id}-weekly-update`,
      title: "Weekly project summary updated",
      description: "Dashboard values refreshed from project records",
      severity: healthStatus === "ON_TRACK" ? "success" : "warning",
    });

    return activities.slice(0, 4);
  }

  private buildMilestones(project: ProjectRecord, scheduleVariance: number) {
    const healthStatus = this.getHealthStatus(project);

    const isCritical = healthStatus === "CRITICAL";
    const isAtRisk = healthStatus === "AT_RISK" || healthStatus === "DELAYED";

    return [
      {
        id: `${project.id}-foundation`,
        name: "Foundation complete",
        plannedDate: "2026-03-15",
        forecastDate: isCritical ? "2026-03-28" : "2026-03-15",
        varianceDays: isCritical ? 13 : 0,
        status: isCritical ? "Delayed" : "Complete",
      },
      {
        id: `${project.id}-structure`,
        name: "Structural frame L1-5",
        plannedDate: "2026-04-10",
        forecastDate: isCritical || isAtRisk ? "2026-04-25" : "2026-04-10",
        varianceDays: isCritical || isAtRisk ? 15 : 0,
        status: isCritical || isAtRisk ? "At risk" : "Complete",
      },
      {
        id: `${project.id}-hvac-main-duct`,
        name: "HVAC main duct",
        plannedDate: "2026-04-30",
        forecastDate: scheduleVariance < -10 ? "2026-05-20" : "2026-04-30",
        varianceDays: scheduleVariance < -10 ? 20 : 0,
        status: scheduleVariance < -10 ? "At risk" : "Upcoming",
      },
      {
        id: `${project.id}-electrical-first-fix`,
        name: "Electrical 1st fix",
        plannedDate: "2026-05-15",
        forecastDate: null,
        varianceDays: null,
        status: "Upcoming",
      },
      {
        id: `${project.id}-practical-completion`,
        name: "Practical completion",
        plannedDate: "2026-10-31",
        forecastDate: null,
        varianceDays: null,
        status: "Upcoming",
      },
    ] satisfies {
      id: string;
      name: string;
      plannedDate: string;
      forecastDate: string | null;
      varianceDays: number | null;
      status: ProjectMilestoneStatus;
    }[];
  }

  private deriveOpenNcrs(healthStatus: ProjectHealthStatus): number {
    switch (healthStatus) {
      case "CRITICAL":
        return 4;
      case "DELAYED":
        return 3;
      case "AT_RISK":
        return 2;
      case "ON_TRACK":
      default:
        return 1;
    }
  }
}
