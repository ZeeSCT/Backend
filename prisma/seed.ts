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
    update: {},
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
    update: {},
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
    update: {},
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
    update: {},
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
  /* HELPER */
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
    topIssue?: string | null;
    topIssueAgeDays?: number | null;
    plannedStart?: Date;
    plannedFinish?: Date;
    forecastFinish?: Date;

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

    const project = await prisma.project.upsert({
      where: { code: input.code },
      update: {
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
      },
      create: {
        code: input.code,
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
      },
    });

    if (input.milestones?.length) {
      for (const milestone of input.milestones) {
        const existing = await prisma.planningMilestone.findFirst({
          where: {
            projectId: project.id,
            milestoneName: milestone.milestoneName,
          },
        });

        if (existing) {
          await prisma.planningMilestone.update({
            where: { id: existing.id },
            data: {
              milestoneCode: milestone.milestoneCode,
              baselineDate: milestone.baselineDate,
              forecastDate: milestone.forecastDate,
              actualDate: milestone.actualDate,
              delayDays: milestone.delayDays ?? 0,
              linkedActivity: milestone.linkedActivity,
              healthStatus:
                milestone.healthStatus ?? HealthStatus.ON_TRACK,
            },
          });
        } else {
          await prisma.planningMilestone.create({
            data: {
              projectId: project.id,
              milestoneCode: milestone.milestoneCode,
              milestoneName: milestone.milestoneName,
              baselineDate: milestone.baselineDate,
              forecastDate: milestone.forecastDate,
              actualDate: milestone.actualDate,
              delayDays: milestone.delayDays ?? 0,
              linkedActivity: milestone.linkedActivity,
              healthStatus:
                milestone.healthStatus ?? HealthStatus.ON_TRACK,
            },
          });
        }
      }
    }

    return project;
  }

  /* ---------------------------------- */
  /* CRITICAL PROJECTS */
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
    blockedItems: 4,
    billingReadyAmount: 1800000,
    topIssue: "Authority approvals pending",
    topIssueAgeDays: 22,

    plannedStart: d("2025-01-05"),
    plannedFinish: d("2026-10-31"),
    forecastFinish: d("2026-11-18"),

    milestones: [
      {
        milestoneCode: "MS-001",
        milestoneName: "Authority approval",
        baselineDate: d("2026-05-15"),
        forecastDate: d("2026-05-29"),
        delayDays: 14,
        healthStatus: HealthStatus.CRITICAL,
      },
      {
        milestoneCode: "MS-002",
        milestoneName: "SCADA integration",
        baselineDate: d("2026-06-10"),
        forecastDate: d("2026-06-18"),
        delayDays: 8,
        healthStatus: HealthStatus.DELAYED,
      },
      {
        milestoneCode: "MS-003",
        milestoneName: "Fiber testing",
        baselineDate: d("2026-06-20"),
        forecastDate: d("2026-06-30"),
        delayDays: 10,
        healthStatus: HealthStatus.DELAYED,
      },
      {
        milestoneCode: "MS-004",
        milestoneName: "Final inspection",
        baselineDate: d("2026-07-05"),
        forecastDate: d("2026-07-18"),
        delayDays: 13,
        healthStatus: HealthStatus.CRITICAL,
      },
    ],
  });

  /* ---------------------------------- */
  /* DELAYED PROJECTS */
  /* ---------------------------------- */

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
    blockedItems: 2,
    billingReadyAmount: 1100000,
    topIssue: "NOC approval delay",
    topIssueAgeDays: 12,

    milestones: [
      {
        milestoneCode: "MS-005",
        milestoneName: "NOC approval",
        baselineDate: d("2026-06-01"),
        forecastDate: d("2026-06-12"),
        delayDays: 11,
        healthStatus: HealthStatus.DELAYED,
      },
      {
        milestoneCode: "MS-006",
        milestoneName: "Cable rerouting",
        baselineDate: d("2026-06-15"),
        forecastDate: d("2026-06-21"),
        delayDays: 6,
        healthStatus: HealthStatus.AT_RISK,
      },
    ],
  });

  await seedProject({
    code: "PRJ-003",
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
    blockedItems: 1,
    billingReadyAmount: 1800000,
    topIssue: "Night permit approval pending",
    topIssueAgeDays: 9,

    milestones: [
      {
        milestoneCode: "MS-007",
        milestoneName: "Night work permit",
        baselineDate: d("2026-04-20"),
        forecastDate: d("2026-05-02"),
        delayDays: 12,
        healthStatus: HealthStatus.DELAYED,
      },
    ],
  });

  /* ---------------------------------- */
  /* AT RISK PROJECTS */
  /* ---------------------------------- */

  await seedProject({
    code: "PRJ-004",
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
    blockedItems: 1,
    billingReadyAmount: 2000000,
    topIssue: "Material delivery risk",
    topIssueAgeDays: 5,

    milestones: [
      {
        milestoneCode: "MS-008",
        milestoneName: "Signal pole delivery",
        baselineDate: d("2026-05-20"),
        forecastDate: d("2026-05-27"),
        delayDays: 7,
        healthStatus: HealthStatus.AT_RISK,
      },
    ],
  });

  await seedProject({
    code: "PRJ-005",
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
    topIssue: "Vendor coordination pending",
    topIssueAgeDays: 6,

    milestones: [
      {
        milestoneCode: "MS-009",
        milestoneName: "VMS repair closure",
        baselineDate: d("2026-05-10"),
        forecastDate: d("2026-05-17"),
        delayDays: 7,
        healthStatus: HealthStatus.AT_RISK,
      },
    ],
  });

  /* ---------------------------------- */
  /* ON TRACK PROJECTS */
  /* ---------------------------------- */

  await seedProject({
    code: "PRJ-006",
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
    blockedItems: 0,
    billingReadyAmount: 1600000,
    topIssue: null,
    topIssueAgeDays: null,
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
    topIssue: null,
    topIssueAgeDays: null,
  });

  await seedProject({
    code: "PRJ-008",
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
    blockedItems: 0,
    billingReadyAmount: 1500000,
    topIssue: null,
    topIssueAgeDays: null,
  });

  await seedProject({
    code: "PRJ-009",
    name: "Expo ITS Fiber Upgrade",
    clientName: "EXPO City",
    categoryCode: "its",
    projectManagerId: pm.id,
    contractValue: 12000000,
    completionPct: 91,
    plannedProgress: 91,
    actualProgress: 91,
    healthStatus: HealthStatus.ON_TRACK,
    delayedApprovals: 0,
    blockedItems: 0,
    billingReadyAmount: 900000,
    topIssue: null,
    topIssueAgeDays: null,
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