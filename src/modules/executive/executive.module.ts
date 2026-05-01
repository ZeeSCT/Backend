import { Module } from "@nestjs/common";
import { ExecutiveController } from "./executive.controller";
import { ExecutiveService } from "./executive.service";
import { PortfolioOverviewModule } from "./portfolio-overview/portfolio-overview.module";
@Module({ 
    imports: [PortfolioOverviewModule],
    controllers: [ExecutiveController], 
    providers: [ExecutiveService] })
export class ExecutiveModule {}
