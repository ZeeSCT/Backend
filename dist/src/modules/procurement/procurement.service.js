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
exports.ProcurementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const dashboard_response_1 = require("../../common/dashboard/dashboard-response");
let ProcurementService = class ProcurementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() { const [materialRequests, purchaseOrders] = await Promise.all([this.prisma.materialRequest.findMany(), this.prisma.purchaseOrder.findMany()]); return { materialRequests, purchaseOrders }; }
    async summary() { return { materialRequests: await this.prisma.materialRequest.count(), purchaseOrders: await this.prisma.purchaseOrder.count() }; }
    async materialRequests() { const rows = await this.prisma.materialRequest.findMany({ include: { project: { select: { code: true, name: true } } }, orderBy: { createdAt: 'desc' } }); return (0, dashboard_response_1.screenResponse)('material-requests', 'Material requests', { kpis: { total: rows.length, critical: rows.filter(r => r.healthStatus === 'CRITICAL').length }, table: rows }); }
    async rfqTracker() { const requests = await this.prisma.materialRequest.findMany({ include: { project: { select: { code: true, name: true } } }, orderBy: { createdAt: 'desc' } }); return (0, dashboard_response_1.screenResponse)('rfq-tracker', 'RFQ tracker', { kpis: { rfqsToRaise: requests.length, highPriority: requests.filter(r => r.priority === 'High').length }, table: requests.map(r => ({ ...r, rfqStatus: r.priority === 'High' ? 'Urgent RFQ' : 'Pending RFQ' })) }); }
    async poRegister() { const rows = await this.prisma.purchaseOrder.findMany({ include: { project: { select: { code: true, name: true } } }, orderBy: { issuedAt: 'desc' } }); return (0, dashboard_response_1.screenResponse)('po-register', 'PO register', { kpis: { total: rows.length, totalAmount: rows.reduce((s, r) => s + Number(r.amount ?? 0), 0), atRisk: rows.filter(r => r.healthStatus !== 'ON_TRACK').length }, table: rows }); }
};
exports.ProcurementService = ProcurementService;
exports.ProcurementService = ProcurementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProcurementService);
//# sourceMappingURL=procurement.service.js.map