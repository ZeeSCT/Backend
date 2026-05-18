import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { ProjectsService } from "./projects.service";
import { ProjectWorkspaceService } from "./project-workspace/project-workspace.service";
import { ProjectWorkspaceQueryDto } from "./project-workspace/dto/project-workspace-query.dto";

@ApiTags("Project Management Screens")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("project-mgmt")
export class ProjectsController {
  constructor(
    private readonly service: ProjectsService,
    private readonly projectWorkspaceService: ProjectWorkspaceService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all active projects" })
  findAll() {
    return this.service.findAll();
  }

  @Get("project-workspace")
  @ApiOperation({ summary: "HTML 3.1 Project workspace screen data" })
  @ApiQuery({ name: "category", required: false, example: "all" })
  @ApiQuery({ name: "projectId", required: false })
  projectWorkspace(@Query() query: ProjectWorkspaceQueryDto) {
    return this.projectWorkspaceService.getWorkspace(query);
  }

  @Get("details/:id")
  @ApiOperation({ summary: "Get project details by id" })
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }
}
