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
import { SchedulesModule } from "./modules/schedules/schedules.module";
import { RolePermissionsModule } from "./modules/admin/Access Control/Roles&Permission/roles.module";
import { SystemSettingsModule } from "./modules/admin/Systemsetting/system-settings.module";
import { MaterialResourceModule } from "./modules/projects/material-resource/module";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ScreenCatalogModule,
    SchedulesModule,
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
    
  ],
})
export class AppModule {}
