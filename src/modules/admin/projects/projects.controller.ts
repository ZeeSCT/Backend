import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";

@ApiTags("Projects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: "Get all active/non-archived projects" })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get("project-managers")
  @ApiOperation({ summary: "Get users available as project managers" })
  getProjectManagers() {
    return this.projectsService.getProjectManagers();
  }

  @Get(":code")
  @ApiOperation({ summary: "Get project by code" })
  @ApiParam({ name: "code", example: "PRJ-001" })
  findByCode(@Param("code") code: string) {
    return this.projectsService.findByCode(code);
  }

  @Post()
  @ApiOperation({ summary: "Create project" })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Archive/delete project by ID" })
  @ApiParam({ name: "id" })
  deleteProject(@Param("id") id: string) {
    return this.projectsService.deleteProject(id);
  }
}
