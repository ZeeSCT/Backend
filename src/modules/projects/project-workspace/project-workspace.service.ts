import { Injectable } from "@nestjs/common";
import {
  ActivityStatus,
  HealthStatus,
  Prisma,
  RecordStatus,
} from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { ProjectWorkspaceQueryDto } from "./dto/project-workspace-query.dto";

type WorkspaceTone = "danger" | "warning" | "info" | "success" | null;

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    portfolioCategory: true;
    projectManager: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

type WbsItemRow = Prisma.WbsItemGetPayload<{}>;
type ScheduleActivityRow = Prisma.ScheduleActivityGetPayload<{}>;
type MilestoneRow = Prisma.MilestoneGetPayload<{}>;
type ProjectScheduleUploadRow = Prisma.ProjectScheduleUploadGetPayload<{}>;

type WorkspaceProject = {
  id: string;
  code: string;
  name: string;
  portfolioCategory: string;
  portfolioCategoryName?: string;
  health: string;
  healthStatus: string;
  healthSeverity: WorkspaceTone;
  pm: string;
  pmEmail?: string | null;
  client: string;
  period: string;
  completion: number;
  plannedCompletion: number;
  overdueTasks: number;
  overduePackages: number;
  openIssues: number;
  highIssues: number;
  pendingApprovals: number;
  overdueApprovals: number;
  materialsAtRisk: number;
  inspectionsPassed: number;
};

type WorkspacePackage = {
  id: string;
  projectId: string;
  name: string;
  progress: number;
  status: string;
  statusSeverity: WorkspaceTone;
};

type WorkspaceAttentionItem = {
  id: string;
  projectId: string;
  title: string;
  detail: string;
  tone: WorkspaceTone;
  severity: WorkspaceTone;
};

type WorkspaceFieldUpdate = {
  id: string;
  projectId: string;
  update: string;
  packageName: string;
  by: string;
  initials: string;
  progress: number;
  status: string;
  statusSeverity: WorkspaceTone;
  time: string;
};

@Injectable()
export class ProjectWorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkspace(query: ProjectWorkspaceQueryDto) {
    const selectedCategory = query.category || "all";

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

