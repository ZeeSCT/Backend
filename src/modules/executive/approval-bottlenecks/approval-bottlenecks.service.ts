import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, RecordStatus } from "@prisma/client";
import { PrismaService } from "../../../common/prisma/prisma.service";

type ApprovalStatusLookupRow = {
  code: string;
  label: string;
  severity: string | null;
  displayOrder: number;
};

type ApproverGroup = {
  code: string;
  label: string;
};

export interface ApprovalBottleneckKpis {
  totalPending: number;
  overdueCount: number;
  averageApprovalTimeDays: number;
  approvedThisMonth: number;
  approvedThisMonthChangePct: number;
}

export interface ApprovalBottleneckItem {
  approverType: string;
  approverTypeCode: string;
  pendingCount: number;
  widthPercent: number;
}

export interface ApprovalBottleneckOverdueItem {
  id: string;
  project: string;
  document: string;
  approverType: string;
  approverTypeCode: string;
  daysOverdue: number;
}

export interface ApprovalBottleneckPendingApproval {
  id: string;
  document: string;
  project: string;
  projectCode: string;
  approver: string;
  approverType: string;
  approverTypeCode: string;
  submitted: string;
  submittedAt: string;
  daysPending: number;
  status: string;
  statusCode: string;
  statusSeverity: string | null;
}

export interface ApprovalBottlenecksResponse {
  selectedCategory: string;
  selectedCategoryLabel: string;
  kpis: ApprovalBottleneckKpis;
  bottlenecks: ApprovalBottleneckItem[];
  mostOverdue: ApprovalBottleneckOverdueItem[];
  pendingApprovals: ApprovalBottleneckPendingApproval[];
}

@Injectable()
export class ApprovalBottlenecksService {
  constructor(private readonly prisma: PrismaService) {}

