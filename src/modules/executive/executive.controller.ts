import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { ExecutiveService } from "./executive.service";
import {PortfolioOverviewService} from "./portfolio-overview/portfolio-overview.service"
import {
  DocumentStatusService,
  DocumentationStage,
  PortfolioCategoryCode,
} from "./documentation-status/documentation-status.service";
import {
  ProjectDrillDownService,
  PortfolioCategoryCode as ProjectDrillDownCategoryCode,
} from "./project-drilldown/project-drilldown.service";

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
) {} 

  @Get("portfolio-overview")
  @ApiOperation({ summary: "HTML 1.1 Portfolio overview screen data" })
  // portfolioOverview() {
  //   return this.service.portfolioOverview();
  // }
  portfolioOverview(@Query('category') category?: string) {
    return this.portfolioOverviewService.getOverview(category);
  }

  @Get("project-health")
  @ApiOperation({ summary: "HTML 1.2 Project health screen data" })
  projectHealth() {
    return this.service.projectHealth();
  }

  @Get("revenue-billing")
  @ApiOperation({ summary: "HTML 1.3 Revenue and billing screen data" })
  revenueBilling() {
    return this.service.revenueBilling();
  }

  @Get("approval-bottlenecks")
  @ApiOperation({ summary: "HTML 1.4 Approval bottlenecks screen data" })
  approvalBottlenecks() {
    return this.service.approvalBottlenecks();
  }

  @Get("documentation-status")
  @ApiOperation({ summary: "HTML 1.5 Documentation status screen data" })
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
    @Query("category") category: PortfolioCategoryCode = "all",
    @Query("stage") stage: DocumentationStage = "pre-construction",
  ) {
    return this.documentStatusService.getDocumentStatus(category, stage);
  }

  @Get("project-drilldown")
@ApiOperation({ summary: "HTML 1.6 Project drill-down screen data" })
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
  @Query("category") category: ProjectDrillDownCategoryCode = "all",
  @Query("projectId") projectId?: string,
) {
  return this.projectDrillDownService.getProjectDrillDown(
    category,
    projectId,
  );
}
}
