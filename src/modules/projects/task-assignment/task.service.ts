import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { ActivityStatus, Prisma, RecordStatus } from "@prisma/client";

export enum TaskBoardFilter {
  ALL = "all",
  OVERDUE = "overdue",
  BLOCKED = "blocked",
}

@Injectable()
export class TaskAssignmentBoardService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjects(category = TaskBoardFilter.ALL) {
    const where: Prisma.ProjectWhereInput = {
      status: RecordStatus.ACTIVE,
    };

    if (category && category !== TaskBoardFilter.ALL) {
      where.OR = [
        { portfolio: category },
        { portfolioCategory: { code: category } },
      ];
    }

    const projects = await this.prisma.project.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        portfolio: true,
        portfolioCategory: {
          select: {
            code: true,
          },
        },
        _count: {
          select: {
            scheduleActivities: true,
          },
        },
      },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      portfolioCategory: project.portfolioCategory?.code ?? project.portfolio,
      taskCount: project._count.scheduleActivities,
      hasTaskData: project._count.scheduleActivities > 0,
    }));
  }

  async getSummary(projectId: string, filter: TaskBoardFilter, search: string) {
    if (!projectId) {
      throw new BadRequestException("projectId is required");
    }

    const baseWhere = this.buildTaskWhere(projectId, filter, search);
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      blockedTasks,
    ] = await this.prisma.$transaction([
      this.prisma.scheduleActivity.count({
        where: baseWhere,
      }),
      this.prisma.scheduleActivity.count({
        where: {
          ...baseWhere,
          status: ActivityStatus.COMPLETED,
        },
      }),
      this.prisma.scheduleActivity.count({
        where: {
          ...baseWhere,
          status: ActivityStatus.IN_PROGRESS,
        },
      }),
      this.prisma.scheduleActivity.count({
        where: {
          ...baseWhere,
          status: ActivityStatus.DELAYED,
        },
      }),
      this.prisma.scheduleActivity.count({
        where: {
          ...baseWhere,
          status: ActivityStatus.BLOCKED,
        },
      }),
    ]);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      blockedTasks,
    };
  }

  async getTasks(projectId: string, filter: TaskBoardFilter, search: string) {
    if (!projectId) {
      throw new BadRequestException("projectId is required");
    }

    const where = this.buildTaskWhere(projectId, filter, search);

    const tasks = await this.prisma.scheduleActivity.findMany({
      where,
      orderBy: [{ finishDate: "asc" }, { activityName: "asc" }],
      include: {
        statusUpdates: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
        resourceAssignments: {
          include: {
            resource: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return tasks.map((task) => this.normalizeTask(task));
  }

  private buildTaskWhere(
    projectId: string,
    filter: TaskBoardFilter,
    search: string,
  ): Prisma.ScheduleActivityWhereInput {
    const where: Prisma.ScheduleActivityWhereInput = {
      projectId,
      isMilestone: false,
    };

    switch (filter) {
      case TaskBoardFilter.OVERDUE:
        where.status = ActivityStatus.DELAYED;
        break;

      case TaskBoardFilter.BLOCKED:
        where.status = ActivityStatus.BLOCKED;
        break;

      case TaskBoardFilter.ALL:
      default:
        break;
    }

    if (search?.trim()) {
      const q = search.trim();

      where.OR = [
        { activityName: { contains: q, mode: "insensitive" } },
        { activityCode: { contains: q, mode: "insensitive" } },
        {
          resourceAssignments: {
            some: {
              resource: {
                name: { contains: q, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    return where;
  }

  private normalizeTask(task: any) {
    const latestProgress = task.statusUpdates?.[0];
    const firstAssignment = task.resourceAssignments?.[0];
    const resource = firstAssignment?.resource;

    return {
      id: task.id,
      projectId: task.projectId,
      task: task.activityName,
      assignee: resource?.name ?? null,
      assigneeInitials: resource?.name ? this.getInitials(resource.name) : null,
      dueDate: firstAssignment?.plannedFinish ?? task.finishDate ?? null,
      progress: latestProgress?.progressPercentage ?? null,
      status: latestProgress?.status ?? task.status,
      progressColorClass: latestProgress?.progressColorClass ?? null,
      statusBadgeClass: latestProgress?.statusBadgeClass ?? null,
    };
  }
  private getInitials(name: string) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
}
