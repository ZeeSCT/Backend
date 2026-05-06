import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { ApprovalBottlenecksService } from "./approval-bottlenecks.service";

@ApiTags("Approval Bottlenecks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/executive/approval-bottlenecks")
export class ApprovalBottlenecksController {
  constructor(
    private readonly approvalBottlenecksService: ApprovalBottlenecksService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Approval bottlenecks screen data" })
  @ApiQuery({
    name: "category",
    required: false,
  })
  getApprovalBottlenecks(@Query("category") category = "all") {
    return this.approvalBottlenecksService.getApprovalBottlenecks(category);
  }
}