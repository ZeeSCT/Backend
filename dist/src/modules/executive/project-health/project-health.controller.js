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
exports.ProjectHealthController = void 0;
const common_1 = require("@nestjs/common");
const project_health_service_1 = require("./project-health.service");
let ProjectHealthController = class ProjectHealthController {
    constructor(service) {
        this.service = service;
    }
    summary() {
        return this.service.getHealthSummary();
    }
    delayedMilestones() {
        return this.service.getDelayedMilestones();
    }
    blockedItems() {
        return this.service.getBlockedItems();
    }
    trend() {
        return this.service.getHealthTrend();
    }
};
exports.ProjectHealthController = ProjectHealthController;
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectHealthController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('delayed-milestones'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectHealthController.prototype, "delayedMilestones", null);
__decorate([
    (0, common_1.Get)('blocked-items'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectHealthController.prototype, "blockedItems", null);
__decorate([
    (0, common_1.Get)('trend'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectHealthController.prototype, "trend", null);
exports.ProjectHealthController = ProjectHealthController = __decorate([
    (0, common_1.Controller)('project-health'),
    __metadata("design:paramtypes", [project_health_service_1.ProjectHealthService])
], ProjectHealthController);
//# sourceMappingURL=project-health.controller.js.map