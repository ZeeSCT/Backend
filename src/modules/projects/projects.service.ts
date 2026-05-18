import { Injectable } from "@nestjs/common";
import { RecordStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({
      where: {
        status: RecordStatus.ACTIVE,
      },
      include: {
        portfolioCategory: true,
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            activities: true,
            milestones: true,
            resources: true,
            inspections: true,
            ncrs: true,
            materialRequests: true,
            purchaseOrders: true,
            assets: true,
            scheduleUploads: true,
            wbsItems: true,
            scheduleActivities: true,
            scheduleMilestones: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        portfolioCategory: true,
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        activities: true,
        milestones: true,
        resources: true,
        inspections: true,
        ncrs: true,
        materialRequests: true,
        purchaseOrders: true,
        assets: true,
        scheduleUploads: {
          orderBy: {
            revisionNo: "desc",
          },
        },
        wbsItems: true,
        scheduleActivities: true,
        scheduleMilestones: true,
      },
    });
  }
}