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
exports.ExecutiveService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const dashboard_response_1 = require("../../common/dashboard/dashboard-response");
let ExecutiveService = class ExecutiveService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async portfolioOverview() {
        const [activeProjects, projects, healthGroups, pendingApprovals, delayedMilestones, billingReady] = await Promise.all([
            this.prisma.project.count({ where: { status: 'ACTIVE' } }),
            this.prisma.project.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { projectManager: { select: { id: true, name: true } }, _count: { select: { milestones: true, activities: true, ncrs: true } } } }),
            this.prisma.project.groupBy({ by: ['healthStatus'], _count: { healthStatus: true } }),
            this.prisma.tender.count({ where: { stage: 'APPROVAL_PENDING' } }),
            this.prisma.planningMilestone.count({ where: { healthStatus: { in: [client_1.HealthStatus.DELAYED, client_1.HealthStatus.CRITICAL] } } }),
            this.prisma.project.aggregate({ _sum: { contractValue: true }, where: { healthStatus: { in: [client_1.HealthStatus.ON_TRACK, client_1.HealthStatus.AT_RISK] } } }),
        ]);
        const avg = projects.length ? Math.round(projects.reduce((s, p) => s + p.completionPct, 0) / projects.length) : 0;
        return (0, dashboard_response_1.screenResponse)('portfolio-overview', 'Portfolio overview', { kpis: { activeProjects, portfolioCompletion: avg, delayedMilestones, pendingApprovals, billingReady: billingReady._sum.contractValue ?? 0 }, charts: { healthStatus: (0, dashboard_response_1.enumCountRows)(healthGroups, 'healthStatus') }, table: projects });
    }
    async projectHealth() {
        const [projects, issues, ncrs] = await Promise.all([
            this.prisma.project.findMany({ orderBy: [{ healthStatus: 'asc' }, { updatedAt: 'desc' }], include: { projectManager: { select: { name: true } } } }),
            this.prisma.planningActivity.findMany({ where: { healthStatus: { in: [client_1.HealthStatus.AT_RISK, client_1.HealthStatus.DELAYED, client_1.HealthStatus.CRITICAL] } }, take: 20, orderBy: { updatedAt: 'desc' } }),
            this.prisma.ncr.findMany({ take: 10, orderBy: { dateRaised: 'desc' } }),
        ]);
        return (0, dashboard_response_1.screenResponse)('project-health', 'Project health', { kpis: { totalProjects: projects.length, critical: projects.filter(p => p.healthStatus === 'CRITICAL').length, delayed: projects.filter(p => p.healthStatus === 'DELAYED').length, openNcrs: ncrs.length }, table: projects, issues, ncrs });
    }
    async revenueBilling() {
        const projects = await this.prisma.project.findMany({ orderBy: { contractValue: 'desc' }, include: { projectManager: { select: { name: true } } } });
        const totalContractValue = projects.reduce((s, p) => s + Number(p.contractValue ?? 0), 0);
        const earnedValue = projects.reduce((s, p) => s + (Number(p.contractValue ?? 0) * (p.completionPct ?? 0) / 100), 0);
        return (0, dashboard_response_1.screenResponse)('revenue-billing', 'Revenue & billing', { kpis: { totalContractValue, earnedValue, billingReadyEstimate: earnedValue * 0.35, projects: projects.length }, table: projects.map(p => ({ ...p, earnedValue: Number(p.contractValue ?? 0) * (p.completionPct ?? 0) / 100 })) });
    }
    async approvalBottlenecks() {
        const [tenders, milestones, activities] = await Promise.all([
            this.prisma.tender.findMany({ where: { stage: 'APPROVAL_PENDING' }, orderBy: { updatedAt: 'asc' } }),
            this.prisma.planningMilestone.findMany({ where: { healthStatus: { in: [client_1.HealthStatus.AT_RISK, client_1.HealthStatus.DELAYED, client_1.HealthStatus.CRITICAL] } }, include: { project: { select: { code: true, name: true } } } }),
            this.prisma.planningActivity.findMany({ where: { healthStatus: { in: [client_1.HealthStatus.AT_RISK, client_1.HealthStatus.DELAYED, client_1.HealthStatus.CRITICAL] } }, take: 20, include: { project: { select: { code: true, name: true } } } }),
        ]);
        return (0, dashboard_response_1.screenResponse)('approval-bottlenecks', 'Approval bottlenecks', { kpis: { pendingTenderApprovals: tenders.length, delayedMilestones: milestones.length, blockedActivities: activities.length }, tenders, milestones, activities });
    }
    async documentationStatus() {
        const [documents, projects] = await Promise.all([
            this.prisma.planningDocument.findMany({ orderBy: { uploadedAt: 'desc' } }),
            this.prisma.project.findMany({ select: { id: true, code: true, name: true, healthStatus: true } }),
        ]);
        return (0, dashboard_response_1.screenResponse)('documentation-status', 'Documentation status', { kpis: { uploadedDocuments: documents.length, activeProjects: projects.length, missingBaseline: Math.max(projects.length - documents.length, 0) }, documents, projects });
    }
    async projectDrillDown(projectId) {
        const selected = projectId || (await this.prisma.project.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true } }))?.id;
        const project = selected ? await this.prisma.project.findUnique({ where: { id: selected }, include: { projectManager: { select: { name: true, email: true } }, activities: true, milestones: true, resources: true, inspections: true, ncrs: true, materialRequests: true, purchaseOrders: true, assets: true } }) : null;
        return (0, dashboard_response_1.screenResponse)('project-drill-down', 'Project drill-down', { project });
    }
};
exports.ExecutiveService = ExecutiveService;
exports.ExecutiveService = ExecutiveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExecutiveService);
//# sourceMappingURL=executive.service.js.map