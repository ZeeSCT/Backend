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

const prisma = new PrismaClient({ adapter });

function d(value: string) {
  return new Date(value);
}

const toNumber = (v: any) => Number(v ?? 0);

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
    update: { name: "A. Karim" },
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
    update: { name: "N. Rashid" },
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
    update: { name: "S. Mehta" },
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
    update: { name: "F. Al Hamad" },
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
  /* PROJECT + BILLING SEED HELPER */
  /* ---------------------------------- */

  async function seedProject(input: any) {
    const category = categoryMap[input.categoryCode as CategoryCode];

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
        plannedStart: input.plannedStart ?? null,
        plannedFinish: input.plannedFinish ?? null,
        forecastFinish: input.forecastFinish ?? null,
        status: RecordStatus.ACTIVE,
      },
    });

    return project;
  }

  /* ---------------------------------- */
  /* REVENUE BILLING SEED */
  /* ---------------------------------- */

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
    ];

    for (const item of billingData) {
      const project = await prisma.project.findUnique({
        where: { code: item.projectCode },
      });

      if (!project) continue;

      // ✅ FIXED: correct unique key is projectId
      await prisma.projectBilling.upsert({
        where: { projectId: project.id },
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

    console.log("Revenue & Billing seeded.");
  }

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
  });

  /* RUN BILLING */
  await seedRevenueBilling();

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });