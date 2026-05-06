import { Module } from "@nestjs/common";
import { ExecutiveController } from "./executive.controller";
import { ExecutiveService } from "./executive.service";
import { PortfolioOverviewModule } from "./portfolio-overview/portfolio-overview.module";
import { DocumentStatusModule } from "./documentation-status/documentation-status.module";
import { ProjectDrillDownModule } from "./project-drilldown/project-drilldown.module";
import { ApprovalBottlenecksModule } from "./approval-bottlenecks/approval-bottlenecks.module";

@Module({
  imports: [
    PortfolioOverviewModule,
    DocumentStatusModule,
    ProjectDrillDownModule,
    ApprovalBottlenecksModule
  ],
  controllers: [ExecutiveController],
  providers: [ExecutiveService],
})
export class ExecutiveModule {}