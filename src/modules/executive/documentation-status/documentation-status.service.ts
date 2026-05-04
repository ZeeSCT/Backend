import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, RecordStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";

export type PortfolioCategoryCode = string;
export type DocumentationStage = string;
export type DocumentationStatusLabel = string;

const documentInclude = {
  project: {
    select: {
      id: true,
      code: true,
      name: true,
      clientName: true,
      portfolio: true,
      portfolioCategory: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      projectManager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  stage: {
    select: {
      code: true,
      label: true,
      displayOrder: true,
    },
  },
  approvalStatus: {
    select: {
      code: true,
      label: true,
      severity: true,
      displayOrder: true,
    },
  },
} satisfies Prisma.PlanningDocumentInclude;

type PlanningDocumentRecord = Prisma.PlanningDocumentGetPayload<{
  include: typeof documentInclude;
}>;

@Injectable()
export class DocumentStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getDocumentStatus(
    category: PortfolioCategoryCode = "all",
    stage: DocumentationStage = "pre-construction",
  ) {
    const categoryLabel = await this.getCategoryLabel(category);
    const selectedStage = await this.getStage(stage);

    const where = this.buildDocumentWhere(category, stage);

    const documents = await this.prisma.planningDocument.findMany({
      where,
      include: documentInclude,
      orderBy: [
        {
          dueDate: "asc",
        },
        {
          uploadedAt: "desc",
        },
      ],
    });

    const statuses = await this.prisma.documentApprovalStatusLookup.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    const enrichedDocuments = documents.map((document) => {
      const effectiveStatus = this.getEffectiveStatus(document);
      const overdueDays = this.getOverdueDays(document, effectiveStatus.code);

      return {
        document,
        effectiveStatus,
        statusLabel: effectiveStatus.label,
        count: document.count ?? 1,
        overdueDays,
      };
    });

    const totalDocuments = enrichedDocuments.reduce(
      (total, item) => total + item.count,
      0,
    );

    const approved = this.sumStatusCounts(enrichedDocuments, ["approved"]);

    const underReview = this.sumStatusCounts(enrichedDocuments, [
      "under-review",
      "at-risk",
    ]);

    const overdue = this.sumStatusCounts(enrichedDocuments, ["overdue"]);

    const inPreparation = this.sumStatusCounts(enrichedDocuments, [
      "in-preparation",
    ]);

    const rejected = this.sumStatusCounts(enrichedDocuments, ["rejected"]);

    const atRisk = this.sumStatusCounts(enrichedDocuments, ["at-risk"]);

    const statusSummary = statuses
      .map((status) => {
        const value = this.sumStatusCounts(enrichedDocuments, [status.code]);

        return {
          label: status.label,
          value,
          percent: this.getPercent(value, totalDocuments),
        };
      })
      .filter((item) => item.value > 0);

    const overdueApprovals = enrichedDocuments
      .filter(
        (item) =>
          item.effectiveStatus.code === "overdue" ||
          item.effectiveStatus.code === "at-risk",
      )
      .sort((a, b) => (b.overdueDays ?? 0) - (a.overdueDays ?? 0))
      .slice(0, 4)
      .map((item) => {
        const document = item.document;

        return {
          id: document.id,
          project: document.project.name,
          document: document.fileName,
          title: `${document.project.name} — ${document.fileName}`,
          approver: document.approver ?? "Unassigned",
          status: item.effectiveStatus.label,
          days: item.overdueDays ?? 0,
          severity:
            item.effectiveStatus.code === "overdue" ? "danger" : "warning",
        };
      });

    const register = enrichedDocuments.map((item) => {
      const document = item.document;

      const categoryCode =
        document.project.portfolioCategory?.code ?? document.project.portfolio;

      const categoryName =
        document.project.portfolioCategory?.name ?? document.project.portfolio;

      return {
        id: document.id,
        categoryCode,
        categoryName,
        document: document.fileName,
        project: document.project.name,
        revision: document.revision,
        submitted: this.formatShortDate(
          document.submittedAt ?? document.uploadedAt,
        ),
        approver: document.approver ?? "Unassigned",
        status: item.effectiveStatus.label,
        count: item.count,
        overdueDays: item.overdueDays,
      };
    });

    return {
      selectedCategory: category,
      selectedCategoryLabel: categoryLabel,
      selectedStage: stage,
      selectedStageLabel: selectedStage.label,
      kpis: {
        totalDocuments,
        approved,
        underReview,
        overdue,
        inPreparation,
        rejected,
        atRisk,
      },
      statusSummary,
      overdueApprovals,
      register,
    };
  }

  private async getCategoryLabel(category: string) {
    if (category === "all") return "All portfolios";

    const found = await this.prisma.portfolioCategory.findFirst({
      where: {
        code: category,
        isActive: true,
      },
      select: {
        name: true,
      },
    });

    if (!found) {
      throw new BadRequestException("Invalid portfolio category");
    }

    return found.name;
  }

  private async getStage(stage: string) {
    const found = await this.prisma.documentationStageLookup.findFirst({
      where: {
        code: stage,
        isActive: true,
      },
      select: {
        code: true,
        label: true,
      },
    });

    if (!found) {
      throw new BadRequestException("Invalid documentation stage");
    }

    return found;
  }

  private buildDocumentWhere(
    category: string,
    stage: string,
  ): Prisma.PlanningDocumentWhereInput {
    return {
      status: RecordStatus.ACTIVE,
      stageCode: stage,
      project: {
        status: RecordStatus.ACTIVE,

        ...(category !== "all"
          ? {
              OR: [
                {
                  portfolio: category,
                },
                {
                  portfolioCategory: {
                    code: category,
                  },
                },
              ],
            }
          : {}),
      },
    };
  }

  private getEffectiveStatus(document: PlanningDocumentRecord) {
    if (
      document.approvalStatus.code === "approved" ||
      document.approvalStatus.code === "rejected" ||
      document.approvalStatus.code === "at-risk"
    ) {
      return document.approvalStatus;
    }

    if (document.approvalStatus.code === "overdue") {
      return document.approvalStatus;
    }

    if (document.dueDate && document.dueDate.getTime() < Date.now()) {
      return {
        code: "overdue",
        label: "Overdue",
        severity: "danger",
        displayOrder: 4,
      };
    }

    return document.approvalStatus;
  }

  private getOverdueDays(
    document: PlanningDocumentRecord,
    statusCode: string,
  ): number | null {
    if (statusCode !== "overdue" && statusCode !== "at-risk") {
      return null;
    }

    if (!document.dueDate) return 0;

    const diffMs = Date.now() - document.dueDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  private sumStatusCounts(
    items: {
      effectiveStatus: {
        code: string;
      };
      count: number;
    }[],
    statusCodes: string[],
  ) {
    return items.reduce((total, item) => {
      return statusCodes.includes(item.effectiveStatus.code)
        ? total + item.count
        : total;
    }, 0);
  }

  private getPercent(value: number, total: number) {
    if (total === 0) return 0;

    return Math.round((value / total) * 100);
  }

  private formatShortDate(value?: Date | null) {
    if (!value) return "—";

    return value.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  }
}