  async getApprovalBottlenecks(
    category = "all",
  ): Promise<ApprovalBottlenecksResponse> {
    const selectedCategory = await this.normalizeCategory(category);
    const selectedCategoryLabel = await this.getCategoryLabel(selectedCategory);

    const approvalStatusLookup = await this.getApprovalStatusLookup();

    const pendingStatusCodes = approvalStatusLookup
      .filter((status) =>
        ["under-review", "at-risk", "overdue"].includes(status.code),
      )
      .map((status) => status.code);

    const approvedStatusCodes = approvalStatusLookup
      .filter((status) => this.isApprovedStatus(status))
      .map((status) => status.code);

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
      select: {
        id: true,
      },
    });

    const projectIds = projects.map((project) => project.id);

    if (projectIds.length === 0) {
      return this.emptyResponse(selectedCategory, selectedCategoryLabel);
    }

    const pendingDocuments =
      pendingStatusCodes.length === 0
        ? []
        : await this.prisma.planningDocument.findMany({
            where: {
              status: RecordStatus.ACTIVE,
              projectId: {
                in: projectIds,
              },
              approvalStatusCode: {
                in: pendingStatusCodes,
              },
              submittedAt: {
                not: null,
              },
            },
            include: {
              project: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  clientName: true,
                  portfolio: true,
                  portfolioCategory: {
                    select: {
                      code: true,
                      name: true,
                    },
                  },
                },
              },
              approvalStatus: {
                select: {
                  code: true,
                  label: true,
                  severity: true,
                  displayOrder: true,
                },
              },
            },
            orderBy: [
              {
                dueDate: "asc",
              },
              {
                submittedAt: "asc",
              },
            ],
          });

    const now = new Date();

    const pendingApprovals: ApprovalBottleneckPendingApproval[] =
      pendingDocuments.map((document) => {
        const submittedAt = document.submittedAt ?? document.createdAt;
        const daysPending = this.getDaysBetween(submittedAt, now);
        const approverGroup = this.getApproverGroup(document.approver);

        return {
          id: document.id,
          document: this.getDocumentTitle(document.fileName, document.revision),
          project: document.project.name,
          projectCode: document.project.code,
          approver: document.approver ?? "Unassigned",
          approverType: approverGroup.label,
          approverTypeCode: approverGroup.code,
          submitted: this.formatDate(submittedAt),
          submittedAt: submittedAt.toISOString(),
          daysPending,
          status: document.approvalStatus.label,
          statusCode: document.approvalStatus.code,
          statusSeverity: document.approvalStatus.severity,
        };
      });

    const totalPending = pendingApprovals.length;

    const overdueCount = pendingApprovals.filter((approval) =>
      this.isOverdueApproval(approval),
    ).length;

    const averageApprovalTimeDays = await this.getAverageApprovalTimeDays(
      projectIds,
      approvedStatusCodes,
    );

    const bottlenecks = this.getBottlenecks(pendingApprovals);

    const mostOverdue = pendingApprovals
      .filter((approval) => this.isOverdueApproval(approval))
      .sort((a, b) => b.daysPending - a.daysPending)
      .slice(0, 4)
      .map((approval) => ({
        id: approval.id,
        project: approval.project,
        document: approval.document,
        approverType: approval.approverType,
        approverTypeCode: approval.approverTypeCode,
        daysOverdue: approval.daysPending,
      }));

    const approvalMonthStats = await this.getApprovalMonthStats(
      projectIds,
      approvedStatusCodes,
    );

    return {
      selectedCategory,
      selectedCategoryLabel,
      kpis: {
        totalPending,
        overdueCount,
        averageApprovalTimeDays,
        approvedThisMonth: approvalMonthStats.approvedThisMonth,
        approvedThisMonthChangePct:
          approvalMonthStats.approvedThisMonthChangePct,
      },
      bottlenecks,
      mostOverdue,
      pendingApprovals,
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

  private async getApprovalStatusLookup(): Promise<ApprovalStatusLookupRow[]> {
    return this.prisma.documentApprovalStatusLookup.findMany({
      where: {
        isActive: true,
      },
      select: {
        code: true,
        label: true,
        severity: true,
        displayOrder: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });
  }

  private isApprovedStatus(status: ApprovalStatusLookupRow): boolean {
    const code = status.code.toLowerCase();
    const label = status.label.toLowerCase();
    const severity = status.severity?.toLowerCase();

    return (
      code === "approved" || label === "approved" || severity === "success"
    );
  }

  private isOverdueApproval(
    approval: ApprovalBottleneckPendingApproval,
  ): boolean {
    const statusCode = approval.statusCode.toLowerCase();
    const statusLabel = approval.status.toLowerCase();
    const severity = approval.statusSeverity?.toLowerCase();

    return (
      severity === "danger" ||
      statusCode.includes("overdue") ||
      statusLabel.includes("overdue")
    );
  }

  private getBottlenecks(
    approvals: ApprovalBottleneckPendingApproval[],
  ): ApprovalBottleneckItem[] {
    const countMap = new Map<
      string,
      {
        approverType: string;
        approverTypeCode: string;
        pendingCount: number;
      }
    >();

    for (const approval of approvals) {
      const existing = countMap.get(approval.approverTypeCode);

      if (existing) {
        existing.pendingCount += 1;
      } else {
        countMap.set(approval.approverTypeCode, {
          approverType: approval.approverType,
          approverTypeCode: approval.approverTypeCode,
          pendingCount: 1,
        });
      }
    }

    const counts = Array.from(countMap.values()).sort(
      (a, b) => b.pendingCount - a.pendingCount,
    );

    const maxCount = Math.max(...counts.map((item) => item.pendingCount), 1);

    return counts.map((item) => ({
      ...item,
      widthPercent: Math.max(
        25,
        Math.round((item.pendingCount / maxCount) * 60),
      ),
    }));
  }

  private async getAverageApprovalTimeDays(
    projectIds: string[],
    approvedStatusCodes: string[],
  ) {
    if (projectIds.length === 0 || approvedStatusCodes.length === 0) {
      return 0;
    }

    const approvedDocuments = await this.prisma.planningDocument.findMany({
      where: {
        status: RecordStatus.ACTIVE,
        projectId: {
          in: projectIds,
        },
        approvalStatusCode: {
          in: approvedStatusCodes,
        },
        submittedAt: {
          not: null,
        },
        approvedAt: {
          not: null,
        },
      },
      select: {
        submittedAt: true,
        approvedAt: true,
      },
    });

    if (approvedDocuments.length === 0) {
      return 0;
    }

    const totalDays = approvedDocuments.reduce((sum, document) => {
      if (!document.submittedAt || !document.approvedAt) return sum;

      return (
        sum + this.getDaysBetween(document.submittedAt, document.approvedAt)
      );
    }, 0);

    return Number((totalDays / approvedDocuments.length).toFixed(1));
  }

  private async getApprovalMonthStats(
    projectIds: string[],
    approvedStatusCodes: string[],
  ) {
    if (projectIds.length === 0 || approvedStatusCodes.length === 0) {
      return {
        approvedThisMonth: 0,
        approvedThisMonthChangePct: 0,
      };
    }

    const now = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const approvedThisMonth = await this.prisma.planningDocument.count({
      where: {
        status: RecordStatus.ACTIVE,
        projectId: {
          in: projectIds,
        },
        approvalStatusCode: {
          in: approvedStatusCodes,
        },

        approvedAt: {
          gte: thisMonthStart,
          lt: nextMonthStart,
        },
      },
    });

    const approvedLastMonth = await this.prisma.planningDocument.count({
      where: {
        status: RecordStatus.ACTIVE,
        projectId: {
          in: projectIds,
        },
        approvalStatusCode: {
          in: approvedStatusCodes,
        },
        updatedAt: {
          gte: lastMonthStart,
          lt: thisMonthStart,
        },
      },
    });

    return {
      approvedThisMonth,
      approvedThisMonthChangePct: this.getPercentageChange(
        approvedThisMonth,
        approvedLastMonth,
      ),
    };
  }

  private getPercentageChange(current: number, previous: number) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
  }

  private getDaysBetween(from: Date, to: Date) {
    const msPerDay = 1000 * 60 * 60 * 24;

    return Math.max(0, Math.floor((to.getTime() - from.getTime()) / msPerDay));
  }

  private formatDate(value: Date) {
    return value.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  private getDocumentTitle(fileName: string, revision: string) {
    if (!revision) return fileName;
    return `${fileName} ${revision}`;
  }

  private getApproverGroup(approver?: string | null): ApproverGroup {
    const value = approver?.trim() || "Unassigned";
    const lower = value.toLowerCase();

    if (lower.includes("client")) {
      return {
        code: "client",
        label: "Client",
      };
    }

    if (lower.includes("consultant")) {
      return {
        code: "consultant",
        label: "Consultant",
      };
    }

    if (
      lower.includes("authority") ||
      lower.includes("dm") ||
      lower.includes("rta") ||
      lower.includes("dewa") ||
      lower.includes("municipality")
    ) {
      return {
        code: "authority",
        label: "Authority",
      };
    }

    if (
      lower.includes("internal") ||
      lower.includes("hse") ||
      lower.includes("qaqc") ||
      lower.includes("qa/qc")
    ) {
      return {
        code: "internal",
        label: "Internal",
      };
    }

    return {
      code: this.slugify(value),
      label: value,
    };
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private emptyResponse(
    selectedCategory: string,
    selectedCategoryLabel: string,
  ): ApprovalBottlenecksResponse {
    return {
      selectedCategory,
      selectedCategoryLabel,
      kpis: {
        totalPending: 0,
        overdueCount: 0,
        averageApprovalTimeDays: 0,
        approvedThisMonth: 0,
        approvedThisMonthChangePct: 0,
      },
      bottlenecks: [],
      mostOverdue: [],
      pendingApprovals: [],
    };
  }
}
