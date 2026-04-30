import { Controller, Get } from '@nestjs/common';
import { ProjectHealthService } from './project-health.service';

@Controller('project-health')
export class ProjectHealthController {
  constructor(private service: ProjectHealthService) {}

  @Get('summary')
  summary() {
    return this.service.getHealthSummary();
  }

  @Get('delayed-milestones')
  delayedMilestones() {
    return this.service.getDelayedMilestones();
  }

  @Get('blocked-items')
  blockedItems() {
    return this.service.getBlockedItems();
  }

  @Get('trend')
  trend() {
    return this.service.getHealthTrend();
  }
}