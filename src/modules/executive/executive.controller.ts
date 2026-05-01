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

@ApiTags("Executive Screens")

// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)

@Controller("api/v1/executive")
export class ExecutiveController {
  constructor(
    private readonly service: ExecutiveService,
    private readonly portfolioOverviewService: PortfolioOverviewService,
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
  documentationStatus() {
    return this.service.documentationStatus();
  }
  @Get("project-drill-down")
  @ApiQuery({ name: "projectId", required: false })
  @ApiOperation({ summary: "HTML 1.6 Project drill-down screen data" })
  projectDrillDown(@Query("projectId") projectId?: string) {
    return this.service.projectDrillDown(projectId);
  }
}
