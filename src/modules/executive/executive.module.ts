import { Module } from "@nestjs/common";
import { ExecutiveController } from "./executive.controller";
import { ExecutiveService } from "./executive.service";
import { PortfolioOverviewModule } from "./portfolio-overview/portfolio-overview.module";
import { DocumentStatusModule } from './documentation-status/documentation-status.module';


@Module({ 
    imports: [
        PortfolioOverviewModule,
        DocumentStatusModule
    ],
    controllers: [ExecutiveController], 
    providers: [ExecutiveService] })
export class ExecutiveModule {}
