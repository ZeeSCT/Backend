import { Injectable } from '@nestjs/common';
import { MilestoneStatus } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class RevenueBillingService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [
      projects,
      invoices,
      overdueInvoices,
      billingReadyMilestones,
      pendingMilestones,
    ] = await Promise.all([
      this.prisma.project.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          contractValue: true,
        },
      }),

      // ✅ ALL invoices contribute to invoiced amount
      this.prisma.invoice.findMany({
        select: {
          amount: true,
          paidAmount: true,
        },
      }),

      // ❗ overdue receivables only
      this.prisma.invoice.findMany({
        where: {
          dueDate: { lt: new Date() },
        },
        select: {
          amount: true,
          paidAmount: true,
        },
      }),

      // ✅ billing ready milestones (safe logic)
      this.prisma.planningMilestone.findMany({
        where: {
          approvedForBilling: true,
        },
        select: {
          billableValue: true,
        },
      }),

      this.prisma.planningMilestone.findMany({
        where: {
          approvedForBilling: false,
        },
        select: {
          billableValue: true,
        },
      }),
    ]);

    // ============================
    // CALCULATIONS
    // ============================

    const contractValue = projects.reduce(
      (sum, p) => sum + Number(p.contractValue || 0),
      0,
    );

    const invoicedToDate = invoices.reduce(
      (sum, i) => sum + Number(i.amount || 0),
      0,
    );

    const billingReadyNow = billingReadyMilestones.reduce(
      (sum, m) => sum + Number(m.billableValue || 0),
      0,
    );

    const pendingMilestoneUnlock = pendingMilestones.reduce(
      (sum, m) => sum + Number(m.billableValue || 0),
      0,
    );

    const overdueReceivables = overdueInvoices.reduce(
      (sum, i) =>
        sum + (Number(i.amount || 0) - Number(i.paidAmount || 0)),
      0,
    );

    return {
      contractValue,
      invoicedToDate,
      billingReadyNow,
      pendingMilestoneUnlock,
      overdueReceivables,
      totalProjects: projects.length,
      invoicedPercentage:
        contractValue > 0
          ? Number(((invoicedToDate / contractValue) * 100).toFixed(1))
          : 0,
      billingReadyProjects: billingReadyMilestones.length,
    };
  }

  async getProjects() {
    const projects = await this.prisma.project.findMany({
      where: { status: 'ACTIVE' },
      include: {
        invoices: true,
        milestones: true,
      },
      orderBy: {
        contractValue: 'desc',
      },
    });

    return projects.map((project) => {
      const contractValue = Number(project.contractValue || 0);

      const invoiced = project.invoices.reduce(
        (sum, inv) => sum + Number(inv.amount || 0),
        0,
      );

      const billingReady = project.milestones
        .filter((m) => m.approvedForBilling)
        .reduce(
          (sum, m) => sum + Number(m.billableValue || 0),
          0,
        );

      let status = 'NOT_READY';

      if (billingReady >= contractValue * 0.1) {
        status = 'READY';
      } else if (billingReady > 0) {
        status = 'PARTIAL';
      }

      return {
        projectId: project.id,
        projectName: project.name,
        contractValue,
        invoiced,
        progress: project.completionPct,
        billingReady,
        status,
      };
    });
  }
}