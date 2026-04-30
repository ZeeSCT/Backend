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
exports.TendersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenders_service_1 = require("./tenders.service");
let TendersController = class TendersController {
    constructor(service) {
        this.service = service;
    }
    findAll() { return this.service.findAll(); }
    pipelineSummary() { return this.service.pipelineSummary(); }
    tenderPipeline() { return this.service.tenderPipeline(); }
    enquiryRegister() { return this.service.enquiryRegister(); }
    bidAnalysis() { return this.service.bidAnalysis(); }
    costingPricing() { return this.service.costingPricing(); }
    riskAssessment() { return this.service.riskAssessment(); }
    tenderApprovals() { return this.service.tenderApprovals(); }
    submissionTracker() { return this.service.submissionTracker(); }
    wonLostRegister() { return this.service.wonLostRegister(); }
};
exports.TendersController = TendersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TendersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pipeline-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TendersController.prototype, "pipelineSummary", null);
__decorate([
    (0, common_1.Get)('tender-pipeline'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 2.1 Tender pipeline screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TendersController.prototype, "tenderPipeline", null);
__decorate([
    (0, common_1.Get)('enquiry-register'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 2.2 Enquiry register screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TendersController.prototype, "enquiryRegister", null);
__decorate([
    (0, common_1.Get)('bid-analysis'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 2.3 Bid analysis screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TendersController.prototype, "bidAnalysis", null);
__decorate([
    (0, common_1.Get)('costing-pricing'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 2.4 Costing and pricing screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TendersController.prototype, "costingPricing", null);
__decorate([
    (0, common_1.Get)('risk-assessment'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 2.5 Risk assessment screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TendersController.prototype, "riskAssessment", null);
__decorate([
    (0, common_1.Get)('tender-approvals'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 2.6 Tender approvals screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TendersController.prototype, "tenderApprovals", null);
__decorate([
    (0, common_1.Get)('submission-tracker'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 2.7 Submission tracker screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TendersController.prototype, "submissionTracker", null);
__decorate([
    (0, common_1.Get)('won-lost-register'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 2.8 Won / lost register screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TendersController.prototype, "wonLostRegister", null);
exports.TendersController = TendersController = __decorate([
    (0, swagger_1.ApiTags)('Tender Management Screens'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/tenders'),
    __metadata("design:paramtypes", [tenders_service_1.TendersService])
], TendersController);
//# sourceMappingURL=tenders.controller.js.map