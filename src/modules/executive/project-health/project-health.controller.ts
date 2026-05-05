import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectHealthService } from './project-health.service';

@ApiTags('Executive Screens')
@Controller('api/v1/executive/project-health')
export class ProjectHealthController {
  constructor(
    private readonly projectHealthService: ProjectHealthService,
  ) {}

  @Get('/summary')
  @ApiOperation({
    summary: 'Project summary cards',
  })
  getSummary(@Query('category') category?: string) {
    return this.projectHealthService.getSummary(category);
  }

  @Get('/delayed-milestones')
  @ApiOperation({
    summary: 'Delayed milestones by project',
  })
  getDelayedMilestones(@Query('category') category?: string) {
    return this.projectHealthService.getDelayedMilestones(category);
  }

  @Get('/blocked-items')
  @ApiOperation({
    summary: 'Blocked items by project',
  })
  getBlockedItems(@Query('category') category?: string) {
    return this.projectHealthService.getBlockedItems(category);
  }

  @Get('/health-trend')
  @ApiOperation({
    summary: 'Health trend - last 4 weeks',
  })
  getHealthTrend() {
    return this.projectHealthService.getHealthTrend();
  }
}