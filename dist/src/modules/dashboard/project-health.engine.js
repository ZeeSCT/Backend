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
exports.ProjectHealthEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProjectHealthEngine = class ProjectHealthEngine {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recalculateProjectHealth(projectId) {
        const milestones = await this.prisma.planningMilestone.findMany({
            where: { projectId },
        });
        const total = milestones.length || 1;
        const completed = milestones.filter(m => m.actualDate !== null).length;
        const delayed = milestones.filter(m => m.delayDays > 0).length;
        const critical = milestones.filter(m => m.delayDays > 7).length;
        const completionPct = Math.round((completed / total) * 100);
        let status = client_1.HealthStatus.ON_TRACK;
        if (critical > 0 || completionPct < 40) {
            status = client_1.HealthStatus.CRITICAL;
        }
        else if (delayed > total * 0.3 || completionPct < 70) {
            status = client_1.HealthStatus.DELAYED;
        }
        else if (delayed > 0) {
            status = client_1.HealthStatus.AT_RISK;
        }
        await this.prisma.project.update({
            where: { id: projectId },
            data: {
                healthStatus: status,
            },
        });
        return {
            projectId,
            status,
            completionPct,
            delayed,
            critical,
        };
    }
};
exports.ProjectHealthEngine = ProjectHealthEngine;
exports.ProjectHealthEngine = ProjectHealthEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectHealthEngine);
//# sourceMappingURL=project-health.engine.js.map