import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DocumentImportSource,
  Prisma,
  RecordStatus,
} from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { DocumentStatusQueryDto } from "./dto/document-status-query.dto";
import { PatchDocumentStatusDto } from "./dto/patch-document-status.dto";
import { PutDocumentStatusDto } from "./dto/put-document-status.dto";

const documentInclude = {
  project: {
    select: {
      id: true,
      code: true,
      name: true,
      portfolio: true,
    },
  },
  stage: true,
  approvalStatus: true,
  discipline: true,
  owner: true,
  workflowStatus: true,
} satisfies Prisma.PlanningDocumentInclude;

type DocumentWithRelations = Prisma.PlanningDocumentGetPayload<{
  include: typeof documentInclude;
}>;

@Injectable()
export class DocumentStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getLookups() {
    const [
      stages,
      disciplines,
      owners,
      workflowStatuses,
      approvalStatuses,
    ] = await Promise.all([
      this.prisma.documentationStageLookup.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      this.prisma.documentDisciplineLookup.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      this.prisma.documentOwnerLookup.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      this.prisma.documentWorkflowStatusLookup.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      this.prisma.documentApprovalStatusLookup.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
    ]);

    return {
      stages: stages.map((item) => ({
        code: item.code,
        label: item.label,
        displayOrder: item.displayOrder,
      })),
      disciplines: disciplines.map((item) => ({
        code: item.code,
        label: item.label,
        displayOrder: item.displayOrder,
      })),
      owners: owners.map((item) => ({
        code: item.code,
        label: item.label,
        displayOrder: item.displayOrder,
      })),
      workflowStatuses: workflowStatuses.map((item) => ({
        code: item.code,
        label: item.label,
        tone: item.tone,
        displayOrder: item.displayOrder,
      })),
      approvalStatuses: approvalStatuses.map((item) => ({
        code: item.code,
        label: item.label,
        tone: item.severity,
        severity: item.severity,
        displayOrder: item.displayOrder,
      })),
    };
  }

  async getDocuments(query: DocumentStatusQueryDto) {
    const where = this.buildDocumentWhere(query);
    const orderBy = this.buildOrderBy(query.sortBy);

    const documents = await this.prisma.planningDocument.findMany({
      where,
      include: documentInclude,
      orderBy,
    });

    return documents.map((document) => this.toDocumentResponse(document));
  }

  async getDocumentById(id: string) {
    const document = await this.prisma.planningDocument.findFirst({
      where: {
        id,
        isActive: true,
        planType: "DOCUMENT_REGISTER",
      },
      include: documentInclude,
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    return this.toDocumentResponse(document);
  }

  async putDocument(dto: PutDocumentStatusDto) {
    if (!dto.projectId && !dto.projectCode) {
      throw new BadRequestException("projectId or projectCode is required");
    }

    if (!dto.documentNo?.trim()) {
      throw new BadRequestException("documentNo is required");
    }

    if (!dto.title?.trim()) {
      throw new BadRequestException("title is required");
    }

    const project = await this.findProjectOrThrow(dto);
    await this.validateLookupValues({
      stageCode: dto.stageCode ?? "design",
      disciplineCode: dto.disciplineCode,
      ownerCode: dto.ownerCode,
      workflowStatusCode: dto.workflowStatusCode ?? "draft",
      approvalStatusCode: dto.approvalStatusCode ?? "not-submitted",
    });

    const existingDocument = dto.id
      ? await this.prisma.planningDocument.findFirst({
          where: {
            id: dto.id,
            planType: "DOCUMENT_REGISTER",
          },
        })
      : await this.prisma.planningDocument.findFirst({
          where: {
            projectId: project.id,
            documentNo: dto.documentNo.trim(),
            planType: "DOCUMENT_REGISTER",
          },
        });

    if (existingDocument) {
      const updatedDocument = await this.prisma.planningDocument.update({
        where: { id: existingDocument.id },
        data: this.buildUpdateData(dto, project.id, true),
        include: documentInclude,
      });

      return this.toDocumentResponse(updatedDocument);
    }

    const createdDocument = await this.prisma.planningDocument.create({
      data: this.buildCreateData(dto, project.id),
      include: documentInclude,
    });

    return this.toDocumentResponse(createdDocument);
  }

  async patchDocument(id: string, dto: PatchDocumentStatusDto) {
    const existingDocument = await this.prisma.planningDocument.findFirst({
      where: {
        id,
        isActive: true,
        planType: "DOCUMENT_REGISTER",
      },
    });

    if (!existingDocument) {
      throw new NotFoundException("Document not found");
    }

    if (dto.projectId || dto.projectCode) {
      await this.findProjectOrThrow(dto);
    }

    await this.validateLookupValues({
      stageCode: dto.stageCode,
      disciplineCode: dto.disciplineCode,
      ownerCode: dto.ownerCode,
      workflowStatusCode: dto.workflowStatusCode,
      approvalStatusCode: dto.approvalStatusCode,
    });

    const updatedDocument = await this.prisma.planningDocument.update({
      where: { id },
      data: this.buildUpdateData(dto),
      include: documentInclude,
    });

    return this.toDocumentResponse(updatedDocument);
  }

  async deleteDocument(id: string) {
    const existingDocument = await this.prisma.planningDocument.findFirst({
      where: {
        id,
        isActive: true,
        planType: "DOCUMENT_REGISTER",
      },
    });

    if (!existingDocument) {
      throw new NotFoundException("Document not found");
    }

    await this.prisma.planningDocument.update({
      where: { id },
      data: {
        isActive: false,
        status: RecordStatus.ARCHIVED,
      },
    });

    return {
      deleted: true,
      id,
    };
  }

  async deleteDocuments(query: DocumentStatusQueryDto) {
    const where = this.buildDocumentWhere(query);

    const result = await this.prisma.planningDocument.updateMany({
      where,
      data: {
        isActive: false,
        status: RecordStatus.ARCHIVED,
      },
    });

    return {
      deleted: true,
      count: result.count,
    };
  }

  private buildDocumentWhere(
    query: DocumentStatusQueryDto,
  ): Prisma.PlanningDocumentWhereInput {
    const where: Prisma.PlanningDocumentWhereInput = {
      isActive: true,
      planType: "DOCUMENT_REGISTER",
    };

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.projectCode) {
      where.project = {
        code: query.projectCode,
      };
    }

    if (query.disciplineCode) {
      where.disciplineCode = query.disciplineCode;
    }

    if (query.ownerCode) {
      where.ownerCode = query.ownerCode;
    }

    if (query.workflowStatusCode) {
      where.workflowStatusCode = query.workflowStatusCode;
    }

    if (query.approvalStatusCode) {
      where.approvalStatusCode = query.approvalStatusCode;
    }

    const search = query.search?.trim();

    if (search) {
      where.OR = [
        {
          documentNo: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          fileName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          revision: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    return where;
  }

  private buildOrderBy(
    sortBy?: "latest" | "dueDate" | "status",
  ): Prisma.PlanningDocumentOrderByWithRelationInput[] {
    if (sortBy === "dueDate") {
      return [{ dueDate: "asc" }, { updatedAt: "desc" }];
    }

    if (sortBy === "status") {
      return [{ workflowStatusCode: "asc" }, { updatedAt: "desc" }];
    }

    return [{ updatedAt: "desc" }];
  }

  private async findProjectOrThrow(dto: {
    projectId?: string;
    projectCode?: string;
  }) {
    const project = dto.projectId
      ? await this.prisma.project.findUnique({
          where: { id: dto.projectId },
        })
      : await this.prisma.project.findUnique({
          where: { code: dto.projectCode! },
        });

    if (!project) {
      throw new BadRequestException("Project not found");
    }

    return project;
  }

  private async validateLookupValues(input: {
    stageCode?: string;
    disciplineCode?: string;
    ownerCode?: string;
    workflowStatusCode?: string;
    approvalStatusCode?: string;
  }) {
    const [
      stage,
      discipline,
      owner,
      workflowStatus,
      approvalStatus,
    ] = await Promise.all([
      input.stageCode
        ? this.prisma.documentationStageLookup.findUnique({
            where: { code: input.stageCode },
          })
        : Promise.resolve(null),

      input.disciplineCode
        ? this.prisma.documentDisciplineLookup.findUnique({
            where: { code: input.disciplineCode },
          })
        : Promise.resolve(null),

      input.ownerCode
        ? this.prisma.documentOwnerLookup.findUnique({
            where: { code: input.ownerCode },
          })
        : Promise.resolve(null),

      input.workflowStatusCode
        ? this.prisma.documentWorkflowStatusLookup.findUnique({
            where: { code: input.workflowStatusCode },
          })
        : Promise.resolve(null),

      input.approvalStatusCode
        ? this.prisma.documentApprovalStatusLookup.findUnique({
            where: { code: input.approvalStatusCode },
          })
        : Promise.resolve(null),
    ]);

    if (input.stageCode && !stage) {
      throw new BadRequestException(`Invalid stageCode: ${input.stageCode}`);
    }

    if (input.disciplineCode && !discipline) {
      throw new BadRequestException(
        `Invalid disciplineCode: ${input.disciplineCode}`,
      );
    }

    if (input.ownerCode && !owner) {
      throw new BadRequestException(`Invalid ownerCode: ${input.ownerCode}`);
    }

    if (input.workflowStatusCode && !workflowStatus) {
      throw new BadRequestException(
        `Invalid workflowStatusCode: ${input.workflowStatusCode}`,
      );
    }

    if (input.approvalStatusCode && !approvalStatus) {
      throw new BadRequestException(
        `Invalid approvalStatusCode: ${input.approvalStatusCode}`,
      );
    }
  }

  private buildCreateData(
    dto: PutDocumentStatusDto,
    projectId: string,
  ): Prisma.PlanningDocumentCreateInput {
    const documentNo = dto.documentNo.trim();
    const title = dto.title.trim();

    return {
      project: {
        connect: { id: projectId },
      },

      documentNo,
      title,
      fileName: dto.fileName?.trim() || `${documentNo}.pdf`,
      revision: dto.revision?.trim() || "R00",

      planType: "DOCUMENT_REGISTER",
      status: RecordStatus.ACTIVE,
      uploadedBy: dto.uploadedBy?.trim() || "Document Controller",

      stage: {
        connect: {
          code: dto.stageCode || "design",
        },
      },

      approvalStatus: {
        connect: {
          code: dto.approvalStatusCode || "not-submitted",
        },
      },

      workflowStatus: {
        connect: {
          code: dto.workflowStatusCode || "draft",
        },
      },

      ...(dto.disciplineCode
        ? {
            discipline: {
              connect: {
                code: dto.disciplineCode,
              },
            },
          }
        : {}),

      ...(dto.ownerCode
        ? {
            owner: {
              connect: {
                code: dto.ownerCode,
              },
            },
          }
        : {}),

      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      progressPct: this.clampProgress(dto.progressPct ?? 0),
      lastUpdate: dto.lastUpdate?.trim() || null,
      remarks: dto.remarks?.trim() || null,
      importSource: DocumentImportSource.MANUAL,
      isActive: true,
    };
  }

  private buildUpdateData(
    dto: PatchDocumentStatusDto,
    projectId?: string,
    replaceMode = false,
  ): Prisma.PlanningDocumentUpdateInput {
    const data: Prisma.PlanningDocumentUpdateInput = {};

    if (projectId) {
      data.project = {
        connect: { id: projectId },
      };
    }

    if (dto.documentNo !== undefined) {
      data.documentNo = dto.documentNo.trim();
    }

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }

    if (dto.fileName !== undefined) {
      data.fileName = dto.fileName.trim();
    } else if (replaceMode && dto.documentNo) {
      data.fileName = `${dto.documentNo.trim()}.pdf`;
    }

    if (dto.revision !== undefined) {
      data.revision = dto.revision.trim();
    } else if (replaceMode) {
      data.revision = "R00";
    }

    data.planType = "DOCUMENT_REGISTER";
    data.status = RecordStatus.ACTIVE;
    data.isActive = true;

    if (dto.uploadedBy !== undefined) {
      data.uploadedBy = dto.uploadedBy.trim();
    }

    if (dto.stageCode !== undefined) {
      data.stage = {
        connect: { code: dto.stageCode },
      };
    } else if (replaceMode) {
      data.stage = {
        connect: { code: "design" },
      };
    }

    if (dto.approvalStatusCode !== undefined) {
      data.approvalStatus = {
        connect: { code: dto.approvalStatusCode },
      };
    } else if (replaceMode) {
      data.approvalStatus = {
        connect: { code: "not-submitted" },
      };
    }

    if (dto.workflowStatusCode !== undefined) {
      data.workflowStatus = {
        connect: { code: dto.workflowStatusCode },
      };
    } else if (replaceMode) {
      data.workflowStatus = {
        connect: { code: "draft" },
      };
    }

    if (dto.disciplineCode !== undefined) {
      data.discipline = dto.disciplineCode
        ? {
            connect: { code: dto.disciplineCode },
          }
        : {
            disconnect: true,
          };
    }

    if (dto.ownerCode !== undefined) {
      data.owner = dto.ownerCode
        ? {
            connect: { code: dto.ownerCode },
          }
        : {
            disconnect: true,
          };
    }

    if (dto.dueDate !== undefined) {
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    if (dto.progressPct !== undefined) {
      data.progressPct = this.clampProgress(dto.progressPct);
    }

    if (dto.lastUpdate !== undefined) {
      data.lastUpdate = dto.lastUpdate?.trim() || null;
    }

    if (dto.remarks !== undefined) {
      data.remarks = dto.remarks?.trim() || null;
    }

    data.importSource = DocumentImportSource.MANUAL;

    return data;
  }

  private toDocumentResponse(document: DocumentWithRelations) {
    return {
      id: document.id,

      projectId: document.projectId,
      projectCode: document.project.code,
      projectName: document.project.name,
      portfolio: document.project.portfolio,

      documentNo: document.documentNo,
      docNo: document.documentNo,
      title: document.title,
      fileName: document.fileName,
      revision: document.revision,

      stageCode: document.stageCode,
      stageLabel: document.stage.label,

      disciplineCode: document.disciplineCode,
      disciplineLabel: document.discipline?.label ?? null,

      ownerCode: document.ownerCode,
      ownerLabel: document.owner?.label ?? null,

      workflowStatusCode: document.workflowStatusCode,
      statusCode: document.workflowStatusCode,
      statusLabel: document.workflowStatus?.label ?? null,
      statusTone: document.workflowStatus?.tone ?? null,

      approvalStatusCode: document.approvalStatusCode,
      approvalStatusLabel: document.approvalStatus.label,
      approvalStatusTone: document.approvalStatus.severity,

      dueDate: document.dueDate?.toISOString() ?? null,
      progressPct: document.progressPct,
      lastUpdate: document.lastUpdate,
      remarks: document.remarks,

      importSource: document.importSource,
      isActive: document.isActive,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    };
  }

  private clampProgress(value: number) {
    if (Number.isNaN(value)) return 0;
    return Math.min(100, Math.max(0, value));
  }
}