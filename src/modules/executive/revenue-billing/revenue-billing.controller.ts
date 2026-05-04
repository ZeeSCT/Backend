import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RevenueBillingService } from './revenue-billing.service';

@ApiTags('Revenue & Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/revenue-billing')
export class RevenueBillingController {
  constructor(private readonly service: RevenueBillingService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Revenue & Billing Summary KPIs',
  })
  getSummary() {
    return this.service.getSummary();
  }

  @Get('projects')
  @ApiOperation({
    summary: 'Billing readiness by project',
  })
  getProjects() {
    return this.service.getProjects();
  }
}