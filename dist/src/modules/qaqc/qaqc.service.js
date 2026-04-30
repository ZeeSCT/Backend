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
exports.QaqcService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const dashboard_response_1 = require("../../common/dashboard/dashboard-response");
let QaqcService = class QaqcService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() { const [inspections, ncrs] = await Promise.all([this.prisma.inspection.findMany(), this.prisma.ncr.findMany()]); return { inspections, ncrs }; }
    async summary() { return { inspections: await this.prisma.inspection.count(), ncrs: await this.prisma.ncr.count() }; }
    async inspectionRegister() { const rows = await this.prisma.inspection.findMany({ include: { project: { select: { code: true, name: true } } }, orderBy: { scheduledAt: 'asc' } }); return (0, dashboard_response_1.screenResponse)('inspection-register', 'Inspection register', { kpis: { total: rows.length, scheduled: rows.filter(r => r.outcome === 'Scheduled' || !r.outcome).length }, table: rows }); }
    async ncrLog() { const rows = await this.prisma.ncr.findMany({ include: { project: { select: { code: true, name: true } } }, orderBy: { dateRaised: 'desc' } }); return (0, dashboard_response_1.screenResponse)('ncr-log', 'NCR log', { kpis: { total: rows.length, high: rows.filter(r => r.severity === 'High').length }, table: rows }); }
    async punchList() { const ncrs = await this.prisma.ncr.findMany({ include: { project: { select: { code: true, name: true } } }, orderBy: { dateRaised: 'desc' } }); const inspections = await this.prisma.inspection.findMany({ include: { project: { select: { code: true, name: true } } } }); return (0, dashboard_response_1.screenResponse)('punch-list', 'Punch list', { kpis: { openItems: ncrs.length + inspections.filter(i => i.outcome && i.outcome !== 'Passed').length }, items: [...ncrs.map(n => ({ type: 'NCR', ...n })), ...inspections.filter(i => i.outcome && i.outcome !== 'Passed').map(i => ({ type: 'Inspection', ...i }))] }); }
};
exports.QaqcService = QaqcService;
exports.QaqcService = QaqcService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QaqcService);
//# sourceMappingURL=qaqc.service.js.map