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
exports.ProcurementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const procurement_service_1 = require("./procurement.service");
let ProcurementController = class ProcurementController {
    constructor(service) {
        this.service = service;
    }
    findAll() { return this.service.findAll(); }
    summary() { return this.service.summary(); }
    materialRequests() { return this.service.materialRequests(); }
    rfqTracker() { return this.service.rfqTracker(); }
    poRegister() { return this.service.poRegister(); }
};
exports.ProcurementController = ProcurementController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('material-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 5.1 Material requests screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "materialRequests", null);
__decorate([
    (0, common_1.Get)('rfq-tracker'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 5.2 RFQ tracker screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "rfqTracker", null);
__decorate([
    (0, common_1.Get)('po-register'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 5.3 PO register screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "poRegister", null);
exports.ProcurementController = ProcurementController = __decorate([
    (0, swagger_1.ApiTags)('Procurement Screens'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/procurement'),
    __metadata("design:paramtypes", [procurement_service_1.ProcurementService])
], ProcurementController);
//# sourceMappingURL=procurement.controller.js.map