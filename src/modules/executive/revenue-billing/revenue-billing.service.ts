import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, RecordStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";

type BillingStatus = "READY" | "PARTIAL" | "NOT_READY";
type BillingTone = "g" | "w" | "d";

@Injectable()
export class RevenueBillingService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(category = "all") {
    const projectWhere = await this.buildProjectWhere(category);

    const projects = await this.prisma.project.findMany({
      where: projectWhere,
      include: {
        billing: true,
      },
    });

    const contractValue = projects.reduce(
      (sum, project) =>
        sum + Number(project.billing?.contractValue ?? project.contractValue ?? 0),
      0,
    );

    const invoicedToDate = projects.reduce(
      (sum, project) => sum + Number(project.billing?.invoicedToDate ?? 0),
      0,
    );

    const billingReadyNow = projects.reduce(
      (sum, project) =>
        sum +
        Number(
          project.billing?.billingReadyAmount ??
            project.billingReadyAmount ??
            0,
        ),
      0,
    );

    const overdueReceivables = projects.reduce(
      (sum, project) => sum + Number(project.billing?.overdueReceivables ?? 0),
      0,
    );

    const billingReadyProjects = projects.filter((project) => {
      const amount = Number(
        project.billing?.billingReadyAmount ?? project.billingReadyAmount ?? 0,
      );

      return amount > 0;
    }).length;

    const invoicedPct =
      contractValue > 0
        ? Math.round((invoicedToDate / contractValue) * 100)
        : 0;

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

  async getBillingByProject(category = "all") {
    const projectWhere = await this.buildProjectWhere(category);

    const projects = await this.prisma.project.findMany({
      where: projectWhere,
      include: {
        billing: true,
      },
      orderBy: {
        contractValue: "desc",
      },
    });

    return projects.map((project) => {
      const contractValue = Number(
        project.billing?.contractValue ?? project.contractValue ?? 0,
      );

      const invoicedToDate = Number(project.billing?.invoicedToDate ?? 0);

      const billingReadyAmount = Number(
        project.billing?.billingReadyAmount ??
          project.billingReadyAmount ??
          0,
      );

      const progressPct = project.completionPct ?? 0;

      const { status, tone } = this.getBillingStatusAndTone(
        billingReadyAmount,
        progressPct,
      );

      return {
        projectId: project.id,
        projectCode: project.code,
        projectName: project.name,
        clientName: project.clientName,
        contractValue,
        invoicedToDate,
        progressPct,
        billingReadyAmount,
        status,
        tone,
      };
    });
  }

  private async buildProjectWhere(
    category = "all",
  ): Promise<Prisma.ProjectWhereInput> {
    const selectedCategory = await this.normalizeCategory(category);

    return {
      status: RecordStatus.ACTIVE,

      ...(selectedCategory !== "all"
        ? {
            OR: [
              {
                portfolio: selectedCategory,
              },
              {
                portfolioCategory: {
                  code: selectedCategory,
                },
              },
            ],
          }
        : {}),
    };
  }

  private async normalizeCategory(category?: string) {
    const normalized = (category || "all").toLowerCase();

    if (normalized === "all") {
      return "all";
    }

    const exists = await this.prisma.portfolioCategory.findFirst({
      where: {
        code: normalized,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!exists) {
      throw new BadRequestException("Invalid portfolio category");
    }

    return normalized;
  }

  private getBillingStatusAndTone(
    billingReadyAmount: number,
    progressPct: number,
  ): {
    status: BillingStatus;
    tone: BillingTone;
  } {
    if (billingReadyAmount > 0 && progressPct >= 60) {
      return {
        status: "READY",
        tone: "g",
      };
    }

    if (billingReadyAmount > 0) {
      return {
        status: "PARTIAL",
        tone: "w",
      };
    }

    return {
      status: "NOT_READY",
      tone: "d",
    };
  }
}