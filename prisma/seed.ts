// prisma/seed.ts
import "dotenv/config";

import {
  PrismaClient,
  HealthStatus,
  RecordStatus,
  UserRole,
} from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

function d(value: string) {
  return new Date(value);
}

async function main() {
  console.log("Starting seed...");

  /* ---------------------------------- */
  /* USERS */
  /* ---------------------------------- */

  const passwordHash = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD || "Admin@123",
    10,
  );

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin User",
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const pm = await prisma.user.upsert({
    where: { email: "pm@example.com" },
    update: {
      name: "A. Karim",
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
    create: {
      name: "A. Karim",
      email: "pm@example.com",
      passwordHash: "seed-password-hash",
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
  });

  const pm2 = await prisma.user.upsert({
    where: { email: "pm2@example.com" },
    update: {
      name: "N. Rashid",
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
    create: {
      name: "N. Rashid",
      email: "pm2@example.com",
      passwordHash: "seed-password-hash",
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
  });

  const pm3 = await prisma.user.upsert({
    where: { email: "pm3@example.com" },
    update: {
      name: "S. Mehta",
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
    create: {
      name: "S. Mehta",
      email: "pm3@example.com",
      passwordHash: "seed-password-hash",
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
  });

  const pm4 = await prisma.user.upsert({
    where: { email: "pm4@example.com" },
    update: {
      name: "F. Al Hamad",
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
    create: {
      name: "F. Al Hamad",
      email: "pm4@example.com",
      passwordHash: "seed-password-hash",
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
  });

  /* ---------------------------------- */
  /* PORTFOLIO CATEGORIES */
  /* ---------------------------------- */

  const itsCategory = await prisma.portfolioCategory.upsert({
    where: { code: "its" },
    update: {
      name: "ITS Projects",
      description: "Intelligent Transport Systems projects",
      isActive: true,
      displayOrder: 1,
    },
    create: {
      code: "its",
      name: "ITS Projects",
      description: "Intelligent Transport Systems projects",
      isActive: true,
      displayOrder: 1,
    },
  });

  const trafficCategory = await prisma.portfolioCategory.upsert({
    where: { code: "traffic" },
    update: {
      name: "Traffic Projects",
      description: "Traffic infrastructure projects",
      isActive: true,
      displayOrder: 2,
    },
    create: {
      code: "traffic",
      name: "Traffic Projects",
      description: "Traffic infrastructure projects",
      isActive: true,
      displayOrder: 2,
    },
  });

  const itsMaintenanceCategory = await prisma.portfolioCategory.upsert({
    where: { code: "its-maint" },
    update: {
      name: "ITS Maintenance",
      description: "ITS maintenance works",
      isActive: true,
      displayOrder: 3,
    },
    create: {
      code: "its-maint",
      name: "ITS Maintenance",
      description: "ITS maintenance works",
      isActive: true,
      displayOrder: 3,
    },
  });

  const trafficMaintenanceCategory = await prisma.portfolioCategory.upsert({
    where: { code: "traffic-maint" },
    update: {
      name: "Traffic Maintenance",
      description: "Traffic maintenance works",
      isActive: true,
      displayOrder: 4,
    },
    create: {
      code: "traffic-maint",
      name: "Traffic Maintenance",
      description: "Traffic maintenance works",
      isActive: true,
      displayOrder: 4,
    },
  });

  const categoryMap = {
    its: itsCategory,
    traffic: trafficCategory,
    "its-maint": itsMaintenanceCategory,
    "traffic-maint": trafficMaintenanceCategory,
  };

  type CategoryCode = keyof typeof categoryMap;

  type SeedDocumentInput = {
    fileName: string;
    revision: string;
    planType?: string;
    stageCode?: string;
    approvalStatusCode?: string;
    approver?: string;
    submittedAt?: Date;
    dueDate?: Date;
    approvedAt?: Date | null;
    count?: number;
    baselineStart?: Date;
    baselineFinish?: Date;
    forecastFinish?: Date;
    uploadedBy?: string;
  };

  type SeedDocumentationStatusRecord = {
    id: string;
    stageCode: string;
    categoryCode: CategoryCode;
    document: string;
    projectCode: string;
    revision: string;
    submittedAt: Date;
    approver: string;
    approvalStatusCode: string;
    count: number;
    overdueDays?: number;
  };

  const DAY_MS = 24 * 60 * 60 * 1000;

  function getDocumentationDueDate(record: SeedDocumentationStatusRecord) {
    if (record.overdueDays && record.overdueDays > 0) {
      return new Date(Date.now() - record.overdueDays * DAY_MS);
    }

    if (
      record.approvalStatusCode === "approved" ||
      record.approvalStatusCode === "rejected"
    ) {
      return record.submittedAt;
    }

    return new Date(Date.now() + 21 * DAY_MS);
  }

  /* ---------------------------------- */
  /* LOOKUP TABLES */
  /* ---------------------------------- */

  async function seedLookupTables() {
    const documentationStages = [
      {
        code: "pre-construction",
        label: "Pre-construction",
        displayOrder: 1,
      },
      {
        code: "design",
        label: "Design",
        displayOrder: 2,
      },
      {
        code: "procurement",
        label: "Procurement",
        displayOrder: 3,
      },
      {
        code: "construction",
        label: "Construction",
        displayOrder: 4,
      },
      {
        code: "testing-commissioning",
        label: "Testing & commissioning",
        displayOrder: 5,
      },
      {
        code: "closeout",
        label: "Closeout",
        displayOrder: 6,
      },
    ];

    for (const stage of documentationStages) {
      await prisma.documentationStageLookup.upsert({
        where: { code: stage.code },
        update: {
          label: stage.label,
          displayOrder: stage.displayOrder,
          isActive: true,
        },
        create: {
          code: stage.code,
          label: stage.label,
          displayOrder: stage.displayOrder,
          isActive: true,
        },
      });
    }

    const documentApprovalStatuses = [
      {
        code: "approved",
        label: "Approved",
        severity: "success",
        displayOrder: 1,
      },
      {
        code: "under-review",
        label: "Under review",
        severity: "info",
        displayOrder: 2,
      },
      {
        code: "in-preparation",
        label: "In preparation",
        severity: "neutral",
        displayOrder: 3,
      },
      {
        code: "overdue",
        label: "Overdue",
        severity: "danger",
        displayOrder: 4,
      },
      {
        code: "at-risk",
        label: "At risk",
        severity: "warning",
        displayOrder: 5,
      },
      {
        code: "rejected",
        label: "Rejected",
        severity: "danger",
        displayOrder: 6,
      },
    ];

    for (const status of documentApprovalStatuses) {
      await prisma.documentApprovalStatusLookup.upsert({
        where: { code: status.code },
        update: {
          label: status.label,
          severity: status.severity,
          displayOrder: status.displayOrder,
          isActive: true,
        },
        create: {
          code: status.code,
          label: status.label,
          severity: status.severity,
          displayOrder: status.displayOrder,
          isActive: true,
        },
      });
    }

    const projectHealthStatuses = [
      {
        code: "ON_TRACK",
        label: "On track",
        severity: "success",
        displayOrder: 1,
      },
      {
        code: "AT_RISK",
        label: "At risk",
        severity: "warning",
        displayOrder: 2,
      },
      {
        code: "DELAYED",
        label: "Delayed",
        severity: "warning",
        displayOrder: 3,
      },
      {
        code: "CRITICAL",
        label: "Critical",
        severity: "danger",
        displayOrder: 4,
      },
    ];

    for (const status of projectHealthStatuses) {
      await prisma.projectHealthStatusLookup.upsert({
        where: { code: status.code },
        update: {
          label: status.label,
          severity: status.severity,
          displayOrder: status.displayOrder,
          isActive: true,
        },
        create: {
          code: status.code,
          label: status.label,
          severity: status.severity,
          displayOrder: status.displayOrder,
          isActive: true,
        },
      });
    }

    const milestoneStatuses = [
      {
        code: "complete",
        label: "Complete",
        severity: "success",
        displayOrder: 1,
      },
      {
        code: "delayed",
        label: "Delayed",
        severity: "danger",
        displayOrder: 2,
      },
      {
        code: "at-risk",
        label: "At risk",
        severity: "warning",
        displayOrder: 3,
      },
      {
        code: "upcoming",
        label: "Upcoming",
        severity: "neutral",
        displayOrder: 4,
      },
    ];

    for (const status of milestoneStatuses) {
      await prisma.milestoneStatusLookup.upsert({
        where: { code: status.code },
        update: {
          label: status.label,
          severity: status.severity,
          displayOrder: status.displayOrder,
          isActive: true,
        },
        create: {
          code: status.code,
          label: status.label,
          severity: status.severity,
          displayOrder: status.displayOrder,
          isActive: true,
        },
      });
    }

    const activitySeverities = [
      {
        code: "success",
        label: "Success",
        displayOrder: 1,
      },
      {
        code: "warning",
        label: "Warning",
        displayOrder: 2,
      },
      {
        code: "danger",
        label: "Danger",
        displayOrder: 3,
      },
    ];

    for (const severity of activitySeverities) {
      await prisma.activitySeverityLookup.upsert({
        where: { code: severity.code },
        update: {
          label: severity.label,
          displayOrder: severity.displayOrder,
          isActive: true,
        },
        create: {
          code: severity.code,
          label: severity.label,
          displayOrder: severity.displayOrder,
          isActive: true,
        },
      });
    }

    console.log("Lookup tables seeded.");
  }

  await seedLookupTables();

  /* ---------------------------------- */
  /* HELPER: SEED PROJECT */
  /* ---------------------------------- */

  async function seedProject(input: {
    code: string;
    name: string;
    clientName: string;
    categoryCode: CategoryCode;
    projectManagerId: string;
    contractValue?: number;
    completionPct: number;
    plannedProgress: number;
    actualProgress: number;
    healthStatus: HealthStatus;
    delayedApprovals?: number;
    blockedItems?: number;
    billingReadyAmount?: number | null;
    plannedStart?: Date;
    plannedFinish?: Date;
    forecastFinish?: Date;
    document?: SeedDocumentInput;
    documents?: SeedDocumentInput[];
    activities?: {
      wbsCode?: string;
      activityId: string;
      activityName: string;
      discipline?: string;
      location?: string;
      durationDays?: number;
      plannedStart?: Date;
      plannedFinish?: Date;
      actualStart?: Date;
      actualFinish?: Date;
      floatDays?: number;
      percentComplete?: number;
      owner?: string;
      isCritical?: boolean;
      healthStatus?: HealthStatus;
    }[];
    milestones?: {
      milestoneCode?: string;
      milestoneName: string;
      baselineDate?: Date;
      forecastDate?: Date;
      actualDate?: Date;
      delayDays?: number;
      linkedActivity?: string;
      healthStatus?: HealthStatus;
    }[];
  }) {
    const category = categoryMap[input.categoryCode];

    const projectData = {
      name: input.name,
      clientName: input.clientName,
      portfolio: category.code,
      portfolioCategoryId: category.id,
      projectManagerId: input.projectManagerId,
      contractValue: input.contractValue ?? null,
      completionPct: input.completionPct,
      plannedProgress: input.plannedProgress,
      actualProgress: input.actualProgress,
      healthStatus: input.healthStatus,
      delayedApprovals: input.delayedApprovals ?? 0,
      blockedItems: input.blockedItems ?? 0,
      billingReadyAmount: input.billingReadyAmount ?? null,
      plannedStart: input.plannedStart ?? null,
      plannedFinish: input.plannedFinish ?? null,
      forecastFinish: input.forecastFinish ?? null,
      status: RecordStatus.ACTIVE,
    };

    const project = await prisma.project.upsert({
      where: { code: input.code },
      update: projectData,
      create: {
        code: input.code,
        ...projectData,
      },
    });

    let document: { id: string } | null = null;

    async function upsertPlanningDocument(
      projectId: string,
      doc: SeedDocumentInput,
    ) {
      const existingDocument = await prisma.planningDocument.findFirst({
        where: {
          projectId,
          fileName: doc.fileName,
          revision: doc.revision,
        },
      });

      const documentData = {
        planType: doc.planType ?? "BASELINE",
        stageCode: doc.stageCode ?? "pre-construction",
        approvalStatusCode: doc.approvalStatusCode ?? "in-preparation",
        approver: doc.approver ?? null,
        submittedAt: doc.submittedAt ?? null,
        dueDate: doc.dueDate ?? null,
        approvedAt:
          doc.approvedAt ??
          (doc.approvalStatusCode === "approved"
            ? (doc.submittedAt ?? null)
            : null),
        count: doc.count ?? 1,
        baselineStart: doc.baselineStart ?? null,
        baselineFinish: doc.baselineFinish ?? null,
        forecastFinish: doc.forecastFinish ?? null,
        status: RecordStatus.ACTIVE,
        uploadedBy: doc.uploadedBy ?? admin.name,
      };

      if (existingDocument) {
        return prisma.planningDocument.update({
          where: { id: existingDocument.id },
          data: documentData,
        });
      }

      return prisma.planningDocument.create({
        data: {
          projectId,
          fileName: doc.fileName,
          revision: doc.revision,
          ...documentData,
        },
      });
    }

    const documentInputs =
      input.documents && input.documents.length > 0
        ? input.documents
        : input.document
          ? [input.document]
          : [];

    for (const doc of documentInputs) {
      const savedDocument = await upsertPlanningDocument(project.id, doc);

      if (!document) {
        document = savedDocument;
      }
    }

    if (input.activities?.length) {
      for (const activity of input.activities) {
        await prisma.planningActivity.upsert({
          where: {
            projectId_activityId: {
              projectId: project.id,
              activityId: activity.activityId,
            },
          },
          update: {
            documentId: document?.id ?? null,
            wbsCode: activity.wbsCode ?? null,
            activityName: activity.activityName,
            discipline: activity.discipline ?? null,
            location: activity.location ?? null,
            durationDays: activity.durationDays ?? null,
            plannedStart: activity.plannedStart ?? null,
            plannedFinish: activity.plannedFinish ?? null,
            actualStart: activity.actualStart ?? null,
            actualFinish: activity.actualFinish ?? null,
            floatDays: activity.floatDays ?? null,
            percentComplete: activity.percentComplete ?? 0,
            owner: activity.owner ?? null,
            isCritical: activity.isCritical ?? false,
            healthStatus: activity.healthStatus ?? HealthStatus.ON_TRACK,
          },
          create: {
            projectId: project.id,
            documentId: document?.id ?? null,
            wbsCode: activity.wbsCode ?? null,
            activityId: activity.activityId,
            activityName: activity.activityName,
            discipline: activity.discipline ?? null,
            location: activity.location ?? null,
            durationDays: activity.durationDays ?? null,
            plannedStart: activity.plannedStart ?? null,
            plannedFinish: activity.plannedFinish ?? null,
            actualStart: activity.actualStart ?? null,
            actualFinish: activity.actualFinish ?? null,
            floatDays: activity.floatDays ?? null,
            percentComplete: activity.percentComplete ?? 0,
            owner: activity.owner ?? null,
            isCritical: activity.isCritical ?? false,
            healthStatus: activity.healthStatus ?? HealthStatus.ON_TRACK,
          },
        });
      }
    }

    if (input.milestones?.length) {
      for (const milestone of input.milestones) {
        const existingMilestone = await prisma.planningMilestone.findFirst({
          where: {
            projectId: project.id,
            milestoneCode: milestone.milestoneCode ?? null,
            milestoneName: milestone.milestoneName,
          },
        });

        if (existingMilestone) {
          await prisma.planningMilestone.update({
            where: { id: existingMilestone.id },
            data: {
              documentId: document?.id ?? null,
              baselineDate: milestone.baselineDate ?? null,
              forecastDate: milestone.forecastDate ?? null,
              actualDate: milestone.actualDate ?? null,
              delayDays: milestone.delayDays ?? 0,
              linkedActivity: milestone.linkedActivity ?? null,
              healthStatus: milestone.healthStatus ?? HealthStatus.ON_TRACK,
            },
          });
        } else {
          await prisma.planningMilestone.create({
            data: {
              projectId: project.id,
              documentId: document?.id ?? null,
              milestoneCode: milestone.milestoneCode ?? null,
              milestoneName: milestone.milestoneName,
              baselineDate: milestone.baselineDate ?? null,
              forecastDate: milestone.forecastDate ?? null,
              actualDate: milestone.actualDate ?? null,
              delayDays: milestone.delayDays ?? 0,
              linkedActivity: milestone.linkedActivity ?? null,
              healthStatus: milestone.healthStatus ?? HealthStatus.ON_TRACK,
            },
          });
        }
      }
    }

    return project;
  }

  /* ---------------------------------- */
  /* HELPER: SEED DOCUMENTATION STATUS */
  /* ---------------------------------- */

  async function seedDocumentationStatusRecords() {
    const records: SeedDocumentationStatusRecord[] = [
      {
        id: "pre-its-1",
        stageCode: "pre-construction",
        categoryCode: "its",
        document: "Permit drawings set A",
        projectCode: "PRJ-001",
        revision: "R03",
        submittedAt: d("2026-03-17"),
        approver: "Authority",
        approvalStatusCode: "overdue",
        count: 18,
        overdueDays: 18,
      },
      {
        id: "pre-its-2",
        stageCode: "pre-construction",
        categoryCode: "its",
        document: "Traffic diversion concept",
        projectCode: "PRJ-002",
        revision: "R01",
        submittedAt: d("2026-03-28"),
        approver: "Client",
        approvalStatusCode: "under-review",
        count: 12,
      },
      {
        id: "pre-traffic-1",
        stageCode: "pre-construction",
        categoryCode: "traffic",
        document: "NOC submission package",
        projectCode: "PRJ-003",
        revision: "R02",
        submittedAt: d("2026-03-20"),
        approver: "Authority",
        approvalStatusCode: "at-risk",
        count: 15,
        overdueDays: 9,
      },
      {
        id: "pre-traffic-2",
        stageCode: "pre-construction",
        categoryCode: "traffic",
        document: "Project execution plan",
        projectCode: "PRJ-004",
        revision: "R02",
        submittedAt: d("2026-04-01"),
        approver: "Client",
        approvalStatusCode: "approved",
        count: 21,
      },
      {
        id: "pre-its-maint-1",
        stageCode: "pre-construction",
        categoryCode: "its-maint",
        document: "Maintenance readiness plan",
        projectCode: "PRJ-005",
        revision: "R01",
        submittedAt: d("2026-03-24"),
        approver: "Internal",
        approvalStatusCode: "under-review",
        count: 10,
      },
      {
        id: "pre-traffic-maint-1",
        stageCode: "pre-construction",
        categoryCode: "traffic-maint",
        document: "Signal maintenance method statement",
        projectCode: "PRJ-007",
        revision: "R02",
        submittedAt: d("2026-03-22"),
        approver: "Consultant",
        approvalStatusCode: "overdue",
        count: 11,
        overdueDays: 14,
      },
      {
        id: "design-its-1",
        stageCode: "design",
        categoryCode: "its",
        document: "ITS architecture drawings",
        projectCode: "PRJ-001",
        revision: "R04",
        submittedAt: d("2026-03-12"),
        approver: "Consultant",
        approvalStatusCode: "overdue",
        count: 22,
        overdueDays: 21,
      },
      {
        id: "design-traffic-1",
        stageCode: "design",
        categoryCode: "traffic",
        document: "Signal layout design",
        projectCode: "PRJ-003",
        revision: "R03",
        submittedAt: d("2026-03-25"),
        approver: "Client",
        approvalStatusCode: "under-review",
        count: 26,
      },
      {
        id: "design-its-maint-1",
        stageCode: "design",
        categoryCode: "its-maint",
        document: "CCTV relocation design",
        projectCode: "PRJ-005",
        revision: "R02",
        submittedAt: d("2026-03-18"),
        approver: "Consultant",
        approvalStatusCode: "approved",
        count: 18,
      },
      {
        id: "design-traffic-maint-1",
        stageCode: "design",
        categoryCode: "traffic-maint",
        document: "Controller cabinet modification drawing",
        projectCode: "PRJ-007",
        revision: "R01",
        submittedAt: d("2026-03-29"),
        approver: "Consultant",
        approvalStatusCode: "at-risk",
        count: 14,
        overdueDays: 8,
      },
      {
        id: "proc-its-1",
        stageCode: "procurement",
        categoryCode: "its",
        document: "Camera technical submittal",
        projectCode: "PRJ-001",
        revision: "R02",
        submittedAt: d("2026-03-20"),
        approver: "Consultant",
        approvalStatusCode: "under-review",
        count: 16,
      },
      {
        id: "proc-traffic-1",
        stageCode: "procurement",
        categoryCode: "traffic",
        document: "Signal pole material approval",
        projectCode: "PRJ-004",
        revision: "R01",
        submittedAt: d("2026-03-23"),
        approver: "Client",
        approvalStatusCode: "overdue",
        count: 13,
        overdueDays: 11,
      },
      {
        id: "proc-its-maint-1",
        stageCode: "procurement",
        categoryCode: "its-maint",
        document: "Network switch compliance sheet",
        projectCode: "PRJ-005",
        revision: "R01",
        submittedAt: d("2026-03-30"),
        approver: "Consultant",
        approvalStatusCode: "approved",
        count: 19,
      },
      {
        id: "proc-traffic-maint-1",
        stageCode: "procurement",
        categoryCode: "traffic-maint",
        document: "Spare signal heads vendor approval",
        projectCode: "PRJ-008",
        revision: "R02",
        submittedAt: d("2026-04-02"),
        approver: "Internal",
        approvalStatusCode: "in-preparation",
        count: 9,
      },
      {
        id: "con-its-1",
        stageCode: "construction",
        categoryCode: "its",
        document: "Site inspection report",
        projectCode: "PRJ-002",
        revision: "R01",
        submittedAt: d("2026-03-19"),
        approver: "Consultant",
        approvalStatusCode: "overdue",
        count: 17,
        overdueDays: 15,
      },
      {
        id: "con-traffic-1",
        stageCode: "construction",
        categoryCode: "traffic",
        document: "Road marking inspection request",
        projectCode: "PRJ-003",
        revision: "R02",
        submittedAt: d("2026-03-28"),
        approver: "Consultant",
        approvalStatusCode: "at-risk",
        count: 12,
        overdueDays: 9,
      },
      {
        id: "con-its-maint-1",
        stageCode: "construction",
        categoryCode: "its-maint",
        document: "Daily maintenance report",
        projectCode: "PRJ-006",
        revision: "R01",
        submittedAt: d("2026-04-03"),
        approver: "Internal",
        approvalStatusCode: "approved",
        count: 25,
      },
      {
        id: "con-traffic-maint-1",
        stageCode: "construction",
        categoryCode: "traffic-maint",
        document: "Work permit checklist",
        projectCode: "PRJ-007",
        revision: "R01",
        submittedAt: d("2026-04-04"),
        approver: "Internal",
        approvalStatusCode: "under-review",
        count: 11,
      },
      {
        id: "tc-its-1",
        stageCode: "testing-commissioning",
        categoryCode: "its",
        document: "FAT report",
        projectCode: "PRJ-001",
        revision: "R01",
        submittedAt: d("2026-03-30"),
        approver: "Consultant",
        approvalStatusCode: "under-review",
        count: 14,
      },
      {
        id: "tc-traffic-1",
        stageCode: "testing-commissioning",
        categoryCode: "traffic",
        document: "Signal testing procedure",
        projectCode: "PRJ-004",
        revision: "R02",
        submittedAt: d("2026-03-24"),
        approver: "Consultant",
        approvalStatusCode: "overdue",
        count: 10,
        overdueDays: 10,
      },
      {
        id: "tc-its-maint-1",
        stageCode: "testing-commissioning",
        categoryCode: "its-maint",
        document: "CCTV commissioning checklist",
        projectCode: "PRJ-006",
        revision: "R01",
        submittedAt: d("2026-03-28"),
        approver: "Client",
        approvalStatusCode: "at-risk",
        count: 8,
        overdueDays: 8,
      },
      {
        id: "tc-traffic-maint-1",
        stageCode: "testing-commissioning",
        categoryCode: "traffic-maint",
        document: "Controller loop test sheet",
        projectCode: "PRJ-008",
        revision: "R02",
        submittedAt: d("2026-03-21"),
        approver: "Consultant",
        approvalStatusCode: "approved",
        count: 13,
      },
      {
        id: "close-its-1",
        stageCode: "closeout",
        categoryCode: "its",
        document: "As-built ITS drawings",
        projectCode: "PRJ-002",
        revision: "R04",
        submittedAt: d("2026-03-23"),
        approver: "Consultant",
        approvalStatusCode: "overdue",
        count: 9,
        overdueDays: 12,
      },
      {
        id: "close-traffic-1",
        stageCode: "closeout",
        categoryCode: "traffic",
        document: "Final completion certificate",
        projectCode: "PRJ-003",
        revision: "R01",
        submittedAt: d("2026-04-02"),
        approver: "Authority",
        approvalStatusCode: "under-review",
        count: 7,
      },
      {
        id: "close-its-maint-1",
        stageCode: "closeout",
        categoryCode: "its-maint",
        document: "O&M manuals",
        projectCode: "PRJ-006",
        revision: "R02",
        submittedAt: d("2026-03-27"),
        approver: "Client",
        approvalStatusCode: "at-risk",
        count: 6,
        overdueDays: 9,
      },
      {
        id: "close-traffic-maint-1",
        stageCode: "closeout",
        categoryCode: "traffic-maint",
        document: "Handover dossier",
        projectCode: "PRJ-008",
        revision: "R02",
        submittedAt: d("2026-03-19"),
        approver: "Consultant",
        approvalStatusCode: "approved",
        count: 16,
      },
    ];

    for (const record of records) {
      const project = await prisma.project.findUnique({
        where: {
          code: record.projectCode,
        },
      });

      if (!project) {
        throw new Error(
          `Cannot seed documentation record ${record.id}: project ${record.projectCode} not found`,
        );
      }

      const dueDate = getDocumentationDueDate(record);

      const existingDocument = await prisma.planningDocument.findFirst({
        where: {
          projectId: project.id,
          fileName: record.document,
          revision: record.revision,
          stageCode: record.stageCode,
        },
      });

      const data = {
        planType: record.stageCode,
        stageCode: record.stageCode,
        approvalStatusCode: record.approvalStatusCode,
        approver: record.approver,
        submittedAt: record.submittedAt,
        dueDate,
        approvedAt:
          record.approvalStatusCode === "approved"
            ? new Date(record.submittedAt.getTime() + 4 * DAY_MS)
            : null,
        count: record.count,
        status: RecordStatus.ACTIVE,
        uploadedBy: admin.name,
      };

      if (existingDocument) {
        await prisma.planningDocument.update({
          where: {
            id: existingDocument.id,
          },
          data,
        });
      } else {
        await prisma.planningDocument.create({
          data: {
            projectId: project.id,
            fileName: record.document,
            revision: record.revision,
            ...data,
          },
        });
      }
    }

    console.log("Documentation status records seeded.");
  }

  /* ---------------------------------- */
  /* PROJECTS: ITS PROJECTS */
  /* ---------------------------------- */

  await seedProject({
    code: "PRJ-001",
    name: "Al Barsha MEP Works",
    clientName: "EMAAR",
    categoryCode: "its",
    projectManagerId: pm.id,
    contractValue: 42000000,
    completionPct: 42,
    plannedProgress: 61,
    actualProgress: 42,
    healthStatus: HealthStatus.CRITICAL,
    delayedApprovals: 7,
    blockedItems: 3,
    billingReadyAmount: 1800000,
    plannedStart: d("2025-01-05"),
    plannedFinish: d("2026-10-31"),
    forecastFinish: d("2026-11-18"),
    activities: [
      {
        wbsCode: "ITS.01.02",
        activityId: "A1020",
        activityName: "Traffic signal controller installation",
        discipline: "ITS",
        durationDays: 12,
        plannedStart: d("2026-05-02"),
        plannedFinish: d("2026-05-14"),
        floatDays: 0,
        percentComplete: 42,
        owner: "ITS Engineer",
        isCritical: true,
        healthStatus: HealthStatus.CRITICAL,
      },
      {
        wbsCode: "ITS.01.03",
        activityId: "A1045",
        activityName: "Fiber backbone testing",
        discipline: "Fiber",
        durationDays: 7,
        plannedStart: d("2026-05-10"),
        plannedFinish: d("2026-05-17"),
        floatDays: 2,
        percentComplete: 30,
        owner: "Fiber Team",
        healthStatus: HealthStatus.AT_RISK,
      },
      {
        wbsCode: "ITS.03.04",
        activityId: "A1220",
        activityName: "SCADA interface configuration",
        discipline: "SCADA",
        durationDays: 9,
        plannedStart: d("2026-05-18"),
        plannedFinish: d("2026-05-27"),
        floatDays: -1,
        percentComplete: 10,
        owner: "SCADA Specialist",
        isCritical: true,
        healthStatus: HealthStatus.DELAYED,
      },
    ],
    milestones: [
      {
        milestoneCode: "MS-ITS-001",
        milestoneName: "Authority approval",
        baselineDate: d("2026-05-15"),
        forecastDate: d("2026-05-29"),
        delayDays: 14,
        linkedActivity: "A1020",
        healthStatus: HealthStatus.CRITICAL,
      },
      {
        milestoneCode: "MS-ITS-002",
        milestoneName: "SCADA integration complete",
        baselineDate: d("2026-06-10"),
        forecastDate: d("2026-06-18"),
        delayDays: 8,
        linkedActivity: "A1220",
        healthStatus: HealthStatus.DELAYED,
      },
    ],
  });

  await seedProject({
    code: "PRJ-002",
    name: "Dubai Creek ITS Upgrade",
    clientName: "Dubai Municipality",
    categoryCode: "its",
    projectManagerId: pm2.id,
    contractValue: 18000000,
    completionPct: 58,
    plannedProgress: 67,
    actualProgress: 58,
    healthStatus: HealthStatus.DELAYED,
    delayedApprovals: 3,
    blockedItems: 1,
    billingReadyAmount: 1100000,
    plannedStart: d("2025-04-01"),
    plannedFinish: d("2026-09-30"),
    forecastFinish: d("2026-10-20"),
    milestones: [
      {
        milestoneCode: "MS-ITS-003",
        milestoneName: "NOC approval",
        baselineDate: d("2026-06-01"),
        forecastDate: d("2026-06-12"),
        delayDays: 11,
        healthStatus: HealthStatus.DELAYED,
      },
    ],
  });

  /* ---------------------------------- */
  /* PROJECTS: TRAFFIC PROJECTS */
  /* ---------------------------------- */

  await seedProject({
    code: "PRJ-003",
    name: "JLT Traffic Signal Works",
    clientName: "RTA",
    categoryCode: "traffic",
    projectManagerId: pm3.id,
    contractValue: 18500000,
    completionPct: 71,
    plannedProgress: 80,
    actualProgress: 71,
    healthStatus: HealthStatus.AT_RISK,
    delayedApprovals: 2,
    blockedItems: 0,
    billingReadyAmount: 2000000,
    plannedStart: d("2025-03-01"),
    plannedFinish: d("2026-06-30"),
    forecastFinish: d("2026-07-12"),
    milestones: [
      {
        milestoneCode: "MS-TRF-001",
        milestoneName: "Signal pole material delivery",
        baselineDate: d("2026-05-20"),
        forecastDate: d("2026-05-27"),
        delayDays: 7,
        healthStatus: HealthStatus.AT_RISK,
      },
    ],
  });

  await seedProject({
    code: "PRJ-004",
    name: "DIP Road Marking Package",
    clientName: "DIP Authority",
    categoryCode: "traffic",
    projectManagerId: pm4.id,
    contractValue: 22000000,
    completionPct: 83,
    plannedProgress: 85,
    actualProgress: 83,
    healthStatus: HealthStatus.ON_TRACK,
    delayedApprovals: 1,
    blockedItems: 3,
    billingReadyAmount: 1500000,
    plannedStart: d("2025-05-01"),
    plannedFinish: d("2026-08-15"),
    forecastFinish: d("2026-08-15"),
  });

  /* ---------------------------------- */
  /* PROJECTS: ITS MAINTENANCE */
  /* ---------------------------------- */

  await seedProject({
    code: "PRJ-005",
    name: "Business Bay CCTV Maintenance",
    clientName: "Dubai Municipality",
    categoryCode: "its-maint",
    projectManagerId: pm.id,
    contractValue: 7200000,
    completionPct: 89,
    plannedProgress: 92,
    actualProgress: 89,
    healthStatus: HealthStatus.ON_TRACK,
    delayedApprovals: 0,
    blockedItems: 1,
    billingReadyAmount: 1600000,
    plannedStart: d("2025-06-01"),
    plannedFinish: d("2026-05-31"),
    forecastFinish: d("2026-05-31"),
  });

  await seedProject({
    code: "PRJ-006",
    name: "Mirdif VMS Maintenance",
    clientName: "RTA",
    categoryCode: "its-maint",
    projectManagerId: pm2.id,
    contractValue: 5400000,
    completionPct: 67,
    plannedProgress: 75,
    actualProgress: 67,
    healthStatus: HealthStatus.AT_RISK,
    delayedApprovals: 5,
    blockedItems: 2,
    billingReadyAmount: 1000000,
    plannedStart: d("2025-07-01"),
    plannedFinish: d("2026-06-30"),
    forecastFinish: d("2026-07-08"),
    milestones: [
      {
        milestoneCode: "MS-ITSM-001",
        milestoneName: "VMS repair closure",
        baselineDate: d("2026-05-10"),
        forecastDate: d("2026-05-17"),
        delayDays: 7,
        healthStatus: HealthStatus.AT_RISK,
      },
    ],
  });

  /* ---------------------------------- */
  /* PROJECTS: TRAFFIC MAINTENANCE */
  /* ---------------------------------- */

  await seedProject({
    code: "PRJ-007",
    name: "SZR Signal Maintenance",
    clientName: "RTA",
    categoryCode: "traffic-maint",
    projectManagerId: pm3.id,
    contractValue: 6500000,
    completionPct: 76,
    plannedProgress: 82,
    actualProgress: 76,
    healthStatus: HealthStatus.ON_TRACK,
    delayedApprovals: 0,
    blockedItems: 0,
    billingReadyAmount: 1100000,
    plannedStart: d("2025-02-15"),
    plannedFinish: d("2026-02-14"),
    forecastFinish: d("2026-02-20"),
  });

  await seedProject({
    code: "PRJ-008",
    name: "Bur Dubai Signal Maintenance",
    clientName: "Dubai Municipality",
    categoryCode: "traffic-maint",
    projectManagerId: pm4.id,
    contractValue: 4100000,
    completionPct: 62,
    plannedProgress: 78,
    actualProgress: 62,
    healthStatus: HealthStatus.DELAYED,
    delayedApprovals: 6,
    blockedItems: 3,
    billingReadyAmount: 1800000,
    plannedStart: d("2025-04-15"),
    plannedFinish: d("2026-04-14"),
    forecastFinish: d("2026-05-04"),
    milestones: [
      {
        milestoneCode: "MS-TRFM-001",
        milestoneName: "Night work permit",
        baselineDate: d("2026-04-20"),
        forecastDate: d("2026-05-02"),
        delayDays: 12,
        healthStatus: HealthStatus.DELAYED,
      },
    ],
  });

  await seedDocumentationStatusRecords();

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
