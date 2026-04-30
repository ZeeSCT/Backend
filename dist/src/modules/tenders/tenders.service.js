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
exports.TendersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const dashboard_response_1 = require("../../common/dashboard/dashboard-response");
let TendersService = class TendersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() { return this.prisma.tender.findMany({ orderBy: { createdAt: 'desc' }, include: { project: { select: { id: true, code: true, name: true } } } }); }
    pipelineSummary() { return this.prisma.tender.groupBy({ by: ['stage'], _count: { stage: true } }); }
    async base() { const tenders = await this.findAll(); const stageGroups = await this.pipelineSummary(); return { tenders, stageGroups: (0, dashboard_response_1.enumCountRows)(stageGroups, 'stage') }; }
    async tenderPipeline() { const base = await this.base(); return (0, dashboard_response_1.screenResponse)('tender-pipeline', 'Tender pipeline', { kpis: { total: base.tenders.length, submitted: base.tenders.filter(t => t.stage === 'SUBMITTED').length, awarded: base.tenders.filter(t => t.stage === 'AWARDED').length, pendingApproval: base.tenders.filter(t => t.stage === 'APPROVAL_PENDING').length }, charts: { byStage: base.stageGroups }, table: base.tenders }); }
    async enquiryRegister() { const base = await this.base(); return (0, dashboard_response_1.screenResponse)('enquiry-register', 'Enquiry register', { kpis: { enquiries: base.tenders.filter(t => t.stage === 'ENQUIRY').length, underReview: base.tenders.filter(t => ['INTERNAL_REVIEW', 'COSTING', 'RISK_REVIEW'].includes(t.stage)).length }, table: base.tenders }); }
    async bidAnalysis() { const base = await this.base(); return (0, dashboard_response_1.screenResponse)('bid-analysis', 'Bid analysis', { kpis: { bidCount: base.tenders.filter(t => t.bidValue).length, totalBidValue: base.tenders.reduce((s, t) => s + Number(t.bidValue ?? 0), 0), avgMargin: avg(base.tenders.map((t) => Number(t.marginPct ?? 0)).filter(Boolean)) }, table: base.tenders }); }
    async costingPricing() { const base = await this.base(); return (0, dashboard_response_1.screenResponse)('costing-pricing', 'Costing & pricing', { kpis: { estimatedValue: base.tenders.reduce((s, t) => s + Number(t.estimatedValue ?? 0), 0), bidValue: base.tenders.reduce((s, t) => s + Number(t.bidValue ?? 0), 0), avgMargin: avg(base.tenders.map((t) => Number(t.marginPct ?? 0)).filter(Boolean)) }, table: base.tenders }); }
    async riskAssessment() { const base = await this.base(); return (0, dashboard_response_1.screenResponse)('risk-assessment', 'Risk assessment', { kpis: { highRisk: base.tenders.filter((t) => Number(t.riskScore ?? 0) >= 70).length, avgRisk: avg(base.tenders.map((t) => Number(t.riskScore ?? 0)).filter(Boolean)) }, table: base.tenders.sort((a, b) => Number(b.riskScore ?? 0) - Number(a.riskScore ?? 0)) }); }
    async tenderApprovals() { const tenders = await this.prisma.tender.findMany({ where: { stage: 'APPROVAL_PENDING' }, orderBy: { updatedAt: 'asc' } }); return (0, dashboard_response_1.screenResponse)('tender-approvals', 'Tender approvals', { kpis: { pending: tenders.length }, table: tenders }); }
    async submissionTracker() { const base = await this.base(); return (0, dashboard_response_1.screenResponse)('submission-tracker', 'Submission tracker', { kpis: { dueSoon: base.tenders.filter((t) => t.submissionDeadline).length, submitted: base.tenders.filter(t => t.stage === 'SUBMITTED').length }, table: base.tenders }); }
    async wonLostRegister() { const base = await this.base(); return (0, dashboard_response_1.screenResponse)('won-lost-register', 'Won / lost register', { kpis: { awarded: base.tenders.filter(t => t.stage === 'AWARDED').length, lost: base.tenders.filter(t => t.stage === 'LOST').length, cancelled: base.tenders.filter(t => ['CANCELLED', 'NO_BID'].includes(t.stage)).length }, table: base.tenders.filter(t => ['AWARDED', 'LOST', 'CANCELLED', 'NO_BID'].includes(t.stage)) }); }
};
exports.TendersService = TendersService;
exports.TendersService = TendersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TendersService);
function avg(values) { return values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : 0; }
//# sourceMappingURL=tenders.service.js.map