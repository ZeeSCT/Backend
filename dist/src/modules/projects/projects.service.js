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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const dashboard_response_1 = require("../../common/dashboard/dashboard-response");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateMilestoneProgress(milestones) {
        if (!milestones?.length)
            return 0;
        const completed = milestones.filter((m) => m.actualDate !== null).length;
        return Math.round((completed / milestones.length) * 100);
    }
    calculateProjectHealth(milestones) {
        const total = milestones?.length || 0;
        if (total === 0) {
            return client_1.HealthStatus.ON_TRACK;
        }
        const completed = milestones.filter((m) => m.actualDate !== null).length;
        const delayed = milestones.filter((m) => m.delayDays > 0).length;
        const critical = milestones.filter((m) => m.healthStatus === client_1.HealthStatus.CRITICAL ||
            m.delayDays > 10).length;
        const completionPct = Math.round((completed / total) * 100);
        if (critical > 0) {
            return client_1.HealthStatus.CRITICAL;
        }
        if (completionPct < 50 ||
            delayed > total * 0.3) {
            return client_1.HealthStatus.DELAYED;
        }
        if (completionPct < 80 ||
            delayed > 0) {
            return client_1.HealthStatus.AT_RISK;
        }
        return client_1.HealthStatus.ON_TRACK;
    }
    async findAll() {
        const projects = await this.prisma.project.findMany({
            include: {
                projectManager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                milestones: true,
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
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return projects.map((project) => {
            const progress = this.calculateMilestoneProgress(project.milestones);
            const healthStatus = this.calculateProjectHealth(project.milestones);
            return {
                ...project,
                progress,
                healthStatus,
            };
        });
    }
    async findOne(id) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                activities: true,
                milestones: true,
                resources: true,
                inspections: true,
                ncrs: true,
                materialRequests: true,
                purchaseOrders: true,
                assets: true,
                projectManager: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!project)
            return null;
        const progress = this.calculateMilestoneProgress(project.milestones);
        const healthStatus = this.calculateProjectHealth(project.milestones);
        return {
            ...project,
            progress,
            healthStatus,
        };
    }
    async firstProjectId(projectId) {
        return (projectId ||
            (await this.prisma.project.findFirst({
                select: { id: true },
                orderBy: { createdAt: 'desc' },
            }))?.id);
    }
    async projectWorkspace(projectId) {
        const id = await this.firstProjectId(projectId);
        const project = id
            ? await this.findOne(id)
            : null;
        return (0, dashboard_response_1.screenResponse)('project-workspace', 'Project workspace', { project });
    }
    async milestoneTracker() {
        const rows = await this.prisma.planningMilestone.findMany({
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                baselineDate: 'asc',
            },
        });
        return (0, dashboard_response_1.screenResponse)('milestone-tracker', 'Milestone tracker', {
            kpis: {
                total: rows.length,
                delayed: rows.filter((r) => r.delayDays > 0).length,
                critical: rows.filter((r) => r.healthStatus ===
                    client_1.HealthStatus.CRITICAL).length,
            },
            table: rows,
        });
    }
    async workPackageTracker() {
        const rows = await this.prisma.planningActivity.findMany({
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                { wbsCode: 'asc' },
                { plannedStart: 'asc' },
            ],
        });
        return (0, dashboard_response_1.screenResponse)('work-package-tracker', 'Work package tracker', {
            kpis: {
                packages: new Set(rows.map((r) => r.wbsCode)).size,
                activities: rows.length,
                critical: rows.filter((r) => r.isCritical).length,
            },
            table: rows,
        });
    }
    async siteProgressView() {
        const rows = await this.findAll();
        return (0, dashboard_response_1.screenResponse)('site-progress-view', 'Site progress view', {
            kpis: {
                projects: rows.length,
                avgProgress: avg(rows.map((r) => r.progress || 0)),
            },
            table: rows.map((p) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                progress: p.progress,
                healthStatus: p.healthStatus,
            })),
        });
    }
    async taskAssignmentBoard() {
        const rows = await this.prisma.planningActivity.findMany({
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: 100,
        });
        return (0, dashboard_response_1.screenResponse)('task-assignment-board', 'Task & assignment board', {
            kpis: {
                tasks: rows.length,
                open: rows.filter((r) => !r.actualFinish).length,
                delayed: rows.filter((r) => r.healthStatus ===
                    client_1.HealthStatus.DELAYED ||
                    r.healthStatus ===
                        client_1.HealthStatus.CRITICAL).length,
            },
            table: rows,
        });
    }
    async riskIssueBlocker() {
        const [activities, ncrs, resources] = await Promise.all([
            this.prisma.planningActivity.findMany({
                where: {
                    healthStatus: {
                        in: [
                            client_1.HealthStatus.AT_RISK,
                            client_1.HealthStatus.DELAYED,
                            client_1.HealthStatus.CRITICAL,
                        ],
                    },
                },
                include: {
                    project: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.ncr.findMany({
                include: {
                    project: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.planningResource.findMany({
                where: {
                    healthStatus: {
                        in: [
                            client_1.HealthStatus.AT_RISK,
                            client_1.HealthStatus.DELAYED,
                            client_1.HealthStatus.CRITICAL,
                        ],
                    },
                },
                include: {
                    project: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                },
            }),
        ]);
        return (0, dashboard_response_1.screenResponse)('risk-issue-blocker', 'Risk / issue / blocker', {
            kpis: {
                issues: activities.length,
                ncrs: ncrs.length,
                resourceShortages: resources.length,
            },
            activities,
            ncrs,
            resources,
        });
    }
    async documentReadiness() {
        const docs = await this.prisma.planningDocument.findMany({
            orderBy: {
                uploadedAt: 'desc',
            },
        });
        const projects = await this.findAll();
        return (0, dashboard_response_1.screenResponse)('document-readiness', 'Document readiness', {
            kpis: {
                documents: docs.length,
                projects: projects.length,
                missing: Math.max(projects.length - docs.length, 0),
            },
            documents: docs,
            projects,
        });
    }
    async approvalFollowUp() {
        const milestones = await this.prisma.planningMilestone.findMany({
            where: {
                healthStatus: {
                    in: [
                        client_1.HealthStatus.AT_RISK,
                        client_1.HealthStatus.DELAYED,
                        client_1.HealthStatus.CRITICAL,
                    ],
                },
            },
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
        });
        return (0, dashboard_response_1.screenResponse)('approval-follow-up', 'Approval follow-up', {
            kpis: {
                pending: milestones.length,
                delayed: milestones.filter((m) => m.delayDays > 0).length,
            },
            table: milestones,
        });
    }
    async inspectionFollowUp() {
        const inspections = await this.prisma.inspection.findMany({
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });
        return (0, dashboard_response_1.screenResponse)('inspection-follow-up', 'Inspection follow-up', {
            kpis: {
                inspections: inspections.length,
                pending: inspections.filter((i) => !i.outcome ||
                    i.outcome === 'Scheduled').length,
            },
            table: inspections,
        });
    }
    async materialResource() {
        const [mrs, pos, resources] = await Promise.all([
            this.prisma.materialRequest.findMany({
                include: {
                    project: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.purchaseOrder.findMany({
                include: {
                    project: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.planningResource.findMany({
                include: {
                    project: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                },
            }),
        ]);
        return (0, dashboard_response_1.screenResponse)('material-resource', 'Material & resource', {
            kpis: {
                materialRequests: mrs.length,
                purchaseOrders: pos.length,
                resourceRows: resources.length,
                shortages: resources.filter((r) => r.availableQty < r.plannedQty).length,
            },
            materialRequests: mrs,
            purchaseOrders: pos,
            resources,
        });
    }
    async commercialProgress() {
        const projects = await this.findAll();
        return (0, dashboard_response_1.screenResponse)('commercial-progress', 'Commercial progress', {
            kpis: {
                contractValue: projects.reduce((s, p) => s + Number(p.contractValue ?? 0), 0),
                earnedValue: projects.reduce((s, p) => s +
                    (Number(p.contractValue ?? 0) *
                        p.progress) /
                        100, 0),
            },
            table: projects.map((p) => ({
                ...p,
                earnedValue: (Number(p.contractValue ?? 0) *
                    p.progress) /
                    100,
            })),
        });
    }
    async planningOverview() {
        const rows = await this.findAll();
        return (0, dashboard_response_1.screenResponse)('planning-overview', 'Planning overview', {
            kpis: {
                projects: rows.length,
                avgProgress: avg(rows.map((r) => r.progress || 0)),
            },
            table: rows,
        });
    }
    async wbsTimeline() {
        const rows = await this.prisma.planningActivity.findMany({
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: [{ plannedStart: 'asc' }],
        });
        return (0, dashboard_response_1.screenResponse)('wbs-timeline', 'WBS timeline', {
            kpis: {
                activities: rows.length,
                wbs: new Set(rows.map((r) => r.wbsCode)).size,
            },
            timeline: rows,
        });
    }
    async milestoneRegister() {
        const rows = await this.prisma.planningMilestone.findMany({
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                baselineDate: 'asc',
            },
        });
        return (0, dashboard_response_1.screenResponse)('milestone-register', 'Milestone register', {
            kpis: {
                milestones: rows.length,
                delayed: rows.filter((r) => r.delayDays > 0).length,
            },
            table: rows,
        });
    }
    async activityRegister() {
        const rows = await this.prisma.planningActivity.findMany({
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: [{ activityId: 'asc' }],
            take: 500,
        });
        return (0, dashboard_response_1.screenResponse)('activity-register', 'Activity register', {
            kpis: {
                activities: rows.length,
                complete: rows.filter((r) => r.percentComplete === 100).length,
                critical: rows.filter((r) => r.isCritical).length,
            },
            table: rows,
        });
    }
    async criticalFloatView() {
        const rows = await this.prisma.planningActivity.findMany({
            where: {
                OR: [
                    { isCritical: true },
                    { floatDays: { lte: 0 } },
                ],
            },
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                { floatDays: 'asc' },
                { plannedStart: 'asc' },
            ],
        });
        return (0, dashboard_response_1.screenResponse)('critical-float-view', 'Critical / float view', {
            kpis: {
                critical: rows.filter((r) => r.isCritical).length,
                negativeFloat: rows.filter((r) => (r.floatDays ?? 0) < 0).length,
            },
            table: rows,
        });
    }
    async resourcePlan() {
        const rows = await this.prisma.planningResource.findMany({
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                requiredDate: 'asc',
            },
        });
        return (0, dashboard_response_1.screenResponse)('resource-plan', 'Resource plan', {
            kpis: {
                resources: rows.length,
                shortages: rows.filter((r) => r.availableQty < r.plannedQty).length,
                plannedQty: rows.reduce((s, r) => s + r.plannedQty, 0),
                availableQty: rows.reduce((s, r) => s + r.availableQty, 0),
            },
            table: rows,
        });
    }
    async monthlyLookahead() {
        const rows = await this.prisma.planningActivity.findMany({
            where: {
                actualFinish: null,
            },
            include: {
                project: {
                    select: {
                        code: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                plannedStart: 'asc',
            },
            take: 100,
        });
        return (0, dashboard_response_1.screenResponse)('monthly-lookahead', 'Monthly lookahead', {
            kpis: {
                upcoming: rows.length,
                critical: rows.filter((r) => r.isCritical).length,
            },
            table: rows,
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
function avg(values) {
    return values.length
        ? Math.round(values.reduce((a, b) => a + b, 0) /
            values.length)
        : 0;
}
//# sourceMappingURL=projects.service.js.map