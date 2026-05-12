// prisma/seed.ts
import "dotenv/config";

import {
  PrismaClient,
  HealthStatus,
  InvoiceStatus,
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

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
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
      passwordHash,
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
      passwordHash,
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
      passwordHash,
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
      passwordHash,
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

  /* ---------------------------------- */
  /* TYPES */
  /* ---------------------------------- */

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

  type SeedActivityInput = {
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
  };

  type SeedMilestoneInput = {
    milestoneCode?: string;
    milestoneName: string;
    baselineDate?: Date;
    forecastDate?: Date;
    actualDate?: Date;
    delayDays?: number;
    linkedActivity?: string;
    healthStatus?: HealthStatus;
  };

  type SeedProjectInput = {
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
    topIssue?: string | null;
    topIssueAgeDays?: number | null;
    plannedStart?: Date;
    plannedFinish?: Date;
    forecastFinish?: Date;
    document?: SeedDocumentInput;
    documents?: SeedDocumentInput[];
    activities?: SeedActivityInput[];
    milestones?: SeedMilestoneInput[];
  };

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
  /* HELPERS */
  /* ---------------------------------- */

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

  async function seedProject(input: SeedProjectInput) {
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
      topIssue: input.topIssue ?? null,
      topIssueAgeDays: input.topIssueAgeDays ?? null,
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

    let primaryDocument: { id: string } | null = null;

    async function upsertPlanningDocument(
      projectId: string,
      doc: SeedDocumentInput,
    ) {
      const existingDocument = await prisma.planningDocument.findFirst({
        where: {
          projectId,
          fileName: doc.fileName,
          revision: doc.revision,
          stageCode: doc.stageCode ?? "pre-construction",
        },
      });

      const approvalStatusCode =
        doc.approvalStatusCode ?? "in-preparation";

      const documentData = {
        planType: doc.planType ?? "BASELINE",
        stageCode: doc.stageCode ?? "pre-construction",
        approvalStatusCode,
        approver: doc.approver ?? null,
        submittedAt: doc.submittedAt ?? null,
        dueDate: doc.dueDate ?? null,
        approvedAt:
          doc.approvedAt ??
          (approvalStatusCode === "approved" && doc.submittedAt
            ? addDays(doc.submittedAt, 4)
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

      if (!primaryDocument) {
        primaryDocument = savedDocument;
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
            documentId: primaryDocument?.id ?? null,
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
            documentId: primaryDocument?.id ?? null,
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

        const milestoneData = {
          documentId: primaryDocument?.id ?? null,
          baselineDate: milestone.baselineDate ?? null,
          forecastDate: milestone.forecastDate ?? null,
          actualDate: milestone.actualDate ?? null,
          delayDays: milestone.delayDays ?? 0,
          linkedActivity: milestone.linkedActivity ?? null,
          healthStatus: milestone.healthStatus ?? HealthStatus.ON_TRACK,
        };

        if (existingMilestone) {
          await prisma.planningMilestone.update({
            where: { id: existingMilestone.id },
            data: milestoneData,
          });
        } else {
          await prisma.planningMilestone.create({
            data: {
              projectId: project.id,
              milestoneCode: milestone.milestoneCode ?? null,
              milestoneName: milestone.milestoneName,
              ...milestoneData,
            },
          });
        }
      }
    }

    return project;
  }

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
            ? addDays(record.submittedAt, 4)
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

  async function seedRevenueBilling() {
    const billingData = [
      {
        projectCode: "PRJ-001",
        contractValue: 42000000,
        invoicedToDate: 17500000,
        billingReadyAmount: 1800000,
        overdueReceivables: 600000,
      },
      {
        projectCode: "PRJ-002",
        contractValue: 18000000,
        invoicedToDate: 9800000,
        billingReadyAmount: 1100000,
        overdueReceivables: 300000,
      },
      {
        projectCode: "PRJ-003",
        contractValue: 18500000,
        invoicedToDate: 12500000,
        billingReadyAmount: 2000000,
        overdueReceivables: 450000,
      },
      {
        projectCode: "PRJ-004",
        contractValue: 22000000,
        invoicedToDate: 14500000,
        billingReadyAmount: 1500000,
        overdueReceivables: 0,
      },
      {
        projectCode: "PRJ-005",
        contractValue: 7200000,
        invoicedToDate: 5200000,
        billingReadyAmount: 1600000,
        overdueReceivables: 0,
      },
      {
        projectCode: "PRJ-006",
        contractValue: 5400000,
        invoicedToDate: 2900000,
        billingReadyAmount: 1000000,
        overdueReceivables: 250000,
      },
      {
        projectCode: "PRJ-007",
        contractValue: 6500000,
        invoicedToDate: 4700000,
        billingReadyAmount: 1100000,
        overdueReceivables: 0,
      },
      {
        projectCode: "PRJ-008",
        contractValue: 4100000,
        invoicedToDate: 2100000,
        billingReadyAmount: 1800000,
        overdueReceivables: 500000,
      },
    ];

    for (const item of billingData) {
      const project = await prisma.project.findUnique({
        where: {
          code: item.projectCode,
        },
      });

      if (!project) {
        throw new Error(
          `Cannot seed billing: project ${item.projectCode} not found`,
        );
      }

      await prisma.projectBilling.upsert({
        where: {
          projectId: project.id,
        },
        update: {
          contractValue: item.contractValue,
          invoicedToDate: item.invoicedToDate,
          billingReadyAmount: item.billingReadyAmount,
          overdueReceivables: item.overdueReceivables,
        },
        create: {
          projectId: project.id,
          contractValue: item.contractValue,
          invoicedToDate: item.invoicedToDate,
          billingReadyAmount: item.billingReadyAmount,
          overdueReceivables: item.overdueReceivables,
        },
      });
    }

    console.log("Revenue billing seeded.");
  }

  async function seedInvoices() {
    const invoices = [
      {
        invoiceNo: "INV-PRJ001-001",
        projectCode: "PRJ-001",
        amount: 9500000,
        status: InvoiceStatus.PAID,
        issueDate: d("2026-01-15"),
        dueDate: d("2026-02-14"),
        items: [
          {
            description: "Mobilization and initial works",
            amount: 4000000,
          },
          {
            description: "ITS equipment procurement",
            amount: 5500000,
          },
        ],
      },
      {
        invoiceNo: "INV-PRJ001-002",
        projectCode: "PRJ-001",
        amount: 8000000,
        status: InvoiceStatus.OVERDUE,
        issueDate: d("2026-03-01"),
        dueDate: d("2026-03-31"),
        items: [
          {
            description: "Civil and MEP progress billing",
            amount: 8000000,
          },
        ],
      },
      {
        invoiceNo: "INV-PRJ002-001",
        projectCode: "PRJ-002",
        amount: 9800000,
        status: InvoiceStatus.APPROVED,
        issueDate: d("2026-02-20"),
        dueDate: d("2026-03-21"),
        items: [
          {
            description: "Dubai Creek ITS upgrade progress billing",
            amount: 9800000,
          },
        ],
      },
      {
        invoiceNo: "INV-PRJ003-001",
        projectCode: "PRJ-003",
        amount: 12500000,
        status: InvoiceStatus.PAID,
        issueDate: d("2026-02-05"),
        dueDate: d("2026-03-06"),
        items: [
          {
            description: "Traffic signal works progress billing",
            amount: 12500000,
          },
        ],
      },
      {
        invoiceNo: "INV-PRJ004-001",
        projectCode: "PRJ-004",
        amount: 14500000,
        status: InvoiceStatus.APPROVED,
        issueDate: d("2026-03-10"),
        dueDate: d("2026-04-09"),
        items: [
          {
            description: "Road marking package progress billing",
            amount: 14500000,
          },
        ],
      },
    ];

    for (const item of invoices) {
      const project = await prisma.project.findUnique({
        where: {
          code: item.projectCode,
        },
      });

      if (!project) {
        throw new Error(
          `Cannot seed invoice ${item.invoiceNo}: project ${item.projectCode} not found`,
        );
      }

      const invoice = await prisma.invoice.upsert({
        where: {
          invoiceNo: item.invoiceNo,
        },
        update: {
          projectId: project.id,
          amount: item.amount,
          status: item.status,
          issueDate: item.issueDate,
          dueDate: item.dueDate,
        },
        create: {
          invoiceNo: item.invoiceNo,
          projectId: project.id,
          amount: item.amount,
          status: item.status,
          issueDate: item.issueDate,
          dueDate: item.dueDate,
        },
      });

      await prisma.invoiceItem.deleteMany({
        where: {
          invoiceId: invoice.id,
        },
      });

      await prisma.invoiceItem.createMany({
        data: item.items.map((invoiceItem) => ({
          invoiceId: invoice.id,
          description: invoiceItem.description,
          amount: invoiceItem.amount,
        })),
      });
    }

    console.log("Invoices seeded.");
  }






  await prisma.systemSetting.upsert({
  where: { key: "jwt_expiry" },
  update: {},
  create: {
    key: "jwt_expiry",
    label: "JWT Expiry",
    value: "1 day",
    category: "Security",
    status: "Active",
    description: "Authentication token expiry duration",
  },
});

await prisma.systemSetting.upsert({
  where: { key: "excel_upload_max_size" },
  update: {},
  create: {
    key: "excel_upload_max_size",
    label: "Excel Upload Max Size",
    value: "25MB",
    category: "Planning",
    status: "Active",
    description: "Maximum upload size for planning Excel files",
  },
});

await prisma.systemSetting.upsert({
  where: { key: "cors_origin" },
  update: {},
  create: {
    key: "cors_origin",
    label: "CORS Origin",
    value: "http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005",
    category: "Security",
    status: "Pending",
    description: "Allowed frontend origin",
  },
});

  /* ---------------------------------- */
  /* PROJECTS */
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
    topIssue: "Authority approval delayed for IFC drawing package",
    topIssueAgeDays: 18,
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
    topIssue: "NOC approval pending",
    topIssueAgeDays: 11,
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
    topIssue: "Signal pole material delivery variance",
    topIssueAgeDays: 7,
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
    topIssue: "VMS repair closure at risk",
    topIssueAgeDays: 7,
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
    topIssue: "Night work permit delayed",
    topIssueAgeDays: 12,
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
  await seedRevenueBilling();
  await seedInvoices();

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