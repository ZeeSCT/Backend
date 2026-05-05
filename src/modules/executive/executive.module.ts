import { Module } from "@nestjs/common";
import { ExecutiveController } from "./executive.controller";
import { ExecutiveService } from "./executive.service";
import { PortfolioOverviewModule } from "./portfolio-overview/portfolio-overview.module";
import { ProjectHealthModule } from './project-health/project-health.module';
import { DocumentStatusModule } from './documentation-status/documentation-status.module';
import { ProjectDrillDownModule } from "./project-drilldown/project-drilldown.module";
import { RevenueBillingModule } from "./revenue-billing/revenue-billing.module";


@Module({ 
    imports: [
        PortfolioOverviewModule,
        ProjectHealthModule,
        DocumentStatusModule,
        ProjectDrillDownModule,
        RevenueBillingModule,
    ],
    controllers: [ExecutiveController], 
    providers: [ExecutiveService] })
export class ExecutiveModule {}



