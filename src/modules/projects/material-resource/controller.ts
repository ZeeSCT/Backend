import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MaterialResourceService } from "./service";

@ApiTags("Project Management Screens")
@Controller("api/v1/projects/material-resource")
export class MaterialResourceController {
  constructor(private readonly service: MaterialResourceService) {}

  @Get("projects")
  getProjects(@Query("category") category = "all") {
    return this.service.getProjects(category);
  }

  @Get("summary")
  getSummary(@Query("projectId") projectId: string) {
    return this.service.getSummary(projectId);
  }

  @Get("materials")
  getMaterials(
    @Query("projectId") projectId: string,
    @Query("filter") filter: "all" | "shortages" | "pending" = "all",
  ) {
    return this.service.getMaterials(projectId, filter);
  }

  @Get("labour")
  getLabour(@Query("projectId") projectId: string) {
    return this.service.getLabour(projectId);
  }
}