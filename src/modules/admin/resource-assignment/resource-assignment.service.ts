import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  RecordStatus,
  ResourceType,
  ScheduleUploadStatus,
} from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AssignResourceDto } from "./dto/assign-resource.dto";

type AssignmentStatus = "unassigned" | "partially-assigned" | "assigned";

export interface WbsTreeNode {
  id: string;
  code: string;
  name: string;
  level: number | null;
  directActivityCount: number;
  activityCount: number;
  children: WbsTreeNode[];
}

@Injectable()
export class ResourceAssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjects() {
    return this.prisma.project.findMany({
      where: {
        status: RecordStatus.ACTIVE,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        clientName: true,
      },
    });
  }

  async getBaselines(projectId: string) {
    await this.ensureProjectExists(projectId);

    const uploads = await this.prisma.projectScheduleUpload.findMany({
      where: {
        projectId,
        status: {
          in: [ScheduleUploadStatus.IMPORTED, ScheduleUploadStatus.PARTIAL],
        },
      },
      orderBy: {
        revisionNo: "desc",
      },
      select: {
        id: true,
        projectId: true,
        revisionNo: true,
        fileName: true,
        status: true,
        uploadedAt: true,
        importedAt: true,
        totalRows: true,
        validRows: true,
        errorRows: true,
      },
    });

    return uploads.map((upload) => ({
      id: upload.id,
      projectId: upload.projectId,
      name: `Rev ${String(upload.revisionNo).padStart(2, "0")}`,
      revision: `Rev ${String(upload.revisionNo).padStart(2, "0")}`,
      fileName: upload.fileName,
      status: upload.status,
      uploadedAt: upload.uploadedAt,
      importedAt: upload.importedAt,
      totalRows: upload.totalRows,
      validRows: upload.validRows,
      errorRows: upload.errorRows,
      isActive: uploads[0]?.id === upload.id,
    }));
  }

  async getWbsPackages(uploadId: string) {
    await this.ensureUploadExists(uploadId);

    const { nodesById } = await this.buildWbsTreeForUpload(uploadId, {
      includeMilestones: true,
    });

    const packages = Array.from(nodesById.values()).filter((node) => {
      return node.level === 2;
    });

    return packages.map((node) => ({
      id: node.id,
      code: node.code,
      name: node.name,
      level: node.level,
      directActivityCount: node.directActivityCount,
      activityCount: node.activityCount,
    }));
  }

  async getWbsTree(
    uploadId: string,
    rootWbsId?: string,
  ): Promise<WbsTreeNode[]> {
    await this.ensureUploadExists(uploadId);

    const { roots, nodesById } = await this.buildWbsTreeForUpload(uploadId, {
      includeMilestones: true,
    });

    if (!rootWbsId) {
      return roots;
    }

    const rootNode = nodesById.get(rootWbsId);

    if (!rootNode) {
      throw new NotFoundException(`WBS item "${rootWbsId}" not found.`);
    }

    return [rootNode];
  }

  async getActivitiesForWbs(params: {
    wbsItemId: string;
    status?: string;
    search?: string;
    includeMilestones?: boolean;
  }) {
    const { wbsItemId, status, search, includeMilestones = true } = params;

    await this.ensureWbsItemExists(wbsItemId);

    const where: Prisma.ScheduleActivityWhereInput = {
      wbsItemId,

      ...(includeMilestones
        ? {}
        : {
            isMilestone: false,
          }),

      ...(search?.trim()
        ? {
            OR: [
              {
                activityCode: {
                  contains: search.trim(),
                  mode: "insensitive",
                },
              },
              {
                activityName: {
                  contains: search.trim(),
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const activities = await this.prisma.scheduleActivity.findMany({
      where,
      orderBy: {
        rowNumber: "asc",
      },
      include: {
        milestone: true,
        resourceAssignments: {
          include: {
            resource: true,
          },
        },
        wbsItem: {
          select: {
            id: true,
            wbsCode: true,
            name: true,
          },
        },
      },
    });

    const mapped = activities.map((activity) => {
      const allocationPercent = this.sumAllocation(
        activity.resourceAssignments,
      );

      const assignmentStatus = this.getAssignmentStatus(allocationPercent);

      const firstAssignedResource = activity.resourceAssignments[0]?.resource;

      const plannedStart =
        activity.startDate ?? activity.milestone?.plannedDate ?? null;

      const plannedFinish =
        activity.finishDate ??
        activity.milestone?.plannedDate ??
        activity.startDate ??
        null;

      return {
        id: activity.id,
        wbsId: activity.wbsItemId,
        code: activity.activityCode,
        name: activity.activityName,
        description: activity.wbsItem
          ? `WBS ${activity.wbsItem.wbsCode} — ${activity.wbsItem.name}`
          : "",
        status: assignmentStatus,
        isCritical: activity.isCritical,
        isMilestone: activity.isMilestone,
        durationDays: activity.duration ?? 0,
        allocationPercent,
        requiredRole:
          firstAssignedResource?.designation ||
          firstAssignedResource?.discipline ||
          "Site Engineer",
        plannedStart: this.toDateInputValue(plannedStart),
        plannedFinish: this.toDateInputValue(plannedFinish),
        plannedHours: Math.max((activity.duration ?? 0) * 8, 0),
        rawStatus: activity.status,
        totalFloat: activity.totalFloat,
      };
    });

    if (!status || status === "all") {
      return mapped;
    }

    return mapped.filter((activity) => activity.status === status);
  }

  async getAvailableResources(params: {
    type?: string;
    role?: string;
    start?: string;
    finish?: string;
  }) {
    const resourceType = this.normalizeResourceType(params.type);

    const role = params.role?.trim();

    const plannedStart = params.start ? new Date(params.start) : null;
    const plannedFinish = params.finish ? new Date(params.finish) : null;

    if (plannedStart && Number.isNaN(plannedStart.getTime())) {
      throw new BadRequestException("Invalid start date.");
    }

    if (plannedFinish && Number.isNaN(plannedFinish.getTime())) {
      throw new BadRequestException("Invalid finish date.");
    }

    const resources = await this.prisma.resource.findMany({
      where: {
        isActive: true,

        ...(resourceType
          ? {
              type: resourceType,
            }
          : {}),

        ...(role
          ? {
              OR: [
                {
                  designation: {
                    contains: role,
                    mode: "insensitive",
                  },
                },
                {
                  discipline: {
                    contains: role,
                    mode: "insensitive",
                  },
                },
                {
                  name: {
                    contains: role,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: {
        name: "asc",
      },
      include: {
        activityAssignments: {
          where:
            plannedStart && plannedFinish
              ? {
                  plannedStart: {
                    lte: plannedFinish,
                  },
                  plannedFinish: {
                    gte: plannedStart,
                  },
                }
              : undefined,
        },
      },
    });

    return resources.map((resource) => {
      const allocationPercent = this.sumAllocation(
        resource.activityAssignments,
      );

      return {
        id: resource.id,
        name: resource.name,
        initials: this.getInitials(resource.name),
        type: resource.type.toLowerCase(),
        role: resource.designation || resource.discipline || resource.type,
        allocationPercent,
        availabilityStatus: this.getAvailabilityStatus(allocationPercent),
        email: resource.email,
        phone: resource.phone,
      };
    });
  }

  async assignResource(activityId: string, dto: AssignResourceDto) {
    const activity = await this.prisma.scheduleActivity.findUnique({
      where: {
        id: activityId,
      },
      select: {
        id: true,
        projectId: true,
        activityCode: true,
        activityName: true,
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity "${activityId}" not found.`);
    }

    const resource = await this.prisma.resource.findUnique({
      where: {
        id: dto.resourceId,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!resource) {
      throw new NotFoundException(`Resource "${dto.resourceId}" not found.`);
    }

    if (!resource.isActive) {
      throw new BadRequestException("Selected resource is inactive.");
    }

    const plannedStart = new Date(dto.plannedStart);
    const plannedFinish = new Date(dto.plannedFinish);

    if (
      Number.isNaN(plannedStart.getTime()) ||
      Number.isNaN(plannedFinish.getTime())
    ) {
      throw new BadRequestException("Invalid assignment date range.");
    }

    if (plannedStart > plannedFinish) {
      throw new BadRequestException(
        "Planned start date cannot be after planned finish date.",
      );
    }

    const existingSameAssignment =
      await this.prisma.activityResourceAssignment.findUnique({
        where: {
          activityId_resourceId: {
            activityId,
            resourceId: dto.resourceId,
          },
        },
        select: {
          id: true,
        },
      });

    const overlappingAssignments =
      await this.prisma.activityResourceAssignment.findMany({
        where: {
          resourceId: dto.resourceId,
          plannedStart: {
            lte: plannedFinish,
          },
          plannedFinish: {
            gte: plannedStart,
          },
          ...(existingSameAssignment
            ? {
                id: {
                  not: existingSameAssignment.id,
                },
              }
            : {}),
        },
        select: {
          allocation: true,
        },
      });

    const existingAllocation = this.sumAllocation(overlappingAssignments);
    const nextAllocation = existingAllocation + dto.allocationPercent;

    if (nextAllocation > 100) {
      throw new BadRequestException(
        `Resource allocation exceeds 100% for the selected date range. Current overlapping allocation is ${existingAllocation}%.`,
      );
    }

    const assignment = await this.prisma.activityResourceAssignment.upsert({
      where: {
        activityId_resourceId: {
          activityId,
          resourceId: dto.resourceId,
        },
      },
      create: {
        projectId: activity.projectId,
        activityId,
        resourceId: dto.resourceId,
        allocation: dto.allocationPercent,
        plannedHours: dto.plannedHours ?? null,
        plannedStart,
        plannedFinish,
        remarks: dto.remarks ?? null,
      },
      update: {
        allocation: dto.allocationPercent,
        plannedHours: dto.plannedHours ?? null,
        plannedStart,
        plannedFinish,
        remarks: dto.remarks ?? null,
      },
      include: {
        activity: {
          select: {
            id: true,
            activityCode: true,
            activityName: true,
          },
        },
        resource: true,
      },
    });

    return {
      success: true,
      message: "Resource assigned successfully.",
      assignment,
    };
  }

  private async ensureProjectExists(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project "${projectId}" not found.`);
    }

    return project;
  }

  private async ensureUploadExists(uploadId: string) {
    const upload = await this.prisma.projectScheduleUpload.findUnique({
      where: {
        id: uploadId,
      },
      select: {
        id: true,
      },
    });

    if (!upload) {
      throw new NotFoundException(`Schedule upload "${uploadId}" not found.`);
    }

    return upload;
  }

  private async ensureWbsItemExists(wbsItemId: string) {
    const wbsItem = await this.prisma.wbsItem.findUnique({
      where: {
        id: wbsItemId,
      },
      select: {
        id: true,
      },
    });

    if (!wbsItem) {
      throw new NotFoundException(`WBS item "${wbsItemId}" not found.`);
    }

    return wbsItem;
  }

  private async buildWbsTreeForUpload(
    uploadId: string,
    options?: {
      includeMilestones?: boolean;
    },
  ): Promise<{
    roots: WbsTreeNode[];
    nodesById: Map<string, WbsTreeNode>;
    parentIdById: Map<string, string | null>;
  }> {
    const includeMilestones = options?.includeMilestones ?? true;

    const [wbsItems, activityCounts] = await Promise.all([
      this.prisma.wbsItem.findMany({
        where: {
          uploadId,
        },
        orderBy: {
          rowNumber: "asc",
        },
        select: {
          id: true,
          parentId: true,
          wbsCode: true,
          wbsLevel: true,
          name: true,
          rowNumber: true,
        },
      }),

      this.prisma.scheduleActivity.groupBy({
        by: ["wbsItemId"],
        where: {
          uploadId,
          wbsItemId: {
            not: null,
          },

          /**
           * Important:
           * Do not exclude milestones by default.
           * The resource assignment screen should count all child schedule rows
           * unless explicitly told not to.
           */
          ...(includeMilestones
            ? {}
            : {
                isMilestone: false,
              }),
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const directActivityCountByWbsId = new Map<string, number>();

    for (const item of activityCounts) {
      if (item.wbsItemId) {
        directActivityCountByWbsId.set(item.wbsItemId, item._count.id);
      }
    }

    const nodesById = new Map<string, WbsTreeNode>();
    const parentIdById = new Map<string, string | null>();
    const roots: WbsTreeNode[] = [];

    for (const item of wbsItems) {
      const directActivityCount = directActivityCountByWbsId.get(item.id) ?? 0;

      nodesById.set(item.id, {
        id: item.id,
        code: item.wbsCode,
        name: item.name,
        level: item.wbsLevel,
        directActivityCount,
        activityCount: directActivityCount,
        children: [],
      });

      parentIdById.set(item.id, item.parentId);
    }

    for (const item of wbsItems) {
      const node = nodesById.get(item.id);

      if (!node) continue;

      if (item.parentId && nodesById.has(item.parentId)) {
        nodesById.get(item.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }

    /**
     * Roll up child activity counts into parent WBS nodes.
     *
     * Example:
     * 2 GENERAL = all activities under 2, 2.5, 2.5.1, etc.
     * 2.5 CONTRACT = direct activities under 2.5 + descendants.
     */
    const rollUpCounts = (node: WbsTreeNode): number => {
      const childActivityCount = node.children.reduce(
        (total, child) => total + rollUpCounts(child),
        0,
      );

      node.activityCount = node.directActivityCount + childActivityCount;

      return node.activityCount;
    };

    roots.forEach(rollUpCounts);

    return {
      roots,
      nodesById,
      parentIdById,
    };
  }

  private sumAllocation(assignments: Array<{ allocation: number | null }>) {
    return Math.round(
      assignments.reduce(
        (total, assignment) => total + Number(assignment.allocation ?? 0),
        0,
      ),
    );
  }

  private getAssignmentStatus(allocationPercent: number): AssignmentStatus {
    if (allocationPercent >= 100) return "assigned";
    if (allocationPercent > 0) return "partially-assigned";
    return "unassigned";
  }

  private getAvailabilityStatus(allocationPercent: number) {
    if (allocationPercent >= 100) return "over-allocated";
    if (allocationPercent >= 80) return "high-load";
    return "available";
  }

  private toDateInputValue(value: Date | null) {
    if (!value) return "";

    return value.toISOString().slice(0, 10);
  }

  private getInitials(name: string) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  private normalizeResourceType(type?: string): ResourceType | undefined {
    if (!type?.trim()) return undefined;

    const normalized = type.trim().toUpperCase();

    if (normalized === "PERSON") return ResourceType.PERSON;
    if (normalized === "TEAM") return ResourceType.TEAM;
    if (normalized === "EQUIPMENT") return ResourceType.EQUIPMENT;
    if (normalized === "MATERIAL") return ResourceType.MATERIAL;
    if (normalized === "VENDOR") return ResourceType.VENDOR;

    throw new BadRequestException(`Invalid resource type "${type}".`);
  }
}
