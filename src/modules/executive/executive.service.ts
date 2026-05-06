import { Injectable } from "@nestjs/common";
import { HealthStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import {
  enumCountRows,
  screenResponse,
} from "@/common/dashboard/dashboard-response";
@Injectable()
export class ExecutiveService {
  constructor(private prisma: PrismaService) {}
  async portfolioOverview() {
    const [
      activeProjects,
      projects,
      healthGroups,
      pendingApprovals,
      delayedMilestones,
      billingReady,
    ] = await Promise.all([
      this.prisma.project.count({ where: { status: "ACTIVE" } }),
      this.prisma.project.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          projectManager: { select: { id: true, name: true } },
          _count: {
            select: { milestones: true, activities: true, ncrs: true },
          },
        },
      }),
      this.prisma.project.groupBy({
        by: ["healthStatus"],
        _count: { healthStatus: true },
      }),
      this.prisma.tender.count({ where: { stage: "APPROVAL_PENDING" } }),
      this.prisma.planningMilestone.count({
        where: {
          healthStatus: { in: [HealthStatus.DELAYED, HealthStatus.CRITICAL] },
        },
      }),
      this.prisma.project.aggregate({
        _sum: { contractValue: true },
        where: {
          healthStatus: { in: [HealthStatus.ON_TRACK, HealthStatus.AT_RISK] },
        },
      }),
    ]);
    const avg = projects.length
      ? Math.round(
          projects.reduce((s, p) => s + p.completionPct, 0) / projects.length,
        )
      : 0;
    return screenResponse("portfolio-overview", "Portfolio overview", {
      kpis: {
        activeProjects,
        portfolioCompletion: avg,
        delayedMilestones,
        pendingApprovals,
        billingReady: billingReady._sum.contractValue ?? 0,
      },
      charts: { healthStatus: enumCountRows(healthGroups, "healthStatus") },
      table: projects,
    });
  }
  async projectHealth() {
    const [projects, issues, ncrs] = await Promise.all([
      this.prisma.project.findMany({
        orderBy: [{ healthStatus: "asc" }, { updatedAt: "desc" }],
        include: { projectManager: { select: { name: true } } },
      }),
      this.prisma.planningActivity.findMany({
        where: {
          healthStatus: {
            in: [
              HealthStatus.AT_RISK,
              HealthStatus.DELAYED,
              HealthStatus.CRITICAL,
            ],
          },
        },
        take: 20,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.ncr.findMany({ take: 10, orderBy: { dateRaised: "desc" } }),
    ]);
    return screenResponse("project-health", "Project health", {
      kpis: {
        totalProjects: projects.length,
        critical: projects.filter((p) => p.healthStatus === "CRITICAL").length,
        delayed: projects.filter((p) => p.healthStatus === "DELAYED").length,
        openNcrs: ncrs.length,
      },
      table: projects,
      issues,
      ncrs,
    });
  }
  async revenueBilling() {
    const projects = await this.prisma.project.findMany({
      orderBy: { contractValue: "desc" },
      include: { projectManager: { select: { name: true } } },
    });
    const totalContractValue = projects.reduce(
      (s: any, p: any) => s + Number(p.contractValue ?? 0),
      0,
    );
    const earnedValue = projects.reduce(
      (s: any, p: any) =>
        s + (Number(p.contractValue ?? 0) * (p.completionPct ?? 0)) / 100,
      0,
    );
    return screenResponse("revenue-billing", "Revenue & billing", {
      kpis: {
        totalContractValue,
        earnedValue,
        billingReadyEstimate: earnedValue * 0.35,
        projects: projects.length,
      },
      table: projects.map((p) => ({
        ...p,
        earnedValue:
          (Number(p.contractValue ?? 0) * (p.completionPct ?? 0)) / 100,
      })),
    });
  }
  async approvalBottlenecks() {
    const [tenders, milestones, activities] = await Promise.all([
      this.prisma.tender.findMany({
        where: { stage: "APPROVAL_PENDING" },
        orderBy: { updatedAt: "asc" },
      }),
      this.prisma.planningMilestone.findMany({
        where: {
          healthStatus: {
            in: [
              HealthStatus.AT_RISK,
              HealthStatus.DELAYED,
              HealthStatus.CRITICAL,
            ],
          },
        },
        include: { project: { select: { code: true, name: true } } },
      }),
      this.prisma.planningActivity.findMany({
        where: {
          healthStatus: {
            in: [
              HealthStatus.AT_RISK,
              HealthStatus.DELAYED,
              HealthStatus.CRITICAL,
            ],
          },
        },
        take: 20,
        include: { project: { select: { code: true, name: true } } },
      }),
    ]);
    return screenResponse("approval-bottlenecks", "Approval bottlenecks", {
      kpis: {
        pendingTenderApprovals: tenders.length,
        delayedMilestones: milestones.length,
        blockedActivities: activities.length,
      },
      tenders,
      milestones,
      activities,
    });
  }
  async documentationStatus() {
    const [documents, projects] = await Promise.all([
      this.prisma.planningDocument.findMany({
        orderBy: { uploadedAt: "desc" },
      }),
      this.prisma.project.findMany({
        select: { id: true, code: true, name: true, healthStatus: true },
      }),
    ]);
    return screenResponse("documentation-status", "Documentation status", {
      kpis: {
        uploadedDocuments: documents.length,
        activeProjects: projects.length,
        missingBaseline: Math.max(projects.length - documents.length, 0),
      },
      documents,
      projects,
    });
  }
  async projectDrillDown(projectId?: string) {
    const selected =
      projectId ||
      (
        await this.prisma.project.findFirst({
          orderBy: { createdAt: "desc" },
          select: { id: true },
        })
      )?.id;
    const project = selected
      ? await this.prisma.project.findUnique({
          where: { id: selected },
          include: {
            projectManager: { select: { name: true, email: true } },
            activities: true,
            milestones: true,
            resources: true,
            inspections: true,
            ncrs: true,
            materialRequests: true,
            purchaseOrders: true,
            assets: true,
          },
        })
      : null;
    return screenResponse("project-drill-down", "Project drill-down", {
      project,
    });
  }
  async getLookups() {
    const portfolioCategories = await this.prisma.portfolioCategory.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        displayOrder: true,
        isActive: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    const projectHealthStatuses =
      await this.prisma.projectHealthStatusLookup.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          code: true,
          label: true,
          severity: true,
          displayOrder: true,
          isActive: true,
        },
        orderBy: {
          displayOrder: "asc",
        },
      });

    return {
      portfolioCategories,
      projectHealthStatuses,
    };
  }
}
