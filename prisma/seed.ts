import { PrismaClient, HealthStatus, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding started...');

  // CLEAN DB
  await prisma.projectHealthHistory.deleteMany();
  await prisma.planningMilestone.deleteMany();
  await prisma.materialRequest.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.ncr.deleteMany();
  await prisma.invoice.deleteMany(); // ✅ ADDED
  await prisma.project.deleteMany();

  // ============================
  // CREATE PROJECTS (FIXED)
  // ============================
  await prisma.project.createMany({
    data: [
      {
        id: 'p1',
        code: 'P001',
        name: 'Al Barsha MEP',
        clientName: 'Client A',
        portfolio: 'MEP',
        healthStatus: 'ON_TRACK',
        completionPct: 65,
        contractValue: 42000000, // ✅ FIXED
      },
      {
        id: 'p2',
        code: 'P002',
        name: 'DAFZA Ind. Ph.2',
        clientName: 'Client B',
        portfolio: 'Industrial',
        healthStatus: 'AT_RISK',
        contractValue: 31000000,
      },
      {
        id: 'p3',
        code: 'P003',
        name: 'JLT Tower',
        clientName: 'Client C',
        portfolio: 'Highrise',
        healthStatus: 'DELAYED',
        contractValue: 21000000,
      },
      {
        id: 'p4',
        code: 'P004',
        name: 'Mirdif Villa',
        clientName: 'Client D',
        portfolio: 'Residential',
        healthStatus: 'CRITICAL',
        contractValue: 26000000,
      },
      {
        id: 'p5',
        code: 'P005',
        name: 'DIP Warehouse',
        clientName: 'Client E',
        portfolio: 'Warehouse',
        healthStatus: 'ON_TRACK',
        contractValue: 38000000,
      },
    ],
  });

  // ============================
  // INVOICES (🔥 NEW - REQUIRED FOR REVENUE)
  // ============================
  await prisma.invoice.createMany({
    data: [
      {
        invoiceNo: 'INV-001',
        projectId: 'p1',
        amount: 12000000,
        paidAmount: 8000000,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 10 * 86400000),
        status: InvoiceStatus.PARTIALLY_PAID,
      },
      {
        invoiceNo: 'INV-002',
        projectId: 'p1',
        amount: 5000000,
        paidAmount: 0,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() - 5 * 86400000),
        status: InvoiceStatus.OVERDUE,
      },
      {
        invoiceNo: 'INV-003',
        projectId: 'p2',
        amount: 18000000,
        paidAmount: 15000000,
        invoiceDate: new Date(),
        dueDate: new Date(),
        status: InvoiceStatus.PARTIALLY_PAID,
      },
      {
        invoiceNo: 'INV-004',
        projectId: 'p3',
        amount: 14900000,
        paidAmount: 14900000,
        invoiceDate: new Date(),
        dueDate: new Date(),
        status: InvoiceStatus.PAID,
      },
      {
        invoiceNo: 'INV-005',
        projectId: 'p4',
        amount: 8000000,
        paidAmount: 0,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() - 15 * 86400000),
        status: InvoiceStatus.OVERDUE,
      },
    ],
  });

  // ============================
  // DELAYED MILESTONES
  // ============================
  await prisma.planningMilestone.createMany({
  data: [
    {
      projectId: 'p1',
      milestoneName: 'M1',
      delayDays: 5,
      status: 'COMPLETED',
      approvedForBilling: true,
      billableValue: 5000000,
    },
    {
      projectId: 'p2',
      milestoneName: 'M1',
      delayDays: 4,
      status: 'COMPLETED',
      approvedForBilling: true,
      billableValue: 3000000,
    },
    {
      projectId: 'p3',
      milestoneName: 'M1',
      delayDays: 6,
      status: 'COMPLETED',
      approvedForBilling: false,
      billableValue: 2000000,
    },
    {
      projectId: 'p4',
      milestoneName: 'M1',
      delayDays: 7,
      status: 'PENDING',
      approvedForBilling: false,
      billableValue: 1000000,
    },
    {
      projectId: 'p5',
      milestoneName: 'M1',
      delayDays: 1,
      status: 'COMPLETED',
      approvedForBilling: true,
      billableValue: 4000000,
    },
  ],
});

  // ============================
  // BLOCKED ITEMS
  // ============================

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
      refNo: 'MR1',
      projectId: 'p4',
      materialName: 'Cement',
      plannedQty: 10,
      availableQty: 2,
      requiredDate: new Date(),
      requestedBy: 'John',
      priority: 'HIGH',
      healthStatus: 'AT_RISK',
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      refNo: 'PO1',
      projectId: 'p3',
      vendorName: 'Vendor A',
      materialName: 'Steel',
      expectedDelivery: new Date(Date.now() - 3 * 86400000),
    },
  });

  // ============================
  // HEALTH HISTORY (TREND)
  // ============================

  const now = new Date();

  const weeksAgo = (n: number) => {
    const d = new Date();
    d.setDate(now.getDate() - n * 7);
    return d;
  };

  await prisma.projectHealthHistory.createMany({
    data: [
      { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(4) },
      { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(4) },
      { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(4) },
      { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(4) },

      { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(3) },
      { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(3) },
      { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(3) },
      { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(3) },

      { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(2) },
      { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(2) },
      { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(2) },
      { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(2) },

      { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(1) },
      { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(1) },
      { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(1) },
      { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(1) },
    ],
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });