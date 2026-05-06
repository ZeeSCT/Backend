import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RecordStatus, InvoiceStatus } from '@prisma/client';
import { Money } from '../../../common/utils/money.util';

@Injectable()
export class RevenueBillingService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------
  // DASHBOARD SUMMARY
  // ----------------------------------
  async getSummary() {
    const today = new Date();

    const projects = await this.prisma.project.findMany({
      where: { status: RecordStatus.ACTIVE },
      include: {
        billing: true,
        invoices: true, // IMPORTANT: assume relation exists
      },
    });

    let contractValue = 0;
    let invoicedToDate = 0;
    let billingReadyNow = 0;
    let overdueReceivables = 0;

    for (const p of projects) {
      const billing = p.billing;

      const contract = Money.toNumber(billing?.contractValue);
      const invoiced = Money.toNumber(billing?.invoicedToDate);
      const billingReady = Money.toNumber(billing?.billingReadyAmount);

      contractValue += contract;
      invoicedToDate += invoiced;
      billingReadyNow += billingReady;

      // ----------------------------------
      // OVERDUE RECEIVABLES LOGIC
      // ----------------------------------
      const overdue = (p.invoices ?? []).filter(
        (inv) =>
          inv.status === InvoiceStatus.OVERDUE &&
          new Date(inv.dueDate) < today
      );

      overdueReceivables += overdue.reduce(
        (sum, inv) => sum + Money.toNumber(inv.amount),
        0
      );
    }

    // ----------------------------------
    // SAFE PERCENTAGE CALCULATION
    // ----------------------------------
    const invoicedPct =
      contractValue > 0
        ? Math.round((invoicedToDate / contractValue) * 100)
        : 0;

    const billingReadyProjects = projects.filter((p) =>
      Money.toNumber(p.billing?.billingReadyAmount) > 0
    ).length;

    return {
      contractValue,
      invoicedToDate,
      billingReadyNow,
      overdueReceivables,

      totalProjects: projects.length,
      billingReadyProjects,

      invoicedPct,
    };
  }

  // ----------------------------------
  // BILLING BY PROJECT
  // ----------------------------------
  async getBillingByProject() {
  const projects = await this.prisma.project.findMany({
    where: {
      status: RecordStatus.ACTIVE,
    },

    include: {
      billing: true,
    },

    orderBy: {
      name: 'asc',
    },
  });

  return projects
    .map((p) => {
      const billing = p.billing;

      const contractValue = Money.toNumber(
        billing?.contractValue,
      );

      const invoicedToDate = Money.toNumber(
        billing?.invoicedToDate,
      );

      const billingReadyAmount = Money.toNumber(
        billing?.billingReadyAmount,
      );

      // Remaining amount to invoice
      const remainingAmount =
        contractValue - invoicedToDate;

      /// Remaining % to invoice
const progressPct =
  contractValue > 0
    ? Math.round(
        ((contractValue - invoicedToDate) /
          contractValue) *
          100,
      )
    : 0;

      // ----------------------------------
      // STATUS USING SWITCH
      // ----------------------------------

      let status: 'READY' | 'PARTIAL' | 'NOT_READY';

      switch (true) {
        case billingReadyAmount === remainingAmount &&
          billingReadyAmount > 0:
          status = 'READY';
          break;

        case billingReadyAmount > 0 &&
          billingReadyAmount < remainingAmount:
          status = 'PARTIAL';
          break;

        default:
          status = 'NOT_READY';
      }

      // ----------------------------------
      // PROGRESS BAR COLOR
      // ----------------------------------

      let tone: 'g' | 'w' | 'd';

      switch (status) {
        case 'READY':
          tone = 'g';
          break;

        case 'PARTIAL':
          tone = 'w';
          break;

        default:
          tone = 'd';
      }

      return {
        projectId: p.id,
        projectCode: p.code,

        projectName: p.name,
        clientName: p.clientName,

        contractValue,
        invoicedToDate,

        progressPct,

        billingReadyAmount,

        status,
        tone,
      };
    })

    // Remove empty projects
    .filter(
      (p) =>
        p.contractValue > 0 ||
        p.invoicedToDate > 0,
    );

  } 
} 