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
    document?: {
      fileName: string;
      revision: string;
      baselineStart?: Date;
      baselineFinish?: Date;
      forecastFinish?: Date;
      uploadedBy?: string;
    };
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

      // Existing string field used by dropdown/API filters
      portfolio: category.code,

      // New relation field
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

    let document: Awaited<
      ReturnType<typeof prisma.planningDocument.create>
    > | null = null;

    if (input.document) {
      const existingDocument = await prisma.planningDocument.findFirst({
        where: {
          projectId: project.id,
          fileName: input.document.fileName,
          revision: input.document.revision,
        },
      });

      if (existingDocument) {
        document = await prisma.planningDocument.update({
          where: { id: existingDocument.id },
          data: {
            baselineStart: input.document.baselineStart ?? null,
            baselineFinish: input.document.baselineFinish ?? null,
            forecastFinish: input.document.forecastFinish ?? null,
            uploadedBy: input.document.uploadedBy ?? admin.name,
          },
        });
      } else {
        document = await prisma.planningDocument.create({
          data: {
            projectId: project.id,
            fileName: input.document.fileName,
            revision: input.document.revision,
            baselineStart: input.document.baselineStart ?? null,
            baselineFinish: input.document.baselineFinish ?? null,
            forecastFinish: input.document.forecastFinish ?? null,
            uploadedBy: input.document.uploadedBy ?? admin.name,
          },
        });
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
    document: {
      fileName: "ITS2020-2A schedule rev 08.xlsx",
      revision: "Rev.08",
      baselineStart: d("2026-05-02"),
      baselineFinish: d("2026-07-15"),
      forecastFinish: d("2026-07-18"),
      uploadedBy: admin.name,
    },
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
