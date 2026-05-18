import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PortfolioOverviewModule } from './modules/executive/portfolio-overview/portfolio-overview.module';
import { ExecutiveModule } from './modules/executive/executive.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TendersModule } from './modules/tenders/tenders.module';
import { PlanningModule } from './modules/planning/planning.module';
import { QaqcModule } from './modules/qaqc/qaqc.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ScreenCatalogModule } from './modules/screen-catalog/screen-catalog.module';
import { RevenueBillingModule } from './modules/executive/revenue-billing/revenue-billing.module';
import {ProjectsMasterModule} from './modules/admin/projects/projects.module';
import {ClientsModule} from './modules/admin/clients/clients.module';
import {SchedulesModule} from './modules/admin/schedules/schedules.module';
import {ResourceAssignmentModule} from './modules/admin/resource-assignment/resource-assignment.module';
import { RolePermissionsModule } from "./modules/admin/Access Control/Roles&Permission/roles.module";
import { SystemSettingsModule } from "./modules/admin/Systemsetting/system-settings.module";
import { MaterialResourceModule} from "./modules/projects/material-resource/module";
import { TaskAssignmentBoardModule } from './modules/projects/task-assignment/task.module';
import { DocumentStatusModule } from "./modules/admin/document-status/document-status.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsMasterModule,
    ClientsModule,
    ScreenCatalogModule,
    SchedulesModule,
    ResourceAssignmentModule,
    DocumentStatusModule,
    DashboardModule,
    PortfolioOverviewModule,
    ExecutiveModule,
    RevenueBillingModule,
    UsersModule,
    ProjectsModule,
    TendersModule,
    PlanningModule,
    QaqcModule,
    ProcurementModule,
    MaintenanceModule,
    RolePermissionsModule,
    MaterialResourceModule,
    SystemSettingsModule,
    TaskAssignmentBoardModule,
    
  ],
})
export class AppModule {}
