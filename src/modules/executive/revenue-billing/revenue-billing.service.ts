import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RecordStatus } from '@prisma/client';
import { Money } from '../../../common/utils/money.util';

@Injectable()
export class RevenueBillingService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------
  // DASHBOARD SUMMARY
  // ----------------------------------
  async getSummary() {
    const projects = await this.prisma.project.findMany({
      where: { status: RecordStatus.ACTIVE },
      include: { billing: true },
    });

    const summary = {
      contractValue: 0,
      invoicedToDate: 0,
      billingReadyNow: 0,
      pendingUnlock: 0,
      overdueReceivables: 0,
    };

    for (const p of projects) {
      const billing = p.billing;

      const contract = Money.toNumber(billing?.contractValue);
      const invoiced = Money.toNumber(billing?.invoicedToDate);
      const billingReady = Money.toNumber(billing?.billingReadyAmount);
      const overdue = Money.toNumber(billing?.overdueReceivables);

      summary.contractValue += contract;
      summary.invoicedToDate += invoiced;
      summary.billingReadyNow += billingReady;
      summary.overdueReceivables += overdue;

      const pending = contract - invoiced - billingReady;
      summary.pendingUnlock += pending > 0 ? pending : 0;
    }

    const invoicedPercentage =
      summary.contractValue > 0
        ? Math.round((summary.invoicedToDate / summary.contractValue) * 100)
        : 0;

    return {
      ...summary,
      invoicedPercentage,
    };
  }

  // ----------------------------------
  // BILLING BY PROJECT
  // ----------------------------------
  async getBillingByProject() {
    const projects = await this.prisma.project.findMany({
      where: { status: RecordStatus.ACTIVE },
      include: { billing: true },
      orderBy: { name: 'asc' },
    });

    const readyValues = projects.map((p) =>
      Money.toNumber(p.billing?.billingReadyAmount),
    );

    const maxReady = readyValues.length
      ? Math.max(...readyValues)
      : 0;

    return projects.map((p) => {
      const billing = p.billing;

      const contract = Money.toNumber(billing?.contractValue);
      const invoiced = Money.toNumber(billing?.invoicedToDate);
      const ready = Money.toNumber(billing?.billingReadyAmount);

      const progress =
        contract > 0 ? Math.round((invoiced / contract) * 100) : 0;

      let status: 'Ready' | 'Partial' | 'Not ready' = 'Not ready';

      if (progress >= 80) status = 'Ready';
      else if (progress >= 50) status = 'Partial';

      return {
        projectId: p.id,
        projectCode: p.code,
        projectName: p.name,
        clientName: p.clientName,

        contractValue: contract,
        invoicedToDate: invoiced,
        billingReadyAmount: ready,

        progressPct: progress,
        status,

        widthPct:
          maxReady > 0
            ? Math.max(Math.round((ready / maxReady) * 100), 10)
            : 0,
      };
    });
  }
}