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
exports.ProjectHealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProjectHealthService = class ProjectHealthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateMilestoneStatus(m) {
        const today = new Date();
        if (m.actualDate) {
            return client_1.HealthStatus.ON_TRACK;
        }
        if (m.forecastDate && m.forecastDate < today) {
            if (m.delayDays > 7)
                return client_1.HealthStatus.CRITICAL;
            return client_1.HealthStatus.DELAYED;
        }
        if (m.forecastDate) {
            const diff = (new Date(m.forecastDate).getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24);
            if (diff <= 7)
                return client_1.HealthStatus.AT_RISK;
        }
        return client_1.HealthStatus.ON_TRACK;
    }
    async getHealthSummary() {
        const milestones = await this.prisma.planningMilestone.findMany();
        const summary = {
            onTrack: 0,
            atRisk: 0,
            delayed: 0,
            critical: 0,
        };
        for (const m of milestones) {
            const status = this.calculateMilestoneStatus(m);
            if (status === client_1.HealthStatus.ON_TRACK)
                summary.onTrack++;
            if (status === client_1.HealthStatus.AT_RISK)
                summary.atRisk++;
            if (status === client_1.HealthStatus.DELAYED)
                summary.delayed++;
            if (status === client_1.HealthStatus.CRITICAL)
                summary.critical++;
        }
        const total = milestones.length || 1;
        return {
            ...summary,
            onTrackPct: `${Math.round((summary.onTrack / total) * 100)}%`,
            atRiskPct: `${Math.round((summary.atRisk / total) * 100)}%`,
            delayedPct: `${Math.round((summary.delayed / total) * 100)}%`,
            criticalNote: summary.critical > 0 ? 'Immediate action required' : 'Stable',
        };
    }
    async getDelayedMilestones() {
        const milestones = await this.prisma.planningMilestone.findMany({
            include: { project: true },
        });
        const grouped = {};
        for (const m of milestones) {
            const status = this.calculateMilestoneStatus(m);
            if (status !== client_1.HealthStatus.DELAYED && status !== client_1.HealthStatus.CRITICAL)
                continue;
            const key = m.projectId;
            if (!grouped[key]) {
                grouped[key] = {
                    projectId: m.projectId,
                    projectName: m.project.name,
                    count: 0,
                };
            }
            grouped[key].count++;
        }
        return Object.values(grouped).map((g) => ({
            ...g,
            percent: Math.min(g.count * 20, 100),
        }));
    }
    async getBlockedItems() {
        const ncrs = await this.prisma.ncr.findMany({
            include: { project: true },
        });
        return ncrs.map((n) => ({
            projectId: n.projectId,
            projectName: n.project.name,
            message: `${n.packageName || 'Package'} — ${n.description}`,
        }));
    }
    async getHealthTrend() {
        const milestones = await this.prisma.planningMilestone.findMany();
        const weeks = [1, 2, 3, 4];
        return weeks.map((w) => {
            const slice = milestones.slice(0, w * 5);
            let onTrack = 0, atRisk = 0, delayed = 0, critical = 0;
            for (const m of slice) {
                const status = this.calculateMilestoneStatus(m);
                if (status === client_1.HealthStatus.ON_TRACK)
                    onTrack++;
                if (status === client_1.HealthStatus.AT_RISK)
                    atRisk++;
                if (status === client_1.HealthStatus.DELAYED)
                    delayed++;
                if (status === client_1.HealthStatus.CRITICAL)
                    critical++;
            }
            return {
                week: `Week ${w}`,
                onTrack,
                atRisk,
                delayed,
                critical,
            };
        });
    }
};
exports.ProjectHealthService = ProjectHealthService;
exports.ProjectHealthService = ProjectHealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectHealthService);
//# sourceMappingURL=project-health.service.js.map