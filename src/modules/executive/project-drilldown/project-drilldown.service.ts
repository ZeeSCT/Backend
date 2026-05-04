import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { HealthStatus, Prisma, RecordStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";

export type PortfolioCategoryCode = string;
export type ProjectHealthStatus = string;
export type ProjectHealthLabel = string;
export type ProjectActivitySeverity = string;
export type ProjectMilestoneStatus = string;

type HealthLookupMap = Map<
  string,
  {
    code: string;
    label: string;
    severity: string | null;
    displayOrder: number;
  }
>;

type MilestoneLookupMap = Map<
  string,
  {
    code: string;
    label: string;
    severity: string | null;
    displayOrder: number;
  }
>;

type ActivitySeverityLookupMap = Map<
  string,
  {
    code: string;
    label: string;
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

const projectInclude = {
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
  activities: {
    orderBy: [{ isCritical: "desc" }, { plannedFinish: "asc" }],
    take: 20,
  },
  milestones: {
    orderBy: [{ baselineDate: "asc" }, { createdAt: "asc" }],
    take: 20,
  },
  ncrs: {
    orderBy: [{ createdAt: "desc" }],
    take: 10,
  },
} satisfies Prisma.ProjectInclude;

type ProjectRecord = Prisma.ProjectGetPayload<{
  include: typeof projectInclude;
}>;

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

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

@Injectable()
export class ProjectDrillDownService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjectDrillDown(category: string = "all", projectId?: string) {
    const selectedCategory = await this.normalizeCategory(category);
    const selectedCategoryLabel = await this.getCategoryLabel(selectedCategory);

    const healthLookup = await this.getHealthLookupMap();
    const milestoneLookup = await this.getMilestoneLookupMap();
    const activitySeverityLookup = await this.getActivitySeverityLookupMap();

    const projectWhere = this.buildProjectWhere(selectedCategory);

    const projects = await this.prisma.project.findMany({
      where: projectWhere,
      include: projectInclude,
      orderBy: [{ code: "asc" }, { name: "asc" }],
    });

    if (projects.length === 0) {
      return {
        selectedCategory,
        selectedCategoryLabel,
        selectedProjectId: null,
        projects: [],
        project: null,
      };
    }

    const selectedProject = projectId
      ? await this.prisma.project.findFirst({
          where: {
            AND: [projectWhere, { id: projectId }],
          },
          include: projectInclude,
        })
      : projects[0];

    if (!selectedProject) {
      throw new NotFoundException("Project not found for selected category");
    }

    return {
      selectedCategory,
      selectedCategoryLabel,
      selectedProjectId: selectedProject.id,
      projects: projects.map((project) =>
        this.toProjectOption(project, healthLookup),
      ),
      project: this.toProjectSummary(
        selectedProject,
        healthLookup,
        milestoneLookup,
        activitySeverityLookup,
      ),
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

  private buildProjectWhere(category: string): Prisma.ProjectWhereInput {
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

  private async getMilestoneLookupMap(): Promise<MilestoneLookupMap> {
    const rows = await this.prisma.milestoneStatusLookup.findMany({
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

  private async getActivitySeverityLookupMap(): Promise<ActivitySeverityLookupMap> {
    const rows = await this.prisma.activitySeverityLookup.findMany({
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
          displayOrder: row.displayOrder,
        },
      ]),
    );
  }

  private getHealthLabel(
    status: string,
    healthLookup: HealthLookupMap,
  ): string {
    return healthLookup.get(status)?.label ?? fallbackLabel(status);
  }

  private getHealthPriority(
    status: string,
    healthLookup?: HealthLookupMap,
  ): number {
    const fromDb = healthLookup?.get(status)?.displayOrder;

    if (typeof fromDb === "number") {
      return fromDb;
    }

    switch (status) {
      case "CRITICAL":
        return 1;
      case "DELAYED":
        return 2;
      case "AT_RISK":
        return 3;
      case "ON_TRACK":
      default:
        return 4;
    }
  }

  private getActivitySeverityFromHealth(
    status: string,
    healthLookup: HealthLookupMap,
    activitySeverityLookup: ActivitySeverityLookupMap,
  ): ProjectActivitySeverity {
    const severity = healthLookup.get(status)?.severity;

    if (
      severity &&
      activitySeverityLookup.has(severity) &&
      (severity === "danger" ||
        severity === "warning" ||
        severity === "success")
    ) {
      return severity;
    }

    if (status === "CRITICAL" || status === "DELAYED") {
      return activitySeverityLookup.has("danger") ? "danger" : "danger";
    }

    if (status === "AT_RISK") {
      return activitySeverityLookup.has("warning") ? "warning" : "warning";
    }

    return activitySeverityLookup.has("success") ? "success" : "success";
  }

  private getMilestoneLabel(
    code: string,
    milestoneLookup: MilestoneLookupMap,
  ): string {
    return milestoneLookup.get(code)?.label ?? fallbackLabel(code);
  }

  private toProjectOption(
    project: ProjectRecord,
    healthLookup: HealthLookupMap,
  ) {
    const healthStatus = this.getHealthStatus(project.healthStatus);

    return {
      id: project.id,
      code: project.code,
      name: project.name,
      clientName: project.clientName,
      categoryCode: project.portfolioCategory?.code ?? project.portfolio,
      categoryName: project.portfolioCategory?.name ?? project.portfolio,
      projectManager: project.projectManager?.name ?? null,
      health: this.getHealthLabel(healthStatus, healthLookup),
      healthStatus,
    };
  }

  private toProjectSummary(
    project: ProjectRecord,
    healthLookup: HealthLookupMap,
    milestoneLookup: MilestoneLookupMap,
    activitySeverityLookup: ActivitySeverityLookupMap,
  ) {
    const healthStatus = this.getHealthStatus(project.healthStatus);

    const completion = clampPercent(
      toNumber(project.completionPct ?? project.actualProgress, 0),
    );

    const plannedProgress = clampPercent(toNumber(project.plannedProgress, 0));
    const scheduleVariance = completion - plannedProgress;

    const packages = this.buildPackages(project, healthLookup);

    const overdueApprovals = Math.max(0, Number(project.delayedApprovals ?? 0));

    const blockedPackages = Math.max(0, Number(project.blockedItems ?? 0));

    const pendingApprovals =
      overdueApprovals +
      (healthStatus === "CRITICAL"
        ? 4
        : healthStatus === "DELAYED"
          ? 3
          : healthStatus === "AT_RISK"
            ? 2
            : 1);

    return {
      id: project.id,
      code: project.code,
      name: project.name,
      clientName: project.clientName,
      categoryCode: project.portfolioCategory?.code ?? project.portfolio,
      categoryName: project.portfolioCategory?.name ?? project.portfolio,
      projectManager: project.projectManager?.name ?? null,
      projectManagerEmail: project.projectManager?.email ?? null,

      startDate: toIsoDate(project.plannedStart),
      endDate: toIsoDate(project.forecastFinish ?? project.plannedFinish),

      health: this.getHealthLabel(healthStatus, healthLookup),
      healthStatus,

      kpis: {
        completion,
        plannedProgress,
        scheduleVariance,
        blockedPackages,
        totalPackages: Math.max(packages.length, 1),
        pendingApprovals,
        overdueApprovals,
        openNcrs:
          project.ncrs.length > 0
            ? project.ncrs.length
            : this.deriveOpenNcrs(healthStatus),
      },

      packages,
      activities: this.buildActivities(
        project,
        scheduleVariance,
        healthLookup,
        activitySeverityLookup,
      ),
      milestones: this.buildMilestones(
        project,
        scheduleVariance,
        milestoneLookup,
      ),
    };
  }

  private getHealthStatus(value?: HealthStatus | null): ProjectHealthStatus {
    if (
      value === HealthStatus.ON_TRACK ||
      value === HealthStatus.AT_RISK ||
      value === HealthStatus.DELAYED ||
      value === HealthStatus.CRITICAL
    ) {
      return value;
    }

    return "ON_TRACK";
  }

  private buildPackages(
    project: ProjectRecord,
    healthLookup: HealthLookupMap,
  ) {
    if (project.activities.length > 0) {
      const grouped = new Map<
        string,
        {
          name: string;
          totalCompletion: number;
          count: number;
          healthStatuses: ProjectHealthStatus[];
        }
      >();

      for (const activity of project.activities) {
        const packageName =
          activity.discipline ||
          activity.wbsCode?.split(".")[0] ||
          "General works";

        const existing = grouped.get(packageName) ?? {
          name: packageName,
          totalCompletion: 0,
          count: 0,
          healthStatuses: [],
        };

        existing.totalCompletion += activity.percentComplete;
        existing.count += 1;
        existing.healthStatuses.push(
          this.getHealthStatus(activity.healthStatus),
        );

        grouped.set(packageName, existing);
      }

      return Array.from(grouped.values()).map((group) => {
        const status = group.healthStatuses.sort(
          (a, b) =>
            this.getHealthPriority(a, healthLookup) -
            this.getHealthPriority(b, healthLookup),
        )[0];

        return {
          id: `${project.id}-package-${slug(group.name)}`,
          name: group.name,
          status,
          completion: clampPercent(group.totalCompletion / group.count),
        };
      });
    }

    return this.buildFallbackPackages(project);
  }

  private buildFallbackPackages(project: ProjectRecord) {
    const healthStatus = this.getHealthStatus(project.healthStatus);

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

  private buildActivities(
    project: ProjectRecord,
    scheduleVariance: number,
    healthLookup: HealthLookupMap,
    activitySeverityLookup: ActivitySeverityLookupMap,
  ) {
    const healthStatus = this.getHealthStatus(project.healthStatus);

    const activities: {
      id: string;
      title: string;
      description: string;
      severity: ProjectActivitySeverity;
    }[] = [];

    for (const ncr of project.ncrs.slice(0, 2)) {
      const ncrStatus = this.getHealthStatus(ncr.healthStatus);

      activities.push({
        id: `${project.id}-ncr-${ncr.id}`,
        title: `${ncr.refNo} — ${ncr.description}`,
        description: ncr.packageName
          ? `${ncr.packageName} package NCR`
          : "Open NCR",
        severity: this.getActivitySeverityFromHealth(
          ncrStatus,
          healthLookup,
          activitySeverityLookup,
        ),
      });
    }

    const delayedMilestones = project.milestones
      .filter(
        (milestone) =>
          milestone.delayDays > 0 ||
          milestone.healthStatus === HealthStatus.DELAYED ||
          milestone.healthStatus === HealthStatus.CRITICAL,
      )
      .slice(0, 2);

    for (const milestone of delayedMilestones) {
      const milestoneHealth = this.getHealthStatus(milestone.healthStatus);

      activities.push({
        id: `${project.id}-milestone-${milestone.id}`,
        title: `${milestone.milestoneName} delayed`,
        description: `${milestone.delayDays} day variance against baseline`,
        severity: this.getActivitySeverityFromHealth(
          milestoneHealth,
          healthLookup,
          activitySeverityLookup,
        ),
      });
    }

    const criticalActivities = project.activities
      .filter(
        (activity) =>
          activity.isCritical ||
          activity.healthStatus === HealthStatus.CRITICAL ||
          activity.healthStatus === HealthStatus.DELAYED,
      )
      .slice(0, 2);

    for (const activity of criticalActivities) {
      const activityHealth = this.getHealthStatus(activity.healthStatus);

      activities.push({
        id: `${project.id}-activity-${activity.id}`,
        title: activity.activityName,
        description: activity.owner
          ? `Owner: ${activity.owner}`
          : activity.discipline
            ? `Discipline: ${activity.discipline}`
            : "Critical planning activity",
        severity: this.getActivitySeverityFromHealth(
          activityHealth,
          healthLookup,
          activitySeverityLookup,
        ),
      });
    }

    if (project.delayedApprovals > 0) {
      activities.push({
        id: `${project.id}-approval-delay`,
        title: `Approval pending for ${project.delayedApprovals} item${
          project.delayedApprovals === 1 ? "" : "s"
        }`,
        description: "Client or consultant response required",
        severity: activitySeverityLookup.has("danger") ? "danger" : "danger",
      });
    }

    if (project.blockedItems > 0) {
      activities.push({
        id: `${project.id}-blocked-items`,
        title: `${project.blockedItems} package${
          project.blockedItems === 1 ? "" : "s"
        } blocked`,
        description: "Action required from project team",
        severity: activitySeverityLookup.has("danger") ? "danger" : "danger",
      });
    }

    if (scheduleVariance < -10) {
      activities.push({
        id: `${project.id}-schedule-slippage`,
        title: "Schedule variance exceeds threshold",
        description: `${Math.abs(scheduleVariance)}% behind planned progress`,
        severity: activitySeverityLookup.has("warning")
          ? "warning"
          : "warning",
      });
    }

    if (activities.length === 0 || healthStatus === "ON_TRACK") {
      activities.push({
        id: `${project.id}-progress-update`,
        title: "Progress is tracking against plan",
        description: "No critical blocker reported",
        severity: activitySeverityLookup.has("success")
          ? "success"
          : "success",
      });
    }

    return activities.slice(0, 4);
  }

  private buildMilestones(
    project: ProjectRecord,
    scheduleVariance: number,
    milestoneLookup: MilestoneLookupMap,
  ) {
    if (project.milestones.length > 0) {
      return project.milestones.map((milestone) => {
        const statusCode = this.getMilestoneStatusCode(
          milestone.actualDate,
          milestone.delayDays,
          milestone.healthStatus,
        );

        return {
          id: milestone.id,
          name: milestone.milestoneName,
          plannedDate: toIsoDate(milestone.baselineDate) ?? "TBD",
          forecastDate:
            toIsoDate(milestone.actualDate) ??
            toIsoDate(milestone.forecastDate),
          varianceDays: milestone.delayDays ?? null,
          status: this.getMilestoneLabel(statusCode, milestoneLookup),
        };
      });
    }

    const healthStatus = this.getHealthStatus(project.healthStatus);
    const isCritical = healthStatus === "CRITICAL";
    const isAtRisk = healthStatus === "AT_RISK" || healthStatus === "DELAYED";

    return [
      {
        id: `${project.id}-project-start`,
        name: "Project start",
        plannedDate: toIsoDate(project.plannedStart) ?? "TBD",
        forecastDate: toIsoDate(project.plannedStart),
        varianceDays: 0,
        status: this.getMilestoneLabel("complete", milestoneLookup),
      },
      {
        id: `${project.id}-progress-checkpoint`,
        name: "Progress checkpoint",
        plannedDate: "2026-04-30",
        forecastDate: scheduleVariance < -10 ? "2026-05-20" : "2026-04-30",
        varianceDays: scheduleVariance < -10 ? 20 : 0,
        status: this.getMilestoneLabel(
          isCritical ? "delayed" : isAtRisk ? "at-risk" : "upcoming",
          milestoneLookup,
        ),
      },
      {
        id: `${project.id}-practical-completion`,
        name: "Practical completion",
        plannedDate: toIsoDate(project.plannedFinish) ?? "TBD",
        forecastDate: toIsoDate(project.forecastFinish),
        varianceDays: this.getDateVarianceDays(
          project.plannedFinish,
          project.forecastFinish,
        ),
        status: this.getMilestoneLabel(
          isCritical || scheduleVariance < -10 ? "at-risk" : "upcoming",
          milestoneLookup,
        ),
      },
    ];
  }

  private getMilestoneStatusCode(
    actualDate: Date | null,
    delayDays: number,
    healthStatus: HealthStatus,
  ): string {
    if (actualDate) return "complete";

    if (
      delayDays > 0 &&
      (healthStatus === HealthStatus.CRITICAL ||
        healthStatus === HealthStatus.DELAYED)
    ) {
      return "delayed";
    }

    if (delayDays > 0 || healthStatus === HealthStatus.AT_RISK) {
      return "at-risk";
    }

    return "upcoming";
  }

  private getDateVarianceDays(
    planned?: Date | string | null,
    forecast?: Date | string | null,
  ): number | null {
    if (!planned || !forecast) return null;

    const plannedDate = planned instanceof Date ? planned : new Date(planned);
    const forecastDate =
      forecast instanceof Date ? forecast : new Date(forecast);

    if (
      Number.isNaN(plannedDate.getTime()) ||
      Number.isNaN(forecastDate.getTime())
    ) {
      return null;
    }

    const diffMs = forecastDate.getTime() - plannedDate.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
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
        return 0;
    }
  }
}