"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanningService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let PlanningService = class PlanningService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateMilestoneProgress(milestones) {
        if (!milestones?.length)
            return 0;
        const completed = milestones.filter((m) => m.actualDate !== null).length;
        return Math.round((completed / milestones.length) * 100);
    }
    async summary(projectId) {
        const [project, totalActivities, totalMilestones, criticalActivities, delayedActivities, negativeFloat, resourceShortages, milestones,] = await Promise.all([
            this.prisma.project.findUnique({
                where: { id: projectId },
            }),
            this.prisma.planningActivity.count({
                where: { projectId },
            }),
            this.prisma.planningMilestone.count({
                where: { projectId },
            }),
            this.prisma.planningActivity.count({
                where: {
                    projectId,
                    isCritical: true,
                },
            }),
            this.prisma.planningActivity.count({
                where: {
                    projectId,
                    healthStatus: {
                        in: [client_1.HealthStatus.DELAYED, client_1.HealthStatus.CRITICAL],
                    },
                },
            }),
            this.prisma.planningActivity.count({
                where: {
                    projectId,
                    floatDays: { lt: 0 },
                },
            }),
            this.prisma.planningResource.count({
                where: {
                    projectId,
                    healthStatus: {
                        in: [
                            client_1.HealthStatus.AT_RISK,
                            client_1.HealthStatus.DELAYED,
                            client_1.HealthStatus.CRITICAL,
                        ],
                    },
                },
            }),
            this.prisma.planningMilestone.findMany({
                where: { projectId },
                select: {
                    actualDate: true,
                },
            }),
        ]);
        const milestoneProgress = this.calculateMilestoneProgress(milestones);
        return {
            project,
            totalActivities,
            totalMilestones,
            criticalActivities,
            delayedActivities,
            negativeFloat,
            resourceShortages,
            milestoneProgress,
        };
    }
    activities(projectId) {
        return this.prisma.planningActivity.findMany({
            where: { projectId },
            orderBy: [
                { plannedStart: 'asc' },
                { activityId: 'asc' },
            ],
            take: 500,
        });
    }
    milestones(projectId) {
        return this.prisma.planningMilestone.findMany({
            where: { projectId },
            orderBy: [{ baselineDate: 'asc' }],
        });
    }
    resources(projectId) {
        return this.prisma.planningResource.findMany({
            where: { projectId },
            orderBy: [{ requiredDate: 'asc' }],
        });
    }
    criticalPath(projectId) {
        return this.prisma.planningActivity.findMany({
            where: {
                projectId,
                OR: [
                    { isCritical: true },
                    { floatDays: { lte: 0 } },
                ],
            },
            orderBy: [
                { floatDays: 'asc' },
                { plannedStart: 'asc' },
            ],
        });
    }
    async drilldown(projectId) {
        const [summary, activities, milestones, resources, criticalPath,] = await Promise.all([
            this.summary(projectId),
            this.activities(projectId),
            this.milestones(projectId),
            this.resources(projectId),
            this.criticalPath(projectId),
        ]);
        return {
            summary,
            activities,
            milestones,
            resources,
            criticalPath,
        };
    }
};
exports.PlanningService = PlanningService;
exports.PlanningService = PlanningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlanningService);
//# sourceMappingURL=planning.service.js.map