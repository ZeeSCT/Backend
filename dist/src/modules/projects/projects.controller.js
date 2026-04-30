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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const projects_service_1 = require("./projects.service");
let ProjectsController = class ProjectsController {
    constructor(service) {
        this.service = service;
    }
    findAll() { return this.service.findAll(); }
    projectWorkspace(projectId) { return this.service.projectWorkspace(projectId); }
    milestoneTracker() { return this.service.milestoneTracker(); }
    workPackageTracker() { return this.service.workPackageTracker(); }
    siteProgressView() { return this.service.siteProgressView(); }
    taskAssignmentBoard() { return this.service.taskAssignmentBoard(); }
    riskIssueBlocker() { return this.service.riskIssueBlocker(); }
    documentReadiness() { return this.service.documentReadiness(); }
    approvalFollowUp() { return this.service.approvalFollowUp(); }
    inspectionFollowUp() { return this.service.inspectionFollowUp(); }
    materialResource() { return this.service.materialResource(); }
    commercialProgress() { return this.service.commercialProgress(); }
    planningOverview() { return this.service.planningOverview(); }
    wbsTimeline() { return this.service.wbsTimeline(); }
    milestoneRegister() { return this.service.milestoneRegister(); }
    activityRegister() { return this.service.activityRegister(); }
    criticalFloatView() { return this.service.criticalFloatView(); }
    resourcePlan() { return this.service.resourcePlan(); }
    monthlyLookahead() { return this.service.monthlyLookahead(); }
    findOne(id) { return this.service.findOne(id); }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('project-workspace'),
    (0, swagger_1.ApiQuery)({ name: 'projectId', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.1 Project workspace screen data' }),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "projectWorkspace", null);
__decorate([
    (0, common_1.Get)('milestone-tracker'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.2 Milestone tracker screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "milestoneTracker", null);
__decorate([
    (0, common_1.Get)('work-package-tracker'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.3 Work package tracker screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "workPackageTracker", null);
__decorate([
    (0, common_1.Get)('site-progress-view'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.4 Site progress view screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "siteProgressView", null);
__decorate([
    (0, common_1.Get)('task-assignment-board'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.5 Task and assignment board screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "taskAssignmentBoard", null);
__decorate([
    (0, common_1.Get)('risk-issue-blocker'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.6 Risk / issue / blocker screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "riskIssueBlocker", null);
__decorate([
    (0, common_1.Get)('document-readiness'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.7 Document readiness screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "documentReadiness", null);
__decorate([
    (0, common_1.Get)('approval-follow-up'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.8 Approval follow-up screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "approvalFollowUp", null);
__decorate([
    (0, common_1.Get)('inspection-follow-up'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.9 Inspection follow-up screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "inspectionFollowUp", null);
__decorate([
    (0, common_1.Get)('material-resource'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.10 Material and resource screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "materialResource", null);
__decorate([
    (0, common_1.Get)('commercial-progress'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.11 Commercial progress screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "commercialProgress", null);
__decorate([
    (0, common_1.Get)('planning-overview'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.12 Planning overview screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "planningOverview", null);
__decorate([
    (0, common_1.Get)('wbs-timeline'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.13 WBS timeline screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "wbsTimeline", null);
__decorate([
    (0, common_1.Get)('milestone-register'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.14 Milestone register screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "milestoneRegister", null);
__decorate([
    (0, common_1.Get)('activity-register'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.15 Activity register screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "activityRegister", null);
__decorate([
    (0, common_1.Get)('critical-float-view'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.16 Critical / float view screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "criticalFloatView", null);
__decorate([
    (0, common_1.Get)('resource-plan'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.17 Resource plan screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "resourcePlan", null);
__decorate([
    (0, common_1.Get)('monthly-lookahead'),
    (0, swagger_1.ApiOperation)({ summary: 'HTML 3.18 Monthly lookahead screen data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "monthlyLookahead", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findOne", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('Project Management Screens'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map