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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutiveController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const executive_service_1 = require("./executive.service");
let ExecutiveController = class ExecutiveController {
    constructor(service) {
        this.service = service;
    }
    portfolioOverview() { return this.service.portfolioOverview(); }
    projectHealth() { return this.service.projectHealth(); }
    revenueBilling() { return this.service.revenueBilling(); }
    approvalBottlenecks() { return this.service.approvalBottlenecks(); }
    documentationStatus() { return this.service.documentationStatus(); }
    projectDrillDown(projectId) { return this.service.projectDrillDown(projectId); }
};
exports.ExecutiveController = ExecutiveController;
__decorate([
    (0, common_1.Get)('portfolio-overview'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 1.1 Portfolio overview screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExecutiveController.prototype, "portfolioOverview", null);
__decorate([
    (0, common_1.Get)('project-health'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 1.2 Project health screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExecutiveController.prototype, "projectHealth", null);
__decorate([
    (0, common_1.Get)('revenue-billing'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 1.3 Revenue and billing screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExecutiveController.prototype, "revenueBilling", null);
__decorate([
    (0, common_1.Get)('approval-bottlenecks'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 1.4 Approval bottlenecks screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExecutiveController.prototype, "approvalBottlenecks", null);
__decorate([
    (0, common_1.Get)('documentation-status'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 1.5 Documentation status screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExecutiveController.prototype, "documentationStatus", null);
__decorate([
    (0, common_1.Get)('project-drill-down'),
    (0, swagger_1.ApiQuery)({ name: 'projectId', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 1.6 Project drill-down screen data' }),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExecutiveController.prototype, "projectDrillDown", null);
exports.ExecutiveController = ExecutiveController = __decorate([
    (0, swagger_1.ApiTags)('Executive Screens'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/executive'),
    __metadata("design:paramtypes", [executive_service_1.ExecutiveService])
], ExecutiveController);
//# sourceMappingURL=executive.controller.js.map