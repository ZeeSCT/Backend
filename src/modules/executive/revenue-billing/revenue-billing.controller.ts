import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RevenueBillingService } from './revenue-billing.service';


@ApiTags('Executive Screens')
@Controller('revenue-billing')
export class RevenueBillingController {
  constructor(
    private readonly service: RevenueBillingService,
  ) {}

  // ----------------------------------
  // SUMMARY CARDS
  // ----------------------------------
  @Get('summary')
  getSummary() {
    return this.service.getSummary();
  }

  // ----------------------------------
  // TABLE DATA
  // ----------------------------------
  @Get('by-project')
  getByProject() {
    return this.service.getBillingByProject();
  }
}