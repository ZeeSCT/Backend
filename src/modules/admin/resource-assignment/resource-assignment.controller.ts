import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { ResourceAssignmentService } from "./resource-assignment.service";
import { AssignResourceDto } from "./dto/assign-resource.dto";

@ApiTags("Resource Assignment")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/admin/resource-assignment")
export class ResourceAssignmentController {
  constructor(
    private readonly resourceAssignmentService: ResourceAssignmentService,
  ) {}

  @Get("metadata")
  @ApiOperation({
    summary: "Get resource assignment enum metadata",
  })
  getMetadata() {
    return this.resourceAssignmentService.getMetadata();
  }

  @Get("projects")
  @ApiOperation({
    summary: "Get active projects for resource assignment",
  })
  getProjects() {
    return this.resourceAssignmentService.getProjects();
  }

  @Get("projects/:projectId/baselines")
  @ApiOperation({
    summary: "Get imported schedule revisions for a selected project",
  })
  @ApiParam({ name: "projectId", required: true })
  getBaselines(@Param("projectId") projectId: string) {
    return this.resourceAssignmentService.getBaselines(projectId);
  }

  @Get("uploads/:uploadId/wbs-packages")
  @ApiOperation({
    summary: "Get WBS level 2 packages for a schedule upload",
  })
  @ApiParam({ name: "uploadId", required: true })
  getWbsPackages(@Param("uploadId") uploadId: string) {
    return this.resourceAssignmentService.getWbsPackages(uploadId);
  }

  @Get("uploads/:uploadId/wbs-tree")
  @ApiOperation({
    summary: "Get WBS tree for a schedule upload or selected WBS package",
  })
  @ApiParam({ name: "uploadId", required: true })
  @ApiQuery({
    name: "rootWbsId",
    required: false,
    description: "Optional WBS item ID to return only that subtree",
  })
  getWbsTree(
    @Param("uploadId") uploadId: string,
    @Query("rootWbsId") rootWbsId?: string,
  ) {
    return this.resourceAssignmentService.getWbsTree(uploadId, rootWbsId);
  }

  @Get("wbs/:wbsItemId/activities")
  @ApiOperation({
    summary: "Get assignable schedule activities for selected WBS item",
  })
  @ApiParam({ name: "wbsItemId", required: true })
  @ApiQuery({
    name: "status",
    required: false,
    example: "UNASSIGNED",
  })
  @ApiQuery({
    name: "search",
    required: false,
    example: "controller",
  })
  @ApiQuery({
    name: "includeMilestones",
    required: false,
    example: true,
  })
  getActivitiesForWbs(
    @Param("wbsItemId") wbsItemId: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("includeMilestones") includeMilestones?: string,
  ) {
    return this.resourceAssignmentService.getActivitiesForWbs({
      wbsItemId,
      status,
      search,
      includeMilestones: includeMilestones !== "false",
    });
  }

  @Get("available-resources")
  @ApiOperation({
    summary: "Get available seeded resources for assignment date range",
  })
  @ApiQuery({
    name: "type",
    required: false,
    example: "SITE_ENGINEER",
  })
  @ApiQuery({
    name: "role",
    required: false,
    example: "Site Engineer",
  })
  @ApiQuery({
    name: "search",
    required: false,
    example: "Ahmed",
  })
  @ApiQuery({
    name: "start",
    required: false,
    example: "2026-05-11",
  })
  @ApiQuery({
    name: "finish",
    required: false,
    example: "2026-05-23",
  })
  getAvailableResources(
    @Query("type") type?: string,
    @Query("role") role?: string,
    @Query("search") search?: string,
    @Query("start") start?: string,
    @Query("finish") finish?: string,
  ) {
    return this.resourceAssignmentService.getAvailableResources({
      type,
      role,
      search,
      start,
      finish,
    });
  }

  @Get("activities/:activityId/assignments")
  @ApiOperation({
    summary: "Get assigned resources for selected schedule activity",
  })
  @ApiParam({ name: "activityId", required: true })
  getActivityAssignments(@Param("activityId") activityId: string) {
    return this.resourceAssignmentService.getActivityAssignments(activityId);
  }

  @Post("activities/:activityId/assign")
  @ApiOperation({
    summary: "Assign or update a resource assignment for a schedule activity",
  })
  @ApiParam({ name: "activityId", required: true })
  assignResource(
    @Param("activityId") activityId: string,
    @Body() dto: AssignResourceDto,
  ) {
    return this.resourceAssignmentService.assignResource(activityId, dto);
  }

  @Delete("assignments/:assignmentId")
  @ApiOperation({
    summary: "Remove resource assignment from schedule activity",
  })
  @ApiParam({ name: "assignmentId", required: true })
  removeAssignment(@Param("assignmentId") assignmentId: string) {
    return this.resourceAssignmentService.removeAssignment(assignmentId);
  }
}