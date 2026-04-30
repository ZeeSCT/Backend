import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PortfolioOverviewModule } from './modules/portfolio-overview/portfolio-overview.module';
import { ExecutiveModule } from './modules/executive/executive.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TendersModule } from './modules/tenders/tenders.module';
import { PlanningModule } from './modules/planning/planning.module';
import { QaqcModule } from './modules/qaqc/qaqc.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ScreenCatalogModule } from './modules/screen-catalog/screen-catalog.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ScreenCatalogModule,
    DashboardModule,
    PortfolioOverviewModule,
    ExecutiveModule,
    ProjectsModule,
    TendersModule,
    PlanningModule,
    QaqcModule,
    ProcurementModule,
    MaintenanceModule,
  ],
})
export class AppModule {}
