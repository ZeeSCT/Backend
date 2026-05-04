import { Controller, Get } from '@nestjs/common';
import { ProjectHealthService } from './project-health.service';

@Controller('project-health')
export class ProjectHealthController {
  constructor(private service: ProjectHealthService) {}

  @Get('summary')
  getSummary() {
    return this.service.getHealthSummary();
  }

  @Get('delayed-milestones')
  getDelayedMilestones() {
    return this.service.getDelayedMilestones();
  }

  @Get('blocked-items')
  getBlockedItems() {
    return this.service.getBlockedItems();
  }

  @Get('trend')
  getTrend() {
    return this.service.getHealthTrend();
  }
}