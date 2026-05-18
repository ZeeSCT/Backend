import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";

import { ExecutiveService } from "./executive.service";
import { PortfolioOverviewService } from "./portfolio-overview/portfolio-overview.service";

import {
  DocumentStatusService,
  DocumentationStage,
  PortfolioCategoryCode,
} from "./documentation-status/documentation-status.service";

import {
  ProjectDrillDownService,
  PortfolioCategoryCode as ProjectDrillDownCategoryCode,
} from "./project-drilldown/project-drilldown.service";

import { ApprovalBottlenecksService } from "./approval-bottlenecks/approval-bottlenecks.service";
import { ProjectHealthService } from "./project-health/project-health.service";
import { RevenueBillingService } from "./revenue-billing/revenue-billing.service";

@ApiTags("Executive Screens")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("/executive")
export class ExecutiveController {
  constructor(
    private readonly service: ExecutiveService,
    private readonly portfolioOverviewService: PortfolioOverviewService,
    private readonly documentStatusService: DocumentStatusService,
    private readonly projectDrillDownService: ProjectDrillDownService,
    private readonly approvalBottlenecksService: ApprovalBottlenecksService,
    private readonly projectHealthService: ProjectHealthService,
    private readonly revenueBillingService: RevenueBillingService,
  ) {}

  /* ========================================= */
  /* LOOKUPS */
  /* ========================================= */

  @Get("lookups")
  @ApiOperation({ summary: "Executive screen lookup data" })
  getLookups() {
    return this.service.getLookups();
  }

  /* ========================================= */
  /* PORTFOLIO OVERVIEW */
  /* ========================================= */

  @Get("portfolio-overview")
  @ApiOperation({
    summary: "HTML 1.1 Portfolio overview screen data",
  })
  @ApiQuery({
    name: "category",
    required: false,
  })
  portfolioOverview(@Query("category") category = "all") {
    return this.portfolioOverviewService.getOverview(category);
  }

  /* ========================================= */
  /* PROJECT HEALTH */
  /* ========================================= */

  @Get("project-health/summary")
  @ApiOperation({
    summary: "Project health summary",
  })
  @ApiQuery({
    name: "category",
    required: false,
  })
  getProjectHealthSummary(@Query("category") category = "all") {
    return this.projectHealthService.getSummary(category);
  }

  @Get("project-health/blocked-items")
  @ApiOperation({
    summary: "Blocked items by project",
  })
  @ApiQuery({
    name: "category",
    required: false,
  })
  getBlockedItems(@Query("category") category = "all") {
    return this.projectHealthService.getBlockedItems(category);
  }

  @Get("project-health/delayed-milestones")
  @ApiOperation({
    summary: "Delayed milestones by project",
  })
  @ApiQuery({
    name: "category",
    required: false,
  })
  getDelayedMilestones(@Query("category") category = "all") {
    return this.projectHealthService.getDelayedMilestones(category);
  }

  @Get("project-health/health-trend")
  @ApiOperation({
    summary: "Project health trend",
  })
  getHealthTrend() {
    return this.projectHealthService.getHealthTrend();
  }

  /* ========================================= */
  /* REVENUE & BILLING */
  /* ========================================= */

  /* ========================================= */
  /* REVENUE & BILLING */
  /* ========================================= */

  @Get("revenue-billing/summary")
  @ApiOperation({
    summary: "Revenue billing summary",
  })
  @ApiQuery({
    name: "category",
    required: false,
  })
  getRevenueBillingSummary(@Query("category") category = "all") {
    return this.revenueBillingService.getSummary(category);
  }

  @Get("revenue-billing/by-project")
  @ApiOperation({
    summary: "Revenue billing by project",
  })
  @ApiQuery({
    name: "category",
    required: false,
  })
  getRevenueBillingProjects(@Query("category") category = "all") {
    return this.revenueBillingService.getBillingByProject(category);
  }

  /* ========================================= */
  /* APPROVAL BOTTLENECKS */
  /* ========================================= */

  @Get("approval-bottlenecks")
  @ApiOperation({
    summary: "HTML 1.4 Approval bottlenecks screen data",
  })
  @ApiQuery({
    name: "category",
    required: false,
  })
  approvalBottlenecks(@Query("category") category = "all") {
    return this.approvalBottlenecksService.getApprovalBottlenecks(category);
  }

  /* ========================================= */
  /* DOCUMENTATION STATUS */
  /* ========================================= */

  @Get("documentation-status")
  @ApiOperation({
    summary: "HTML 1.5 Documentation status screen data",
  })
  @ApiQuery({
    name: "category",
    required: false,
  })
  @ApiQuery({
    name: "stage",
    required: false,
  })
  documentationStatus(
    @Query("category") category: PortfolioCategoryCode = "all",
    @Query("stage") stage: DocumentationStage = "pre-construction",
  ) {
    return this.documentStatusService.getDocumentStatus(category, stage);
  }

  /* ========================================= */
  /* PROJECT DRILL DOWN */
  /* ========================================= */

  @Get("project-drilldown")
  @ApiOperation({
    summary: "HTML 1.6 Project drill-down screen data",
  })
  @ApiQuery({
    name: "category",
    required: false,
  })
  @ApiQuery({
    name: "projectId",
    required: false,
  })
  projectDrillDown(
    @Query("category") category: ProjectDrillDownCategoryCode = "all",
    @Query("projectId") projectId?: string,
  ) {
    return this.projectDrillDownService.getProjectDrillDown(
      category,
      projectId,
    );
  }
}
