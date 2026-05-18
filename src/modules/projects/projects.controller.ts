import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { ProjectsService } from "./projects.service";
@ApiTags("Project Management Screens")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("/projects")
export class ProjectsController {
  constructor(private service: ProjectsService) {}
  @Get() findAll() {
    return this.service.findAll();
  }
  @Get("project-workspace")
  @ApiQuery({ name: "projectId", required: false })
  @ApiOperation({ summary: "HTML 3.1 Project workspace screen data" })
  projectWorkspace(@Query("projectId") projectId?: string) {
    return this.service.projectWorkspace(projectId);
  }
  @Get("milestone-tracker")
  @ApiOperation({ summary: "HTML 3.2 Milestone tracker screen data" })
  milestoneTracker() {
    return this.service.milestoneTracker();
  }
  @Get("work-package-tracker")
  @ApiOperation({ summary: "HTML 3.3 Work package tracker screen data" })
  workPackageTracker() {
    return this.service.workPackageTracker();
  }
  @Get("site-progress-view")
  @ApiOperation({ summary: "HTML 3.4 Site progress view screen data" })
  siteProgressView() {
    return this.service.siteProgressView();
  }
  @Get("task-assignment-board")
  @ApiOperation({ summary: "HTML 3.5 Task and assignment board screen data" })
  taskAssignmentBoard() {
    return this.service.taskAssignmentBoard();
  }
  @Get("risk-issue-blocker")
  @ApiOperation({ summary: "HTML 3.6 Risk / issue / blocker screen data" })
  riskIssueBlocker() {
    return this.service.riskIssueBlocker();
  }
  @Get("document-readiness")
  @ApiOperation({ summary: "HTML 3.7 Document readiness screen data" })
  documentReadiness() {
    return this.service.documentReadiness();
  }
  @Get("approval-follow-up")
  @ApiOperation({ summary: "HTML 3.8 Approval follow-up screen data" })
  approvalFollowUp() {
    return this.service.approvalFollowUp();
  }
  @Get("inspection-follow-up")
  @ApiOperation({ summary: "HTML 3.9 Inspection follow-up screen data" })
  inspectionFollowUp() {
    return this.service.inspectionFollowUp();
  }
  @Get("material-resource")
  @ApiOperation({ summary: "HTML 3.10 Material and resource screen data" })
  materialResource() {
    return this.service.materialResource();
  }
  @Get("commercial-progress")
  @ApiOperation({ summary: "HTML 3.11 Commercial progress screen data" })
  commercialProgress() {
    return this.service.commercialProgress();
  }
  @Get("planning-overview")
  @ApiOperation({ summary: "HTML 3.12 Planning overview screen data" })
  planningOverview() {
    return this.service.planningOverview();
  }
  @Get("wbs-timeline")
  @ApiOperation({ summary: "HTML 3.13 WBS timeline screen data" })
  wbsTimeline() {
    return this.service.wbsTimeline();
  }
  @Get("milestone-register")
  @ApiOperation({ summary: "HTML 3.14 Milestone register screen data" })
  milestoneRegister() {
    return this.service.milestoneRegister();
  }
  @Get("activity-register")
  @ApiOperation({ summary: "HTML 3.15 Activity register screen data" })
  activityRegister() {
    return this.service.activityRegister();
  }
  @Get("critical-float-view")
  @ApiOperation({ summary: "HTML 3.16 Critical / float view screen data" })
  criticalFloatView() {
    return this.service.criticalFloatView();
  }
  @Get("resource-plan")
  @ApiOperation({ summary: "HTML 3.17 Resource plan screen data" })
  resourcePlan() {
    return this.service.resourcePlan();
  }
  @Get("monthly-lookahead")
  @ApiOperation({ summary: "HTML 3.18 Monthly lookahead screen data" })
  monthlyLookahead() {
    return this.service.monthlyLookahead();
  }
  @Get(":id") findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }
}
