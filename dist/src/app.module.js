"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./common/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const executive_module_1 = require("./modules/executive/executive.module");
const projects_module_1 = require("./modules/projects/projects.module");
const tenders_module_1 = require("./modules/tenders/tenders.module");
const planning_module_1 = require("./modules/planning/planning.module");
const qaqc_module_1 = require("./modules/qaqc/qaqc.module");
const procurement_module_1 = require("./modules/procurement/procurement.module");
const maintenance_module_1 = require("./modules/maintenance/maintenance.module");
const screen_catalog_module_1 = require("./modules/screen-catalog/screen-catalog.module");
const project_health_module_1 = require("./modules/executive/project-health/project-health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            screen_catalog_module_1.ScreenCatalogModule,
            dashboard_module_1.DashboardModule,
            executive_module_1.ExecutiveModule,
            projects_module_1.ProjectsModule,
            tenders_module_1.TendersModule,
            planning_module_1.PlanningModule,
            qaqc_module_1.QaqcModule,
            procurement_module_1.ProcurementModule,
            maintenance_module_1.MaintenanceModule,
            project_health_module_1.ProjectHealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map