import { PrismaClient, HealthStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding started...');

  // CLEAN DB (important for repeatable demo)
  await prisma.projectHealthHistory.deleteMany();
  await prisma.planningMilestone.deleteMany();
  await prisma.materialRequest.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.ncr.deleteMany();
  await prisma.project.deleteMany();

  // ============================
  // CREATE PROJECTS
  // ============================
  const projects = await prisma.project.createMany({
    data: [
      {
        id: 'p1',
        code: 'P001',
        name: 'Al Barsha MEP',
        clientName: 'Client A',
        portfolio: 'MEP',
        healthStatus: 'ON_TRACK',
      },
      {
        id: 'p2',
        code: 'P002',
        name: 'DAFZA Ind. Ph.2',
        clientName: 'Client B',
        portfolio: 'Industrial',
        healthStatus: 'AT_RISK',
      },
      {
        id: 'p3',
        code: 'P003',
        name: 'JLT Tower',
        clientName: 'Client C',
        portfolio: 'Highrise',
        healthStatus: 'DELAYED',
      },
      {
        id: 'p4',
        code: 'P004',
        name: 'Mirdif Villa',
        clientName: 'Client D',
        portfolio: 'Residential',
        healthStatus: 'CRITICAL',
      },
      {
        id: 'p5',
        code: 'P005',
        name: 'DIP Warehouse',
        clientName: 'Client E',
        portfolio: 'Warehouse',
        healthStatus: 'ON_TRACK',
      },
    ],
  });

  // ============================
  // DELAYED MILESTONES
  // ============================
  await prisma.planningMilestone.createMany({
    data: [
      { projectId: 'p1', milestoneName: 'M1', delayDays: 5 },
      { projectId: 'p1', milestoneName: 'M2', delayDays: 3 },
      { projectId: 'p1', milestoneName: 'M3', delayDays: 2 },

      { projectId: 'p2', milestoneName: 'M1', delayDays: 4 },
      { projectId: 'p2', milestoneName: 'M2', delayDays: 2 },

      { projectId: 'p3', milestoneName: 'M1', delayDays: 6 },

      { projectId: 'p4', milestoneName: 'M1', delayDays: 7 },

      { projectId: 'p5', milestoneName: 'M1', delayDays: 1 },
    ],
  });

  // ============================
  // BLOCKED ITEMS
  // ============================

  // NCR (critical)
  await prisma.ncr.create({
    data: {
      refNo: 'NCR1',
      projectId: 'p1',
      description: 'Authority issue',
      healthStatus: 'CRITICAL',
    },
  });

  await prisma.materialRequest.create({
  data: {
    refNo: "MR1",
    projectId: "p4",
    materialName: "Cement",

    plannedQty: 10,              // ✅ correct field
    availableQty: 2,             // optional but good for demo

    requiredDate: new Date(),    // ✅ correct field

    requestedBy: "John",
    priority: "HIGH",

    healthStatus: "AT_RISK"
  }
});

  // Purchase order delay
  await prisma.purchaseOrder.create({
    data: {
      refNo: 'PO1',
      projectId: 'p3',
      vendorName: 'Vendor A',
      materialName: 'Steel',
      expectedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // ============================
  // EVENT HISTORY (TREND)
  // ============================

  const now = new Date();

  const weeksAgo = (n: number) => {
    const d = new Date();
    d.setDate(now.getDate() - n * 7);
    return d;
  };

  await prisma.projectHealthHistory.createMany({
    data: [
      // Week 4
      { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(4) },
      { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(4) },
      { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(4) },
      { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(4) },

      // Week 3
      { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(3) },
      { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(3) },
      { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(3) },
      { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(3) },

      // Week 2
      { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(2) },
      { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(2) },
      { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(2) },
      { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(2) },

      // Week 1
      { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(1) },
      { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(1) },
      { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(1) },
      { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(1) },
    ],
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });