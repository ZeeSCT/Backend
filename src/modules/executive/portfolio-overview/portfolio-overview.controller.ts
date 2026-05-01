import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PortfolioOverviewService } from './portfolio-overview.service';

@ApiTags('Portfolio Overview')
@ApiBearerAuth()
@Controller('api/v1/portfolio-overview')
export class PortfolioOverviewController {
  constructor(private readonly service: PortfolioOverviewService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Portfolio Overview',
    description:
      'Returns KPI cards, health status counts, top issues, and project summary table data.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    example: 'all',
    enum: ['all', 'its', 'traffic', 'its-maint', 'traffic-maint'],
  })
  getOverview(@Query('category') category?: string) {
    return this.service.getOverview(category ?? 'all');
  }
}