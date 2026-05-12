// src/modules/schedules/schedules.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ActivityStatus, ScheduleUploadStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { ScheduleExcelParserService } from "./schedule-excel-parser.service";

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ScheduleExcelParserService,
  ) {}

  async uploadSchedule(params: {
    file: Express.Multer.File;
    projectCode: string;
    dryRun: boolean;
    uploadedById?: string;
  }) {
    const { file, projectCode, dryRun, uploadedById } = params;

    if (!file?.buffer?.length) {
      throw new BadRequestException("No Excel file uploaded.");
    }

    const project = await this.prisma.project.findUnique({
      where: {
        code: projectCode,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with code "${projectCode}" not found.`,
      );
    }

    const parsed = await this.parser.parse(file.buffer);

    const validRows = parsed.wbsItems.length + parsed.activities.length;
    const errorRows = parsed.errors.length;
    const hasErrors = errorRows > 0;
    const hasValidRows = validRows > 0;

    if (dryRun) {
      return {
        success: !hasErrors,
        canImport: hasValidRows,
        mode: "dry-run",
        projectCode: project.code,
        projectName: project.name,
        sheetName: parsed.sheetName,
        totalRows: parsed.totalRows,
        validRows,
        errorRows,
        wbsItems: parsed.wbsItems.length,
        activities: parsed.activities.length,
        milestones: parsed.milestones.length,
        errors: parsed.errors,
      };
    }

    const latestUpload = await this.prisma.projectScheduleUpload.findFirst({
      where: {
        projectId: project.id,
      },
      orderBy: {
        revisionNo: "desc",
      },
      select: {
        revisionNo: true,
      },
    });

    const nextRevisionNo = (latestUpload?.revisionNo ?? 0) + 1;

    return this.prisma.$transaction(
      async (tx) => {
        const upload = await tx.projectScheduleUpload.create({
          data: {
            projectId: project.id,
            fileName: file.originalname,
            fileSize: file.size,
            sheetName: parsed.sheetName,
            revisionNo: nextRevisionNo,
            uploadedById,
            status: ScheduleUploadStatus.PROCESSING,
            totalRows: parsed.totalRows,
            validRows,
            errorRows,
          },
        });

        if (hasErrors) {
          await tx.scheduleImportError.createMany({
            data: parsed.errors.map((error) => ({
              uploadId: upload.id,
              sheetName: parsed.sheetName || null,
              rowNumber: error.rowNumber,
              columnName: error.columnName ?? null,
              errorMessage: error.errorMessage,
              rawValue: error.rawValue ?? null,
            })),
          });
        }

        if (!hasValidRows) {
          const failedUpload = await tx.projectScheduleUpload.update({
            where: {
              id: upload.id,
            },
            data: {
              status: ScheduleUploadStatus.FAILED,
              totalRows: parsed.totalRows,
              validRows: 0,
              errorRows,
            },
          });

          return {
            success: false,
            status: failedUpload.status,
            mode: "import",
            uploadId: failedUpload.id,
            revisionNo: failedUpload.revisionNo,
            projectCode: project.code,
            projectName: project.name,
            sheetName: parsed.sheetName,
            totalRows: parsed.totalRows,
            validRows: 0,
            errorRows,
            wbsItems: 0,
            activities: 0,
            milestones: 0,
            errors: parsed.errors,
          };
        }

        const wbsIdByTempKey = new Map<string, string>();
        const seenWbsCodes = new Set<string>();

        for (const item of parsed.wbsItems) {
          const wbsCodeKey = item.wbsCode.trim().toUpperCase();

          if (seenWbsCodes.has(wbsCodeKey)) {
            continue;
          }

          seenWbsCodes.add(wbsCodeKey);

          const parentId = item.parentTempKey
            ? (wbsIdByTempKey.get(item.parentTempKey) ?? null)
            : null;

          const createdWbsItem = await tx.wbsItem.create({
            data: {
              projectId: project.id,
              uploadId: upload.id,
              parentId,
              wbsCode: item.wbsCode,
              wbsLevel: item.wbsLevel,
              name: item.name,
              duration: item.duration,
              startDate: item.startDate,
              finishDate: item.finishDate,
              totalFloat: item.totalFloat,
              rowNumber: item.rowNumber,
            },
            select: {
              id: true,
            },
          });

          wbsIdByTempKey.set(item.tempKey, createdWbsItem.id);
        }

        const activityIdByCode = new Map<string, string>();
        const seenActivityCodes = new Set<string>();

        for (const activity of parsed.activities) {
          const activityCodeKey = activity.activityCode.trim().toUpperCase();

          if (seenActivityCodes.has(activityCodeKey)) {
            continue;
          }

          seenActivityCodes.add(activityCodeKey);

          const wbsItemId = activity.parentWbsTempKey
            ? (wbsIdByTempKey.get(activity.parentWbsTempKey) ?? null)
            : null;

          const createdActivity = await tx.scheduleActivity.create({
            data: {
              projectId: project.id,
              uploadId: upload.id,
              wbsItemId,
              activityCode: activity.activityCode,
              activityName: activity.activityName,
              duration: activity.duration,
              startDate: activity.startDate,
              finishDate: activity.finishDate,
              totalFloat: activity.totalFloat,
              isMilestone: activity.isMilestone,
              isCritical: activity.isCritical,
              status: ActivityStatus.NOT_STARTED,
              rowNumber: activity.rowNumber,
            },
            select: {
              id: true,
            },
          });

          activityIdByCode.set(activity.activityCode, createdActivity.id);
        }

        const seenMilestoneCodes = new Set<string>();

        for (const milestone of parsed.milestones) {
          const milestoneCodeKey = milestone.milestoneCode.trim().toUpperCase();

          if (seenMilestoneCodes.has(milestoneCodeKey)) {
            continue;
          }

          seenMilestoneCodes.add(milestoneCodeKey);

          const activityId = activityIdByCode.get(milestone.activityCode);

          if (!activityId) {
            continue;
          }

          await tx.milestone.create({
            data: {
              projectId: project.id,
              uploadId: upload.id,
              activityId,
              milestoneCode: milestone.milestoneCode,
              name: milestone.name,
              plannedDate: milestone.plannedDate,
              status: ActivityStatus.NOT_STARTED,
            },
          });
        }

        const finalStatus = hasErrors
          ? ScheduleUploadStatus.PARTIAL
          : ScheduleUploadStatus.IMPORTED;

        const importedUpload = await tx.projectScheduleUpload.update({
          where: {
            id: upload.id,
          },
          data: {
            status: finalStatus,
            importedAt: new Date(),
            totalRows: parsed.totalRows,
            validRows,
            errorRows,
          },
        });

        return {
          success: true,
          status: importedUpload.status,
          mode: "import",
          uploadId: importedUpload.id,
          revisionNo: importedUpload.revisionNo,
          projectCode: project.code,
          projectName: project.name,
          sheetName: parsed.sheetName,
          totalRows: parsed.totalRows,
          validRows,
          errorRows,
          wbsItems: parsed.wbsItems.length,
          activities: parsed.activities.length,
          milestones: parsed.milestones.length,
          errors: parsed.errors,
        };
      },
      {
        maxWait: 10_000,
        timeout: 120_000,
      },
    );
  }

  async getUploads(projectCode?: string) {
    return this.prisma.projectScheduleUpload.findMany({
      where: projectCode
        ? {
            project: {
              code: projectCode,
            },
          }
        : undefined,
      orderBy: {
        uploadedAt: "desc",
      },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            name: true,
            clientName: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            wbsItems: true,
            activities: true,
            milestones: true,
            errors: true,
          },
        },
      },
    });
  }

  async getUploadById(uploadId: string) {
    const upload = await this.prisma.projectScheduleUpload.findUnique({
      where: {
        id: uploadId,
      },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            name: true,
            clientName: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            wbsItems: true,
            activities: true,
            milestones: true,
            errors: true,
          },
        },
      },
    });

    if (!upload) {
      throw new NotFoundException(`Schedule upload "${uploadId}" not found.`);
    }

    return upload;
  }

  async getWbs(uploadId: string) {
    await this.ensureUploadExists(uploadId);

    return this.prisma.wbsItem.findMany({
      where: {
        uploadId,
      },
      orderBy: {
        rowNumber: "asc",
      },
      include: {
        parent: {
          select: {
            id: true,
            wbsCode: true,
            wbsLevel: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            wbsCode: true,
            wbsLevel: true,
            name: true,
          },
          orderBy: {
            rowNumber: "asc",
          },
        },
        activities: {
          select: {
            id: true,
            activityCode: true,
            activityName: true,
            duration: true,
            startDate: true,
            finishDate: true,
            totalFloat: true,
            isMilestone: true,
            isCritical: true,
            status: true,
            rowNumber: true,
          },
          orderBy: {
            rowNumber: "asc",
          },
        },
      },
    });
  }

  async getActivities(uploadId: string) {
    await this.ensureUploadExists(uploadId);

    return this.prisma.scheduleActivity.findMany({
      where: {
        uploadId,
      },
      orderBy: {
        rowNumber: "asc",
      },
      include: {
        wbsItem: {
          select: {
            id: true,
            wbsCode: true,
            wbsLevel: true,
            name: true,
          },
        },
        milestone: true,
        resourceAssignments: {
          include: {
            resource: true,
          },
        },
      },
    });
  }

  async getMilestones(uploadId: string) {
    await this.ensureUploadExists(uploadId);

    return this.prisma.milestone.findMany({
      where: {
        uploadId,
      },
      orderBy: [
        {
          plannedDate: "asc",
        },
        {
          milestoneCode: "asc",
        },
      ],
      include: {
        activity: {
          select: {
            id: true,
            activityCode: true,
            activityName: true,
            duration: true,
            startDate: true,
            finishDate: true,
            totalFloat: true,
            isCritical: true,
            status: true,
            rowNumber: true,
          },
        },
      },
    });
  }

  async getResources(uploadId: string) {
    await this.ensureUploadExists(uploadId);

    return this.prisma.activityResourceAssignment.findMany({
      where: {
        activity: {
          uploadId,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        activity: {
          select: {
            id: true,
            activityCode: true,
            activityName: true,
            wbsItem: {
              select: {
                id: true,
                wbsCode: true,
                name: true,
              },
            },
          },
        },
        resource: true,
      },
    });
  }

  async getErrors(uploadId: string) {
    await this.ensureUploadExists(uploadId);

    return this.prisma.scheduleImportError.findMany({
      where: {
        uploadId,
      },
      orderBy: {
        rowNumber: "asc",
      },
    });
  }

  async getLatestUploadForProject(projectCode: string) {
    const upload = await this.prisma.projectScheduleUpload.findFirst({
      where: {
        project: {
          code: projectCode,
        },
      },
      orderBy: {
        revisionNo: "desc",
      },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            name: true,
            clientName: true,
          },
        },
        _count: {
          select: {
            wbsItems: true,
            activities: true,
            milestones: true,
            errors: true,
          },
        },
      },
    });

    if (!upload) {
      throw new NotFoundException(
        `No schedule uploads found for project "${projectCode}".`,
      );
    }

    return upload;
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
  async deleteUpload(uploadId: string) {
  const upload = await this.prisma.projectScheduleUpload.findUnique({
    where: {
      id: uploadId,
    },
    select: {
      id: true,
      fileName: true,
      revisionNo: true,
      project: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      _count: {
        select: {
          wbsItems: true,
          activities: true,
          milestones: true,
          errors: true,
        },
      },
    },
  });

  if (!upload) {
    throw new NotFoundException(`Schedule upload "${uploadId}" not found.`);
  }

  await this.prisma.projectScheduleUpload.delete({
    where: {
      id: uploadId,
    },
  });

  return {
    success: true,
    message: "Schedule upload deleted successfully.",
    uploadId: upload.id,
    fileName: upload.fileName,
    revisionNo: upload.revisionNo,
    project: upload.project,
    deletedCounts: upload._count,
  };
}
}
