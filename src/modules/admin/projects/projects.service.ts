import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { RecordStatus } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project.findMany({
      where: {
        status: {
          not: RecordStatus.ARCHIVED,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        portfolioCategory: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async findByCode(code: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        code,
      },
      include: {
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        portfolioCategory: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with code "${code}" not found.`);
    }

    return project;
  }

  async create(dto: CreateProjectDto) {
    const code = dto.code.trim().toUpperCase();

    const existingProject = await this.prisma.project.findUnique({
      where: {
        code,
      },
      select: {
        id: true,
      },
    });

    if (existingProject) {
      throw new ConflictException(`Project code "${code}" already exists.`);
    }

    if (dto.projectManagerId) {
      const manager = await this.prisma.user.findUnique({
        where: {
          id: dto.projectManagerId,
        },
        select: {
          id: true,
        },
      });

      if (!manager) {
        throw new BadRequestException(
          "Selected project manager was not found.",
        );
      }
    }

    return this.prisma.project.create({
      data: {
        code,
        name: dto.name.trim(),
        clientName: dto.clientName.trim(),
        portfolio: dto.portfolio.trim().toLowerCase(),
        projectManagerId: dto.projectManagerId || null,
        completionPct: dto.completionPct ?? 0,
        plannedProgress: dto.plannedProgress ?? 0,
        actualProgress: dto.actualProgress ?? 0,
        status: RecordStatus.ACTIVE,
      },
      include: {
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        portfolioCategory: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async getProjectManagers() {
    return this.prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          in: ["PROJECT_MANAGER", "ADMIN", "SUPER_ADMIN"],
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async deleteProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project "${id}" not found.`);
    }

    /**
     * Safer than hard delete.
     * This keeps schedule uploads, WBS, activities, billing, etc. from being deleted.
     */
    await this.prisma.project.update({
      where: {
        id,
      },
      data: {
        status: RecordStatus.ARCHIVED,
      },
    });

    return {
      success: true,
      message: "Project archived successfully.",
      id: project.id,
      code: project.code,
      name: project.name,
    };
  }
}
