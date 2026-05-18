import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { DashboardService } from "./dashboard.service";
@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("/dashboard")
export class DashboardController {
  constructor(private service: DashboardService) {}
  @Get("executive") executive() {
    return this.service.executive();
  }
  @Get("planning-portfolio") planningPortfolio() {
    return this.service.planningPortfolio();
  }
}
