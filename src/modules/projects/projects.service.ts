import { Injectable } from '@nestjs/common';
import { HealthStatus } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { screenResponse } from '@/common/dashboard/dashboard-response';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // =========================================================
  // 🔥 HEALTH HELPERS
  // =========================================================

  private calculateMilestoneProgress(milestones: any[]): number {
    if (!milestones?.length) return 0;

    const completed = milestones.filter(
      (m) => m.actualDate !== null,
    ).length;

    return Math.round((completed / milestones.length) * 100);
  }

  private calculateProjectHealth(milestones: any[]): HealthStatus {
    const total = milestones?.length || 0;

    if (total === 0) {
      return HealthStatus.ON_TRACK;
    }

    const completed = milestones.filter(
      (m) => m.actualDate !== null,
    ).length;

    const delayed = milestones.filter(
      (m) => m.delayDays > 0,
    ).length;

    const critical = milestones.filter(
      (m) =>
        m.healthStatus === HealthStatus.CRITICAL ||
        m.delayDays > 10,
    ).length;

    const completionPct = Math.round(
      (completed / total) * 100,
    );

    // 🔴 CRITICAL
    if (critical > 0) {
      return HealthStatus.CRITICAL;
    }

    // 🔴 DELAYED
    if (
      completionPct < 50 ||
      delayed > total * 0.3
    ) {
      return HealthStatus.DELAYED;
    }

    // 🟡 AT RISK
    if (
      completionPct < 80 ||
      delayed > 0
    ) {
      return HealthStatus.AT_RISK;
    }

    // 🟢 ON TRACK
    return HealthStatus.ON_TRACK;
  }

  // =========================================================
  // PROJECTS
  // =========================================================

  async findAll() {
    const projects = await this.prisma.project.findMany({
      include: {
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        milestones: true,

        _count: {
          select: {
            activities: true,
            milestones: true,
            resources: true,
            inspections: true,
            ncrs: true,
            materialRequests: true,
            purchaseOrders: true,
            assets: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects.map((project) => {
      const progress = this.calculateMilestoneProgress(
        project.milestones,
      );

      const healthStatus = this.calculateProjectHealth(
        project.milestones,
      );

      return {
        ...project,
        progress,
        healthStatus,
      };
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },

      include: {
        activities: true,
        milestones: true,
        resources: true,
        inspections: true,
        ncrs: true,
        materialRequests: true,
        purchaseOrders: true,
        assets: true,

        projectManager: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) return null;

    const progress = this.calculateMilestoneProgress(
      project.milestones,
    );

    const healthStatus = this.calculateProjectHealth(
      project.milestones,
    );

    return {
      ...project,
      progress,
      healthStatus,
    };
  }

  private async firstProjectId(projectId?: string) {
    return (
      projectId ||
      (
        await this.prisma.project.findFirst({
          select: { id: true },
          orderBy: { createdAt: 'desc' },
        })
      )?.id
    );
  }

  async projectWorkspace(projectId?: string) {
    const id = await this.firstProjectId(projectId);

    const project = id
      ? await this.findOne(id)
      : null;

    return screenResponse(
      'project-workspace',
      'Project workspace',
      { project },
    );
  }

  // =========================================================
  // MILESTONE TRACKER
  // =========================================================

  async milestoneTracker() {
    const rows =
      await this.prisma.planningMilestone.findMany({
        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },

        orderBy: {
          baselineDate: 'asc',
        },
      });

    return screenResponse(
      'milestone-tracker',
      'Milestone tracker',
      {
        kpis: {
          total: rows.length,

          delayed: rows.filter(
            (r) => r.delayDays > 0,
          ).length,

          critical: rows.filter(
            (r) =>
              r.healthStatus ===
              HealthStatus.CRITICAL,
          ).length,
        },

        table: rows,
      },
    );
  }

  // =========================================================
  // WORK PACKAGE TRACKER
  // =========================================================

  async workPackageTracker() {
    const rows =
      await this.prisma.planningActivity.findMany({
        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },

        orderBy: [
          { wbsCode: 'asc' },
          { plannedStart: 'asc' },
        ],
      });

    return screenResponse(
      'work-package-tracker',
      'Work package tracker',
      {
        kpis: {
          packages: new Set(
            rows.map((r) => r.wbsCode),
          ).size,

          activities: rows.length,

          critical: rows.filter(
            (r) => r.isCritical,
          ).length,
        },

        table: rows,
      },
    );
  }

  // =========================================================
  // SITE PROGRESS VIEW
  // =========================================================

  async siteProgressView() {
    const rows = await this.findAll();

    return screenResponse(
      'site-progress-view',
      'Site progress view',
      {
        kpis: {
          projects: rows.length,

          avgProgress: avg(
            rows.map((r: any) => r.progress || 0),
          ),
        },

        table: rows.map((p: any) => ({
          id: p.id,
          code: p.code,
          name: p.name,

          progress: p.progress,

          healthStatus: p.healthStatus,
        })),
      },
    );
  }

  // =========================================================
  // TASK ASSIGNMENT BOARD
  // =========================================================

  async taskAssignmentBoard() {
    const rows =
      await this.prisma.planningActivity.findMany({
        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },

        orderBy: {
          updatedAt: 'desc',
        },

        take: 100,
      });

    return screenResponse(
      'task-assignment-board',
      'Task & assignment board',
      {
        kpis: {
          tasks: rows.length,

          open: rows.filter(
            (r) => !r.actualFinish,
          ).length,

          delayed: rows.filter(
            (r) =>
              r.healthStatus ===
                HealthStatus.DELAYED ||
              r.healthStatus ===
                HealthStatus.CRITICAL,
          ).length,
        },

        table: rows,
      },
    );
  }

  // =========================================================
  // RISK / ISSUE / BLOCKER
  // =========================================================

  async riskIssueBlocker() {
    const [activities, ncrs, resources] =
      await Promise.all([
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

          include: {
            project: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        }),

        this.prisma.ncr.findMany({
          include: {
            project: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        }),

        this.prisma.planningResource.findMany({
          where: {
            healthStatus: {
              in: [
                HealthStatus.AT_RISK,
                HealthStatus.DELAYED,
                HealthStatus.CRITICAL,
              ],
            },
          },

          include: {
            project: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        }),
      ]);

    return screenResponse(
      'risk-issue-blocker',
      'Risk / issue / blocker',
      {
        kpis: {
          issues: activities.length,
          ncrs: ncrs.length,
          resourceShortages: resources.length,
        },

        activities,
        ncrs,
        resources,
      },
    );
  }

  // =========================================================
  // DOCUMENT READINESS
  // =========================================================

  async documentReadiness() {
    const docs =
      await this.prisma.planningDocument.findMany({
        orderBy: {
          uploadedAt: 'desc',
        },
      });

    const projects = await this.findAll();

    return screenResponse(
      'document-readiness',
      'Document readiness',
      {
        kpis: {
          documents: docs.length,
          projects: projects.length,

          missing: Math.max(
            projects.length - docs.length,
            0,
          ),
        },

        documents: docs,
        projects,
      },
    );
  }

  // =========================================================
  // APPROVAL FOLLOW UP
  // =========================================================

  async approvalFollowUp() {
    const milestones =
      await this.prisma.planningMilestone.findMany({
        where: {
          healthStatus: {
            in: [
              HealthStatus.AT_RISK,
              HealthStatus.DELAYED,
              HealthStatus.CRITICAL,
            ],
          },
        },

        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

    return screenResponse(
      'approval-follow-up',
      'Approval follow-up',
      {
        kpis: {
          pending: milestones.length,

          delayed: milestones.filter(
            (m) => m.delayDays > 0,
          ).length,
        },

        table: milestones,
      },
    );
  }

  // =========================================================
  // INSPECTION FOLLOW UP
  // =========================================================

  async inspectionFollowUp() {
    const inspections =
      await this.prisma.inspection.findMany({
        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },

        orderBy: {
          scheduledAt: 'asc',
        },
      });

    return screenResponse(
      'inspection-follow-up',
      'Inspection follow-up',
      {
        kpis: {
          inspections: inspections.length,

          pending: inspections.filter(
            (i) =>
              !i.outcome ||
              i.outcome === 'Scheduled',
          ).length,
        },

        table: inspections,
      },
    );
  }

  // =========================================================
  // MATERIAL RESOURCE
  // =========================================================

  async materialResource() {
    const [mrs, pos, resources] =
      await Promise.all([
        this.prisma.materialRequest.findMany({
          include: {
            project: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        }),

        this.prisma.purchaseOrder.findMany({
          include: {
            project: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        }),

        this.prisma.planningResource.findMany({
          include: {
            project: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        }),
      ]);

    return screenResponse(
      'material-resource',
      'Material & resource',
      {
        kpis: {
          materialRequests: mrs.length,
          purchaseOrders: pos.length,
          resourceRows: resources.length,

          shortages: resources.filter(
            (r) => r.availableQty < r.plannedQty,
          ).length,
        },

        materialRequests: mrs,
        purchaseOrders: pos,
        resources,
      },
    );
  }

  // =========================================================
  // COMMERCIAL PROGRESS
  // =========================================================

  async commercialProgress() {
    const projects = await this.findAll();

    return screenResponse(
      'commercial-progress',
      'Commercial progress',
      {
        kpis: {
          contractValue: projects.reduce(
            (s: any, p: any) =>
              s + Number(p.contractValue ?? 0),
            0,
          ),

          earnedValue: projects.reduce(
            (s: any, p: any) =>
              s +
              (Number(p.contractValue ?? 0) *
                p.progress) /
                100,
            0,
          ),
        },

        table: projects.map((p: any) => ({
          ...p,

          earnedValue:
            (Number(p.contractValue ?? 0) *
              p.progress) /
            100,
        })),
      },
    );
  }

  // =========================================================
  // PLANNING OVERVIEW
  // =========================================================

  async planningOverview() {
    const rows = await this.findAll();

    return screenResponse(
      'planning-overview',
      'Planning overview',
      {
        kpis: {
          projects: rows.length,

          avgProgress: avg(
            rows.map((r: any) => r.progress || 0),
          ),
        },

        table: rows,
      },
    );
  }

  // =========================================================
  // WBS TIMELINE
  // =========================================================

  async wbsTimeline() {
    const rows =
      await this.prisma.planningActivity.findMany({
        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },

        orderBy: [{ plannedStart: 'asc' }],
      });

    return screenResponse(
      'wbs-timeline',
      'WBS timeline',
      {
        kpis: {
          activities: rows.length,

          wbs: new Set(
            rows.map((r) => r.wbsCode),
          ).size,
        },

        timeline: rows,
      },
    );
  }

  // =========================================================
  // MILESTONE REGISTER
  // =========================================================

  async milestoneRegister() {
    const rows =
      await this.prisma.planningMilestone.findMany({
        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },

        orderBy: {
          baselineDate: 'asc',
        },
      });

    return screenResponse(
      'milestone-register',
      'Milestone register',
      {
        kpis: {
          milestones: rows.length,

          delayed: rows.filter(
            (r) => r.delayDays > 0,
          ).length,
        },

        table: rows,
      },
    );
  }

  // =========================================================
  // ACTIVITY REGISTER
  // =========================================================

  async activityRegister() {
    const rows =
      await this.prisma.planningActivity.findMany({
        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },

        orderBy: [{ activityId: 'asc' }],

        take: 500,
      });

    return screenResponse(
      'activity-register',
      'Activity register',
      {
        kpis: {
          activities: rows.length,

          complete: rows.filter(
            (r) => r.percentComplete === 100,
          ).length,

          critical: rows.filter(
            (r) => r.isCritical,
          ).length,
        },

        table: rows,
      },
    );
  }

  // =========================================================
  // CRITICAL FLOAT VIEW
  // =========================================================

  async criticalFloatView() {
    const rows =
      await this.prisma.planningActivity.findMany({
        where: {
          OR: [
            { isCritical: true },
            { floatDays: { lte: 0 } },
          ],
        },

        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },

        orderBy: [
          { floatDays: 'asc' },
          { plannedStart: 'asc' },
        ],
      });

    return screenResponse(
      'critical-float-view',
      'Critical / float view',
      {
        kpis: {
          critical: rows.filter(
            (r) => r.isCritical,
          ).length,

          negativeFloat: rows.filter(
            (r) => (r.floatDays ?? 0) < 0,
          ).length,
        },

        table: rows,
      },
    );
  }

  // =========================================================
  // RESOURCE PLAN
  // =========================================================

  async resourcePlan() {
    const rows =
      await this.prisma.planningResource.findMany({
        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },

        orderBy: {
          requiredDate: 'asc',
        },
      });

    return screenResponse(
      'resource-plan',
      'Resource plan',
      {
        kpis: {
          resources: rows.length,

          shortages: rows.filter(
            (r) => r.availableQty < r.plannedQty,
          ).length,

          plannedQty: rows.reduce(
            (s, r) => s + r.plannedQty,
            0,
          ),

          availableQty: rows.reduce(
            (s, r) => s + r.availableQty,
            0,
          ),
        },

        table: rows,
      },
    );
  }

  // =========================================================
  // MONTHLY LOOKAHEAD
  // =========================================================

  async monthlyLookahead() {
    const rows =
      await this.prisma.planningActivity.findMany({
        where: {
          actualFinish: null,
        },

        include: {
          project: {
            select: {
              code: true,
              name: true,
            },
          },
        },

        orderBy: {
          plannedStart: 'asc',
        },

        take: 100,
      });

    return screenResponse(
      'monthly-lookahead',
      'Monthly lookahead',
      {
        kpis: {
          upcoming: rows.length,

          critical: rows.filter(
            (r) => r.isCritical,
          ).length,
        },

        table: rows,
      },
    );
  }
}

function avg(values: number[]) {
  return values.length
    ? Math.round(
        values.reduce((a, b) => a + b, 0) /
          values.length,
      )
    : 0;
}