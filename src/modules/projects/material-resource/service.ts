import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import {
  RecordStatus,
  MaterialAvailabilityStatus,
  MaterialDeliveryStatus,
 
} from "@prisma/client";

export enum MaterialFilter {
  ALL = "all",
  SHORTAGES = "shortages",
  PENDING = "pending",
}

@Injectable()
export class MaterialResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjects(category: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        status: RecordStatus.ACTIVE,
        ...(category !== MaterialFilter.ALL
          ? {
              OR: [
                { portfolio: category },
                { portfolioCategory: { code: category } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        portfolio: true,
        portfolioCategory: {
          select: {
            code: true,
          },
        },
        resources: {
          select: {
            resourceRole: true,
            availableQty: true,
            materialStatus: true,
            deliveryStatus: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return projects.map((project) => {
      const materialResources = project.resources.filter(
        (resource) => !this.isLabourResource(resource.resourceRole),
      );

      return {
        id: project.id,
        name: project.name,
        portfolioCategory: project.portfolioCategory?.code ?? project.portfolio,
        materialsOnSite: materialResources.reduce(
          (sum, row) => sum + row.availableQty,
          0,
        ),
        pendingDelivery: materialResources.filter(
          (row) => row.deliveryStatus !== MaterialDeliveryStatus.DELIVERED,
        ).length,
      };
    });
  }

  async getSummary(projectId: string) {
    this.validateProjectId(projectId);

    const resources = await this.prisma.planningResource.findMany({
      where: {
        projectId,
      },
    });

    const materialResources = resources.filter(
      (row) => !this.isLabourResource(row.resourceRole),
    );

    const labourResources = resources.filter((row) =>
      this.isLabourResource(row.resourceRole),
    );

    const shortages = materialResources.filter(
      (row) => row.materialStatus === MaterialAvailabilityStatus.SHORTAGE,
    ).length;

    const pendingDelivery = materialResources.filter(
      (row) => row.deliveryStatus !== MaterialDeliveryStatus.DELIVERED,
    ).length;

    const materialsOnSite = materialResources.reduce(
      (sum, row) => sum + row.availableQty,
      0,
    );

    const plannedLabour = labourResources.reduce(
      (sum, row) => sum + row.plannedQty,
      0,
    );

    const labourOnSite = labourResources.reduce(
      (sum, row) => sum + row.availableQty,
      0,
    );

    return {
      materialsOnSite,
      shortages,
      pendingDelivery,
      labourOnSite,
      plannedLabour,
    };
  }

  async getMaterials(projectId: string, filter: MaterialFilter) {
    this.validateProjectId(projectId);

    const rows = await this.prisma.planningResource.findMany({
      where: {
        projectId,
      },
      orderBy: {
        requiredDate: "asc",
      },
    });

    const materialRows = rows
      .filter((row) => !this.isLabourResource(row.resourceRole))
      .map((row) => {
        const shortQty = Math.max(row.plannedQty - row.availableQty, 0);

        return {
          id: row.id,
          projectId: row.projectId,
          material: row.resourceName ?? row.resourceRole,
          packageName: row.resourceRole,
          requiredQty: String(row.plannedQty),
          onSite: String(row.availableQty),
          short: shortQty > 0 ? String(shortQty) : null,
          expectedDelivery: row.requiredDate
            ? this.formatDate(row.requiredDate)
            : null,
          deliveryStatus: row.deliveryStatus,
          status: row.materialStatus,
        };
      });

    switch (filter) {
      case MaterialFilter.SHORTAGES:
        return materialRows.filter(
          (row) => row.status === MaterialAvailabilityStatus.SHORTAGE,
        );

      case MaterialFilter.PENDING:
        return materialRows.filter(
          (row) => row.deliveryStatus !== MaterialDeliveryStatus.DELIVERED,
        );

      case MaterialFilter.ALL:
      default:
        return materialRows;
    }
  }

  async getLabour(projectId: string) {
    this.validateProjectId(projectId);

    const rows = await this.prisma.planningResource.findMany({
      where: {
        projectId,
      },
      orderBy: {
        resourceRole: "asc",
      },
    });

    return rows
      .filter((row) => this.isLabourResource(row.resourceRole))
      .map((row) => ({
        id: row.id,
        projectId: row.projectId,
        trade: row.resourceName ?? row.resourceRole,
        plannedHeadcount: row.plannedQty,
        onSiteToday: row.availableQty,
        status: row.labourStatus,
      }));
  }

  private validateProjectId(projectId?: string) {
    if (!projectId) {
      throw new BadRequestException("projectId is required");
    }
  }

  private isLabourResource(resourceRole: string) {
    const value = resourceRole.toLowerCase();

    return (
      value.includes("labour") ||
      value.includes("labor") ||
      value.includes("worker") ||
      value.includes("technician") ||
      value.includes("engineer") ||
      value.includes("electrician") ||
      value.includes("plumber") ||
      value.includes("crew")
    );
  }

  

  private formatDate(date: Date) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }
}