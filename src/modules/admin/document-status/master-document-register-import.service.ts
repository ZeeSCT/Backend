import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import {
  DocumentImportSource,
  Prisma,
  RecordStatus,
} from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { ImportMasterDocumentRegisterDto } from "./dto/import-master-document-register.dto";
import {
  MasterDocumentRegisterExcelParserService,
  ParsedMasterDocumentRegisterRow,
} from "./master-document-register-excel-parser.service";

@Injectable()
export class MasterDocumentRegisterImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: MasterDocumentRegisterExcelParserService,
  ) {}

  async importExcel(
    file: Express.Multer.File,
    dto: ImportMasterDocumentRegisterDto,
  ) {
    if (!file) {
      throw new BadRequestException("Excel file is required.");
    }

    if (!dto.projectId && !dto.projectCode) {
      throw new BadRequestException("projectId or projectCode is required.");
    }

    const project = await this.findProjectOrThrow(dto);
    const stageCode = dto.stageCode || "pre-construction";
    const uploadedBy = dto.uploadedBy || "Document Controller";

    const parsed = await this.parser.parse(file.buffer);

    await this.ensureStageExists(stageCode);
    await this.ensureDefaultOwnerExists();

    const importedRows = [];
    const failedRows: {
      rowNumber: number;
      documentTitle: string | null;
      message: string;
    }[] = [];

    for (const row of parsed.validRows) {
      try {
        if (!row.documentTitle && !row.documentNo) {
          continue;
        }

        const disciplineCode = row.discipline
          ? await this.ensureDisciplineExists(row.discipline)
          : null;

        const workflowStatusCode = await this.resolveWorkflowStatusCode(
          row.status,
        );

        const approvalStatusCode = await this.resolveApprovalStatusCode(
          row.status,
        );

        const savedDocument = await this.upsertImportedDocument({
          projectId: project.id,
          stageCode,
          uploadedBy,
          row,
          disciplineCode,
          workflowStatusCode,
          approvalStatusCode,
        });

        importedRows.push({
          rowNumber: row.rowNumber,
          id: savedDocument.id,
          documentNo: savedDocument.documentNo,
          title: savedDocument.title,
        });
      } catch (error) {
        failedRows.push({
          rowNumber: row.rowNumber,
          documentTitle: row.documentTitle,
          message:
            error instanceof Error
              ? error.message
              : "Failed to import row.",
        });
      }
    }

    return {
      sheetName: parsed.sheetName,
      headerRowNumber: parsed.headerRowNumber,
      totalRows: parsed.totalRows,
      parsedRows: parsed.validRows.length,
      skippedRows: parsed.skippedRows,
      importedRows: importedRows.length,
      failedRows: failedRows.length,
      parserErrors: parsed.errors,
      failures: failedRows,
      rows: importedRows,
    };
  }

  private async upsertImportedDocument(input: {
    projectId: string;
    stageCode: string;
    uploadedBy: string;
    row: ParsedMasterDocumentRegisterRow;
    disciplineCode: string | null;
    workflowStatusCode: string;
    approvalStatusCode: string;
  }) {
    const {
      projectId,
      stageCode,
      uploadedBy,
      row,
      disciplineCode,
      workflowStatusCode,
      approvalStatusCode,
    } = input;

    const documentNo = row.documentNo?.trim() || null;
    const title = row.documentTitle?.trim() || documentNo || "Untitled Document";
    const revision = row.revision?.trim() || "";

    const existingDocument = await this.findExistingDocument({
      projectId,
      documentNo,
      title,
      revision,
    });

    const documentData: Prisma.PlanningDocumentUpdateInput = {
      title,
      fileName: title,
      revision,

      planType: "DOCUMENT_REGISTER",
      documentType: row.documentType,
      documentCategory: row.documentCategory,
      documentTypeCode: row.documentTypeCode,
      packageName: row.packageName,
      delayIndicator: row.delayIndicator,

      count: row.qty ?? 1,
      dueDate: row.plannedSubmissionDate,
      submittedAt: row.actualSubmissionDate,

      status: RecordStatus.ACTIVE,
      uploadedBy,
      lastUpdate: row.status,
      remarks: row.remarks,
      importSource: DocumentImportSource.EXCEL_IMPORT,
      isActive: true,

      stage: {
        connect: {
          code: stageCode,
        },
      },

      workflowStatus: {
        connect: {
          code: workflowStatusCode,
        },
      },

      approvalStatus: {
        connect: {
          code: approvalStatusCode,
        },
      },

      owner: {
        connect: {
          code: "document-control",
        },
      },

      ...(disciplineCode
        ? {
            discipline: {
              connect: {
                code: disciplineCode,
              },
            },
          }
        : {
            discipline: {
              disconnect: true,
            },
          }),
    };

    if (existingDocument) {
      return this.prisma.planningDocument.update({
        where: {
          id: existingDocument.id,
        },
        data: {
          documentNo,
          ...documentData,
        },
      });
    }

    return this.prisma.planningDocument.create({
      data: {
        project: {
          connect: {
            id: projectId,
          },
        },
        documentNo,
        ...(documentData as Prisma.PlanningDocumentCreateInput),
      },
    });
  }

  private async findExistingDocument(input: {
    projectId: string;
    documentNo: string | null;
    title: string;
    revision: string;
  }) {
    if (input.documentNo) {
      return this.prisma.planningDocument.findFirst({
        where: {
          projectId: input.projectId,
          documentNo: input.documentNo,
          planType: "DOCUMENT_REGISTER",
        },
      });
    }

    return this.prisma.planningDocument.findFirst({
      where: {
        projectId: input.projectId,
        title: input.title,
        revision: input.revision,
        planType: "DOCUMENT_REGISTER",
      },
    });
  }

  private async findProjectOrThrow(dto: {
  projectId?: string;
  projectCode?: string;
}) {
  const projectId = dto.projectId?.trim();
  const projectCode = dto.projectCode?.trim();

  console.log("Import project lookup DTO:", {
    rawProjectId: dto.projectId,
    rawProjectCode: dto.projectCode,
    projectId,
    projectCode,
  });

  if (!projectId && !projectCode) {
    throw new BadRequestException(
      "projectId or projectCode is required. For Excel upload, send projectCode as a multipart/form-data field.",
    );
  }

  const project = projectId
    ? await this.prisma.project.findUnique({
        where: {
          id: projectId,
        },
      })
    : await this.prisma.project.findFirst({
        where: {
          code: {
            equals: projectCode,
            mode: "insensitive",
          },
        },
      });

  if (!project) {
    const availableProjects = await this.prisma.project.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: {
        code: "asc",
      },
      take: 20,
    });

    throw new BadRequestException({
      message: "Project not found.",
      received: {
        projectId,
        projectCode,
      },
      availableProjectCodes: availableProjects.map((project) => ({
        id: project.id,
        code: project.code,
        name: project.name,
      })),
    });
  }

  return project;
}

  private async ensureStageExists(code: string) {
    const stage = await this.prisma.documentationStageLookup.findUnique({
      where: {
        code,
      },
    });

    if (!stage) {
      throw new BadRequestException(`Invalid stageCode: ${code}`);
    }
  }

  private async ensureDefaultOwnerExists() {
    await this.prisma.documentOwnerLookup.upsert({
      where: {
        code: "document-control",
      },
      update: {
        label: "Document Control",
        isActive: true,
      },
      create: {
        code: "document-control",
        label: "Document Control",
        displayOrder: 2,
        isActive: true,
      },
    });
  }

  private async ensureDisciplineExists(label: string) {
    const cleanLabel = label.trim();

    if (!cleanLabel) {
      return null;
    }

    const code = this.slugify(cleanLabel);

    await this.prisma.documentDisciplineLookup.upsert({
      where: {
        code,
      },
      update: {
        label: cleanLabel,
        isActive: true,
      },
      create: {
        code,
        label: cleanLabel,
        displayOrder: 999,
        isActive: true,
      },
    });

    return code;
  }

  private async resolveWorkflowStatusCode(status: string | null) {
    const normalized = this.slugify(status || "pending");

    const mappedCode =
      {
        pending: "pending",
        tbd: "pending",
        draft: "draft",
        submitted: "submitted",
        "under-review": "under-review",
        "under-review-client": "under-review",
        approved: "approved",
        rejected: "rejected",
        closed: "approved",
      }[normalized] ?? normalized;

    await this.prisma.documentWorkflowStatusLookup.upsert({
      where: {
        code: mappedCode,
      },
      update: {
        label: this.toTitleLabel(status || mappedCode),
        isActive: true,
      },
      create: {
        code: mappedCode,
        label: this.toTitleLabel(status || mappedCode),
        tone: this.getWorkflowTone(mappedCode),
        displayOrder: 999,
        isActive: true,
      },
    });

    return mappedCode;
  }

  private async resolveApprovalStatusCode(status: string | null) {
    const normalized = this.slugify(status || "not-submitted");

    const mappedCode =
      {
        pending: "not-submitted",
        tbd: "not-submitted",
        draft: "not-submitted",
        submitted: "consultant-review",
        "under-review": "under-review",
        approved: "approved",
        rejected: "rejected",
        closed: "closed",
      }[normalized] ?? "not-submitted";

    await this.prisma.documentApprovalStatusLookup.upsert({
      where: {
        code: mappedCode,
      },
      update: {
        isActive: true,
      },
      create: {
        code: mappedCode,
        label: this.toTitleLabel(mappedCode),
        severity: this.getApprovalSeverity(mappedCode),
        displayOrder: 999,
        isActive: true,
      },
    });

    return mappedCode;
  }

  private slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private toTitleLabel(value: string) {
    return value
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private getWorkflowTone(code: string) {
    if (code.includes("approved") || code.includes("closed")) return "green";
    if (code.includes("reject")) return "red";
    if (code.includes("review") || code.includes("pending")) return "amber";
    return "blue";
  }

  private getApprovalSeverity(code: string) {
    if (code.includes("approved") || code.includes("closed")) return "green";
    if (code.includes("reject") || code.includes("resubmit")) return "red";
    if (code.includes("review") || code.includes("pending")) return "amber";
    return "purple";
  }
}