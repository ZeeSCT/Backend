import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { RevenueBillingService } from "./revenue-billing/revenue-billing.service";
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

import { ProjectHealthService } from "./project-health/project-health.service";

@ApiTags("Executive Screens")

// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)

@Controller("api/v1/executive")
export class ExecutiveController {
  constructor(
  private readonly service: ExecutiveService,
  private readonly portfolioOverviewService: PortfolioOverviewService,
  private readonly documentStatusService: DocumentStatusService,
  private readonly projectDrillDownService: ProjectDrillDownService,
  private readonly projectHealthService: ProjectHealthService,
  private readonly revenueBillingService: RevenueBillingService,
) {}

  /* ========================================= */
  /* PORTFOLIO OVERVIEW */
  /* ========================================= */

  @Get("portfolio-overview")
  @ApiOperation({
    summary: "HTML 1.1 Portfolio overview screen data",
  })
  portfolioOverview(@Query("category") category?: string) {
    return this.portfolioOverviewService.getOverview(category);
  }

  /* ========================================= */
  /* PROJECT HEALTH */
  /* ========================================= */

  @Get("project-health/summary")
  @ApiOperation({
    summary: "Project health summary",
  })
  getProjectHealthSummary(
    @Query("category") category: string = "all",
  ) {
    return this.projectHealthService.getSummary(category);
  }

  @Get("project-health/blocked-items")
  @ApiOperation({
    summary: "Blocked items by project",
  })
  getBlockedItems(
    @Query("category") category: string = "all",
  ) {
    return this.projectHealthService.getBlockedItems(category);
  }

  @Get("project-health/delayed-milestones")
  @ApiOperation({
    summary: "Delayed milestones by project",
  })
  getDelayedMilestones(
    @Query("category") category: string = "all",
  ) {
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

@Get("revenue-billing/summary")
@ApiOperation({
  summary: "Revenue billing summary",
})
getRevenueBillingSummary() {
  return this.revenueBillingService.getSummary();
}

@Get("revenue-billing/by-project")
@ApiOperation({
  summary: "Revenue billing by project",
})
getRevenueBillingProjects() {
  return this.revenueBillingService.getBillingByProject();
}

  /* ========================================= */
  /* APPROVAL BOTTLENECKS */
  /* ========================================= */

  @Get("approval-bottlenecks")
  @ApiOperation({
    summary: "HTML 1.4 Approval bottlenecks screen data",
  })
  approvalBottlenecks() {
    return this.service.approvalBottlenecks();
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
    enum: ["all", "its", "traffic", "its-maint", "traffic-maint"],
  })
  @ApiQuery({
    name: "stage",
    required: false,
    enum: [
      "pre-construction",
      "design",
      "procurement",
      "construction",
      "testing-commissioning",
      "closeout",
    ],
  })
  documentationStatus(
    @Query("category")
    category: PortfolioCategoryCode = "all",

    @Query("stage")
    stage: DocumentationStage = "pre-construction",
  ) {
    return this.documentStatusService.getDocumentStatus(
      category,
      stage,
    );
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
    enum: ["all", "its", "traffic", "its-maint", "traffic-maint"],
  })
  @ApiQuery({
    name: "projectId",
    required: false,
  })
  projectDrillDown(
    @Query("category")
    category: ProjectDrillDownCategoryCode = "all",

    @Query("projectId")
    projectId?: string,
  ) {
    return this.projectDrillDownService.getProjectDrillDown(
      category,
      projectId,
    );
  }
}