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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const HEALTH_RULES = {
    CRITICAL_DELAY_DAYS: 10,
    DELAY_THRESHOLD_PERCENT: 30,
    AT_RISK_COMPLETION: 80,
    DELAYED_COMPLETION: 50,
};
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    isBadResourceStatus(status) {
        return (status === client_1.HealthStatus.AT_RISK ||
            status === client_1.HealthStatus.DELAYED ||
            status === client_1.HealthStatus.CRITICAL);
    }
    isBadMilestoneStatus(status) {
        return (status === client_1.HealthStatus.DELAYED ||
            status === client_1.HealthStatus.CRITICAL);
    }
    calculateMilestoneMetrics(milestones) {
        const total = milestones?.length || 0;
        if (total === 0) {
            return {
                completionPct: 0,
                delayed: 0,
                critical: 0,
                healthStatus: client_1.HealthStatus.ON_TRACK,
            };
        }
        const completed = milestones.filter((m) => m.actualDate !== null).length;
        const delayed = milestones.filter((m) => m.delayDays > 0).length;
        const critical = milestones.filter((m) => m.healthStatus === client_1.HealthStatus.CRITICAL ||
            m.delayDays > HEALTH_RULES.CRITICAL_DELAY_DAYS).length;
        const completionPct = Math.round((completed / total) * 100);
        let healthStatus = client_1.HealthStatus.ON_TRACK;
        if (critical > 0) {
            healthStatus = client_1.HealthStatus.CRITICAL;
        }
        else if (completionPct < HEALTH_RULES.DELAYED_COMPLETION ||
            delayed > total * HEALTH_RULES.DELAY_THRESHOLD_PERCENT / 100) {
            healthStatus = client_1.HealthStatus.DELAYED;
        }
        else if (completionPct < HEALTH_RULES.AT_RISK_COMPLETION ||
            delayed > 0) {
            healthStatus = client_1.HealthStatus.AT_RISK;
        }
        return {
            completionPct,
            delayed,
            critical,
            healthStatus,
        };
    }
    async executive() {
        const [activeProjects, delayedMilestones, pendingApprovals, criticalActivities, openNcrs, materialShortages, tenders,] = await Promise.all([
            this.prisma.project.count({ where: { status: 'ACTIVE' } }),
            this.prisma.planningMilestone.count({
                where: {
                    healthStatus: {
                        in: [client_1.HealthStatus.DELAYED, client_1.HealthStatus.CRITICAL],
                    },
                },
            }),
            this.prisma.tender.count({
                where: { stage: 'APPROVAL_PENDING' },
            }),
            this.prisma.planningActivity.count({
                where: { isCritical: true },
            }),
            this.prisma.ncr.count(),
            this.prisma.planningResource.count({
                where: {
                    healthStatus: {
                        in: [
                            client_1.HealthStatus.AT_RISK,
                            client_1.HealthStatus.DELAYED,
                            client_1.HealthStatus.CRITICAL,
                        ],
                    },
                },
            }),
            this.prisma.tender.count(),
        ]);
        const projects = await this.prisma.project.findMany({
            take: 6,
            orderBy: { createdAt: 'desc' },
            include: {
                projectManager: { select: { name: true } },
                milestones: true,
            },
        });
        const enrichedProjects = projects.map((p) => {
            const metrics = this.calculateMilestoneMetrics(p.milestones);
            return {
                ...p,
                progress: metrics.completionPct,
                healthStatus: metrics.healthStatus,
            };
        });
        return {
            kpis: {
                activeProjects,
                portfolioCompletion: 0,
                delayedMilestones,
                pendingApprovals,
                criticalActivities,
                openNcrs,
                materialShortages,
                tenders,
            },
            projects: enrichedProjects,
        };
    }
    async planningPortfolio() {
        const projects = await this.prisma.project.findMany({
            include: {
                activities: true,
                milestones: true,
                resources: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return projects.map((p) => {
            const metrics = this.calculateMilestoneMetrics(p.milestones);
            return {
                id: p.id,
                code: p.code,
                name: p.name,
                clientName: p.clientName,
                healthStatus: metrics.healthStatus,
                progress: metrics.completionPct,
                totalActivities: p.activities.length,
                criticalActivities: p.activities.filter((a) => a.isCritical).length,
                delayedMilestones: p.milestones.filter((m) => this.isBadMilestoneStatus(m.healthStatus)).length,
                resourceShortages: p.resources.filter((r) => this.isBadResourceStatus(r.healthStatus)).length,
            };
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map