    const [projects, portfolioCategories] = await Promise.all([
      this.prisma.project.findMany({
        where: projectWhere,
        include: {
          portfolioCategory: true,
          projectManager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          code: "asc",
        },
      }),

      this.prisma.portfolioCategory.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          displayOrder: "asc",
        },
      }),
    ]);

    if (!projects.length) {
      return {
        selectedCategory,
        selectedCategoryLabel: this.getSelectedCategoryLabel(
          selectedCategory,
          portfolioCategories,
        ),
        selectedProjectId: null,
        projects: [],
        project: null,
        packages: [],
        attentionItems: [],
        fieldUpdates: [],
      };
    }

    const projectIds = projects.map((project) => project.id);

    const latestUploadsByProjectId =
      await this.getLatestUploadsByProjectId(projectIds);

    const latestUploadIds = Array.from(latestUploadsByProjectId.values()).map(
      (upload) => upload.id,
    );

    const [wbsItems, activities, milestones] = await Promise.all([
      latestUploadIds.length
        ? this.prisma.wbsItem.findMany({
            where: {
              uploadId: {
                in: latestUploadIds,
              },
            },
            orderBy: [
              {
                rowNumber: "asc",
              },
              {
                wbsCode: "asc",
              },
            ],
          })
        : Promise.resolve([]),

      latestUploadIds.length
        ? this.prisma.scheduleActivity.findMany({
            where: {
              uploadId: {
                in: latestUploadIds,
              },
            },
            orderBy: [
              {
                rowNumber: "asc",
              },
              {
                activityCode: "asc",
              },
            ],
          })
        : Promise.resolve([]),

      latestUploadIds.length
        ? this.prisma.milestone.findMany({
            where: {
              uploadId: {
                in: latestUploadIds,
              },
            },
            orderBy: [
              {
                plannedDate: "asc",
              },
              {
                milestoneCode: "asc",
              },
            ],
          })
        : Promise.resolve([]),
    ]);

    const wbsById = new Map(wbsItems.map((item) => [item.id, item]));

    const wbsItemsByUploadId = this.groupBy(wbsItems, "uploadId");
    const activitiesByUploadId = this.groupBy(activities, "uploadId");
    const milestonesByUploadId = this.groupBy(milestones, "uploadId");

    const packagesByProjectId = new Map<string, WorkspacePackage[]>();
    const attentionItemsByProjectId = new Map<
      string,
      WorkspaceAttentionItem[]
    >();
    const fieldUpdatesByProjectId = new Map<string, WorkspaceFieldUpdate[]>();

    const workspaceProjects: WorkspaceProject[] = projects.map((project) => {
      const latestUpload = latestUploadsByProjectId.get(project.id);
      const uploadId = latestUpload?.id;

      const projectWbsItems = uploadId
        ? wbsItemsByUploadId.get(uploadId) ?? []
        : [];

      const projectActivities = uploadId
        ? activitiesByUploadId.get(uploadId) ?? []
        : [];

      const projectMilestones = uploadId
        ? milestonesByUploadId.get(uploadId) ?? []
        : [];

      const projectPackages = this.buildPackages({
        project,
        wbsItems: projectWbsItems,
        activities: projectActivities,
        wbsById,
      });

      packagesByProjectId.set(project.id, projectPackages);

      const overdueTasks = projectActivities.filter((activity) =>
        this.isActivityOverdue(activity),
      ).length;

      const blockedActivities = projectActivities.filter((activity) =>
        this.isBlockedStatus(activity.status),
      );

      const delayedActivities = projectActivities.filter((activity) =>
        this.isDelayedStatus(activity.status),
      );

      const overdueMilestones = projectMilestones.filter((milestone) =>
        this.isMilestoneOverdue(milestone),
      );

      const overduePackages = projectPackages.filter((item) => {
        return item.status === "Blocked" || item.status === "At risk";
      }).length;

      const pendingApprovals = project.delayedApprovals;
      const overdueApprovals = project.delayedApprovals;

      const openIssues =
        project.blockedItems +
        delayedActivities.length +
        overdueMilestones.length;

      const highIssues = blockedActivities.length + overdueMilestones.length;

      const attentionItems = this.buildAttentionItems({
        project,
        activities: projectActivities,
        milestones: projectMilestones,
        pendingApprovals,
        overdueApprovals,
      });

      const fieldUpdates = this.buildFieldUpdates({
        project,
        activities: projectActivities,
      });

      attentionItemsByProjectId.set(project.id, attentionItems);
      fieldUpdatesByProjectId.set(project.id, fieldUpdates);

      return {
        id: project.id,
        code: project.code,
        name: project.name,
        portfolioCategory: project.portfolio,
        portfolioCategoryName:
          project.portfolioCategory?.name ??
          portfolioCategories.find((item) => item.code === project.portfolio)
            ?.name,
        health: this.getHealthLabel(project.healthStatus),
        healthStatus: project.healthStatus,
        healthSeverity: this.getHealthSeverity(project.healthStatus),
        pm: project.projectManager?.name ?? "-",
        pmEmail: project.projectManager?.email ?? null,
        client: project.clientName,
        period: this.formatProjectPeriod(project),
        completion: this.clampPercent(
          project.actualProgress || project.completionPct,
        ),
        plannedCompletion: this.clampPercent(project.plannedProgress),
        overdueTasks,
        overduePackages,
        openIssues,
        highIssues,
        pendingApprovals,
        overdueApprovals,

        // These can be made real after wiring Inspection / MaterialRequest status fields.
        materialsAtRisk: 0,
        inspectionsPassed: 0,
      };
    });

    const selectedProject =
      workspaceProjects.find((project) => project.id === query.projectId) ??
      workspaceProjects[0];

    return {
      selectedCategory,
      selectedCategoryLabel: this.getSelectedCategoryLabel(
        selectedCategory,
        portfolioCategories,
      ),
      selectedProjectId: selectedProject?.id ?? null,
      projects: workspaceProjects,
      project: selectedProject ?? null,
      packages: selectedProject
        ? packagesByProjectId.get(selectedProject.id) ?? []
        : [],
      attentionItems: selectedProject
        ? attentionItemsByProjectId.get(selectedProject.id) ?? []
        : [],
      fieldUpdates: selectedProject
        ? fieldUpdatesByProjectId.get(selectedProject.id) ?? []
        : [],
    };
  }

  private async getLatestUploadsByProjectId(projectIds: string[]) {
    const uploads = await this.prisma.projectScheduleUpload.findMany({
      where: {
        projectId: {
          in: projectIds,
        },
      },
      orderBy: [
        {
          revisionNo: "desc",
        },
        {
          uploadedAt: "desc",
        },
      ],
    });

    const latestUploadsByProjectId = new Map<
      string,
      ProjectScheduleUploadRow
    >();

    for (const upload of uploads) {
      if (!latestUploadsByProjectId.has(upload.projectId)) {
        latestUploadsByProjectId.set(upload.projectId, upload);
      }
    }

    return latestUploadsByProjectId;
  }

  private buildPackages(params: {
    project: ProjectWithRelations;
    wbsItems: WbsItemRow[];
    activities: ScheduleActivityRow[];
    wbsById: Map<string, WbsItemRow>;
  }): WorkspacePackage[] {
    const { project, wbsItems, activities, wbsById } = params;

    const packageWbsItems = wbsItems.filter((item) => item.wbsLevel === 2);

    const activitiesByPackageId = new Map<string, ScheduleActivityRow[]>();

    for (const activity of activities) {
      const packageWbs = this.findLevelTwoWbs(activity.wbsItemId, wbsById);

      if (!packageWbs) continue;

      const existing = activitiesByPackageId.get(packageWbs.id) ?? [];
      existing.push(activity);
      activitiesByPackageId.set(packageWbs.id, existing);
    }

    return packageWbsItems.map((wbsItem) => {
      const packageActivities = activitiesByPackageId.get(wbsItem.id) ?? [];

      const blockedCount = packageActivities.filter((activity) =>
        this.isBlockedStatus(activity.status),
      ).length;

      const delayedCount = packageActivities.filter((activity) =>
        this.isDelayedStatus(activity.status),
      ).length;

      const overdueCount = packageActivities.filter((activity) =>
        this.isActivityOverdue(activity),
      ).length;

      const progress = this.calculateActivityProgress(packageActivities);

      const status =
        blockedCount > 0
          ? "Blocked"
          : delayedCount > 0 || overdueCount > 0
            ? "At risk"
            : "On track";

      return {
        id: wbsItem.id,
        projectId: project.id,
        name: wbsItem.name,
        progress,
        status,
        statusSeverity:
          status === "Blocked"
            ? "danger"
            : status === "At risk"
              ? "warning"
              : "success",
      };
    });
  }

  private buildAttentionItems(params: {
    project: ProjectWithRelations;
    activities: ScheduleActivityRow[];
    milestones: MilestoneRow[];
    pendingApprovals: number;
    overdueApprovals: number;
  }): WorkspaceAttentionItem[] {
    const {
      project,
      activities,
      milestones,
      pendingApprovals,
      overdueApprovals,
    } = params;

    const items: WorkspaceAttentionItem[] = [];

    if (project.topIssue) {
      items.push({
        id: `top-issue-${project.id}`,
        projectId: project.id,
        title: project.topIssue,
        detail: project.topIssueAgeDays
          ? `${project.topIssueAgeDays} day${
              project.topIssueAgeDays === 1 ? "" : "s"
            } open`
          : "Project top issue",
        tone: this.getHealthSeverity(project.healthStatus),
        severity: this.getHealthSeverity(project.healthStatus),
      });
    }

    const blockedActivities = activities
      .filter((activity) => this.isBlockedStatus(activity.status))
      .slice(0, 3);

    for (const activity of blockedActivities) {
      items.push({
        id: `blocked-${activity.id}`,
        projectId: project.id,
        title: `${activity.activityName} blocked`,
        detail:
          activity.packageName ||
          activity.workSectionName ||
          activity.rawLocationName ||
          "Schedule activity",
        tone: "danger",
        severity: "danger",
      });
    }

    const overdueMilestones = milestones
      .filter((milestone) => this.isMilestoneOverdue(milestone))
      .slice(0, 3);

    for (const milestone of overdueMilestones) {
      items.push({
        id: `milestone-${milestone.id}`,
        projectId: project.id,
        title: `${milestone.name} overdue`,
        detail: this.formatOverdueDetail(milestone.plannedDate),
        tone: "warning",
        severity: "warning",
      });
    }

    if (overdueApprovals > 0) {
      items.push({
        id: `approvals-overdue-${project.id}`,
        projectId: project.id,
        title: `${overdueApprovals} delayed approval${
          overdueApprovals === 1 ? "" : "s"
        }`,
        detail: "Follow up with approvers",
        tone: "danger",
        severity: "danger",
      });
    } else if (pendingApprovals > 0) {
      items.push({
        id: `approvals-pending-${project.id}`,
        projectId: project.id,
        title: `${pendingApprovals} pending approval${
          pendingApprovals === 1 ? "" : "s"
        }`,
        detail: "Review approval queue",
        tone: "warning",
        severity: "warning",
      });
    }

    return items.slice(0, 5);
  }

  private buildFieldUpdates(params: {
    project: ProjectWithRelations;
    activities: ScheduleActivityRow[];
  }): WorkspaceFieldUpdate[] {
    const { project, activities } = params;

    return [...activities]
      .sort((a, b) => {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      })
      .slice(0, 6)
      .map((activity) => {
        const fieldStatus = this.mapActivityStatusToFieldStatus(
          activity.status,
        );

        const packageName =
          activity.packageName ||
          activity.workSectionName ||
          activity.rawLocationName ||
          "-";

        return {
          id: `field-${activity.id}`,
          projectId: project.id,
          update: `${activity.activityName} — ${this.toTitleLabel(
            activity.status,
          )}`,
          packageName,
          by: project.projectManager?.name ?? "-",
          initials: this.getInitials(
            project.projectManager?.name ?? project.name,
          ),
          progress: this.getActivityProgress(activity),
          status: fieldStatus,
          statusSeverity:
            fieldStatus === "Blocked"
              ? "danger"
              : fieldStatus === "Insp. req."
                ? "info"
                : "success",
          time: this.formatRelativeTime(activity.updatedAt),
        };
      });
  }

  private findLevelTwoWbs(
    wbsItemId: string | null,
    wbsById: Map<string, WbsItemRow>,
  ) {
    if (!wbsItemId) return null;

    let current = wbsById.get(wbsItemId) ?? null;
    let guard = 0;

    while (current && guard < 20) {
      if (current.wbsLevel === 2) {
        return current;
      }

      current = current.parentId
        ? wbsById.get(current.parentId) ?? null
        : null;

      guard += 1;
    }

    return null;
  }

  private calculateActivityProgress(activities: ScheduleActivityRow[]) {
    if (!activities.length) return 0;

    const total = activities.reduce((sum, activity) => {
      return sum + this.getActivityProgress(activity);
    }, 0);

    return this.clampPercent(total / activities.length);
  }

  private getActivityProgress(activity: ScheduleActivityRow) {
    switch (activity.status) {
      case ActivityStatus.COMPLETED:
        return 100;

      case ActivityStatus.IN_PROGRESS:
        return 50;

      case ActivityStatus.DELAYED:
        return 35;

      case ActivityStatus.BLOCKED:
        return 20;

      case ActivityStatus.ON_HOLD:
        return 10;

      case ActivityStatus.NOT_STARTED:
      default:
        return 0;
    }
  }

  private isActivityOverdue(activity: ScheduleActivityRow) {
    if (activity.status === ActivityStatus.COMPLETED) {
      return false;
    }

    if (!activity.finishDate) {
      return false;
    }

    return activity.finishDate.getTime() < Date.now();
  }

  private isMilestoneOverdue(milestone: MilestoneRow) {
    if (milestone.status === ActivityStatus.COMPLETED) {
      return false;
    }

    if (!milestone.plannedDate) {
      return false;
    }

    return milestone.plannedDate.getTime() < Date.now();
  }

  private isBlockedStatus(value: ActivityStatus) {
    return value === ActivityStatus.BLOCKED;
  }

  private isDelayedStatus(value: ActivityStatus) {
    return value === ActivityStatus.DELAYED || value === ActivityStatus.ON_HOLD;
  }

  private mapActivityStatusToFieldStatus(value: ActivityStatus) {
    if (value === ActivityStatus.BLOCKED) return "Blocked";

    if (value === ActivityStatus.DELAYED || value === ActivityStatus.ON_HOLD) {
      return "Insp. req.";
    }

    return "Synced";
  }

  private getHealthLabel(status: HealthStatus) {
    switch (status) {
      case HealthStatus.ON_TRACK:
        return "On track";

      case HealthStatus.AT_RISK:
        return "At risk";

      case HealthStatus.DELAYED:
        return "Delayed";

      case HealthStatus.CRITICAL:
        return "Critical";

      default:
        return this.toTitleLabel(status);
    }
  }

  private getHealthSeverity(status: HealthStatus): WorkspaceTone {
    switch (status) {
      case HealthStatus.ON_TRACK:
        return "success";

      case HealthStatus.AT_RISK:
        return "warning";

      case HealthStatus.DELAYED:
      case HealthStatus.CRITICAL:
        return "danger";

      default:
        return null;
    }
  }

  private formatProjectPeriod(project: ProjectWithRelations) {
    const startDate = project.plannedStart ?? project.contractStartDate;
    const finishDate =
      project.forecastFinish ?? project.plannedFinish ?? project.contractEndDate;

    if (!startDate && !finishDate) return "-";

    if (startDate && !finishDate) {
      return `${this.formatMonthYear(startDate)} – -`;
    }

    if (!startDate && finishDate) {
      return `- – ${this.formatMonthYear(finishDate)}`;
    }

    return `${this.formatMonthYear(startDate!)} – ${this.formatMonthYear(
      finishDate!,
    )}`;
  }

  private formatMonthYear(date: Date) {
    return new Intl.DateTimeFormat("en-AE", {
      month: "short",
      year: "numeric",
    }).format(date);
  }

  private formatRelativeTime(date: Date) {
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";

    return `${diffDays}d ago`;
  }

  private formatOverdueDetail(date: Date | null) {
    if (!date) return "Planned date overdue";

    const diffMs = Date.now() - date.getTime();
    const days = Math.max(1, Math.floor(diffMs / 86400000));

    return `${days} day${days === 1 ? "" : "s"} overdue`;
  }

  private getSelectedCategoryLabel(
    category: string,
    categories: { code: string; name: string }[],
  ) {
    if (category === "all") return "All portfolios";

    const match = categories.find((item) => item.code === category);

    return match?.name ?? category;
  }

  private toTitleLabel(value: unknown) {
    const normalized = String(value ?? "")
      .trim()
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .toLowerCase();

    if (!normalized) return "-";

    return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private clampPercent(value: unknown) {
    const numberValue = Number(value ?? 0);

    if (Number.isNaN(numberValue)) return 0;

    return Math.min(100, Math.max(0, Math.round(numberValue)));
  }

  private getInitials(value: string) {
    const text = value.trim().replace(/\s+/g, " ");

    if (!text) return "-";

    return text
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  private groupBy<T, K extends keyof T>(rows: T[], key: K) {
    const map = new Map<string, T[]>();

    for (const row of rows) {
      const groupKey = String(row[key] ?? "");

      if (!groupKey) continue;

      const existing = map.get(groupKey) ?? [];
      existing.push(row);
      map.set(groupKey, existing);
    }

    return map;
  }
}