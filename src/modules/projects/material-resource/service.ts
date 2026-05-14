import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { RecordStatus } from "@prisma/client";

type MaterialFilter = "all" | "shortages" | "pending";
const RESOURCE_CATEGORY = {
  MATERIAL: "material",
  LABOUR: "labour",
} as const;

const MATERIAL_STATUS = {
  SHORTAGE: "shortage",
} as const;

const DELIVERY_STATUS = {
  DELIVERED: "delivered",
  PENDING: "pending",
} as const;

@Injectable()
export class MaterialResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjects(category: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        status: RecordStatus.ACTIVE,
        resources: {
          some: {},
        },
        ...(category !== "all"
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
          include: {
            resourceCategory: true,
            materialStatus: true,
            labourStatus: true,
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
        (resource) =>
          resource.resourceCategoryCode === RESOURCE_CATEGORY.MATERIAL,
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
          (row) => row.deliveryStatusCode === DELIVERY_STATUS.PENDING,
        ).length,
      };
    });
  }

  async getSummary(projectId: string) {
    this.validateProjectId(projectId);

    const resources = await this.prisma.planningResource.findMany({
      where: { projectId },
    });

    const materialResources = resources.filter(
      (row) => row.resourceCategoryCode === RESOURCE_CATEGORY.MATERIAL,
    );

    const labourResources = resources.filter(
      (row) => row.resourceCategoryCode === RESOURCE_CATEGORY.LABOUR,
    );

    return {
      materialsOnSite: materialResources.reduce(
        (sum, row) => sum + row.availableQty,
        0,
      ),
      shortages: materialResources.filter(
        (row) => row.materialStatusCode === MATERIAL_STATUS.SHORTAGE,
      ).length,
      pendingDelivery: materialResources.filter(
        (row) => row.deliveryStatusCode === DELIVERY_STATUS.PENDING,
      ).length,
      labourOnSite: labourResources.reduce(
        (sum, row) => sum + row.availableQty,
        0,
      ),
      plannedLabour: labourResources.reduce(
        (sum, row) => sum + row.plannedQty,
        0,
      ),
    };
  }

  async getMaterials(projectId: string, filter: MaterialFilter) {
    this.validateProjectId(projectId);

    const where: {
      projectId: string;
      resourceCategoryCode: string;
      materialStatusCode?: string;
      deliveryStatusCode?: string;
    } = {
      projectId,
      resourceCategoryCode: RESOURCE_CATEGORY.MATERIAL,
    };

    if (filter === "shortages") {
      where.materialStatusCode = MATERIAL_STATUS.SHORTAGE;
    }

    if (filter === "pending") {
      where.deliveryStatusCode = DELIVERY_STATUS.PENDING;
    }

    const rows = await this.prisma.planningResource.findMany({
      where,
      include: {
        materialStatus: true,
        deliveryStatus: true,
      },
      orderBy: {
        requiredDate: "asc",
      },
    });

    return rows.map((row) => {
      const shortQty = Math.max(row.plannedQty - row.availableQty, 0);

      return {
        id: row.id,
        projectId: row.projectId,
        material: row.resourceName ?? row.resourceRole,
        packageName: row.resourceRole,
        requiredQty: String(row.plannedQty),
        onSite: String(row.availableQty),
        short: shortQty > 0 ? String(shortQty) : "—",
        expectedDelivery:
          row.deliveryStatusCode === DELIVERY_STATUS.DELIVERED
            ? row.deliveryStatus.label
            : row.requiredDate
              ? this.formatDate(row.requiredDate)
              : row.deliveryStatus.label,
        status: row.materialStatus?.label ?? "",
      };
    });
  }

  async getLabour(projectId: string) {
    this.validateProjectId(projectId);

    const rows = await this.prisma.planningResource.findMany({
      where: {
        projectId,
        resourceCategoryCode: RESOURCE_CATEGORY.LABOUR,
      },
      include: {
        labourStatus: true,
      },
      orderBy: {
        resourceRole: "asc",
      },
    });

    return rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      trade: row.resourceName ?? row.resourceRole,
      plannedHeadcount: row.plannedQty,
      onSiteToday: row.availableQty,
      status: row.labourStatus?.label ?? "",
    }));
  }

  private validateProjectId(projectId?: string) {
    if (!projectId) {
      throw new BadRequestException("projectId is required");
    }
  }

  private formatDate(date: Date) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }
}

  

