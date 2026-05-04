import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import {
  PortfolioCategoryCode,
  ProjectDrillDownService,
} from "./project-drilldown.service";

@ApiTags("Executive Screens")
@Controller("api/v1/executive/project-drilldown")
export class ProjectDrillDownController {
  constructor(
    private readonly projectDrillDownService: ProjectDrillDownService,
  ) {}

  @Get()
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
  getProjectDrillDown(
    @Query("category") category: PortfolioCategoryCode = "all",
    @Query("projectId") projectId?: string,
  ) {
    return this.projectDrillDownService.getProjectDrillDown(
      category,
      projectId,
    );
  }
}