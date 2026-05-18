import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { ProjectWorkspaceQueryDto } from "./dto/project-workspace-query.dto";
import { ProjectWorkspaceService } from "./project-workspace.service";

@ApiTags("Project Management Screens")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("projects")
export class ProjectWorkspaceController {
  constructor(
    private readonly projectWorkspaceService: ProjectWorkspaceService,
  ) {}

  @Get("project-workspace")
  @ApiOperation({
    summary: "HTML 3.1 Project workspace screen data",
  })
  @ApiQuery({
    name: "category",
    required: false,
    example: "all",
  })
  @ApiQuery({
    name: "projectId",
    required: false,
  })
  getWorkspace(@Query() query: ProjectWorkspaceQueryDto) {
    return this.projectWorkspaceService.getWorkspace(query);
  }
}
