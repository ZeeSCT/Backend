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
exports.QaqcController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const qaqc_service_1 = require("./qaqc.service");
let QaqcController = class QaqcController {
    constructor(service) {
        this.service = service;
    }
    findAll() { return this.service.findAll(); }
    summary() { return this.service.summary(); }
    inspectionRegister() { return this.service.inspectionRegister(); }
    ncrLog() { return this.service.ncrLog(); }
    punchList() { return this.service.punchList(); }
};
exports.QaqcController = QaqcController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QaqcController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QaqcController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('inspection-register'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 4.1 Inspection register screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QaqcController.prototype, "inspectionRegister", null);
__decorate([
    (0, common_1.Get)('ncr-log'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 4.2 NCR log screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QaqcController.prototype, "ncrLog", null);
__decorate([
    (0, common_1.Get)('punch-list'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 4.3 Punch list screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QaqcController.prototype, "punchList", null);
exports.QaqcController = QaqcController = __decorate([
    (0, swagger_1.ApiTags)('QA/QC Screens'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/qaqc'),
    __metadata("design:paramtypes", [qaqc_service_1.QaqcService])
], QaqcController);
//# sourceMappingURL=qaqc.controller.js.map