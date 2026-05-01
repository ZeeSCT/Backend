import { Module } from '@nestjs/common';
import { PortfolioOverviewController } from './portfolio-overview.controller';
import { PortfolioOverviewService } from './portfolio-overview.service';

@Module({
  controllers: [PortfolioOverviewController],
  providers: [PortfolioOverviewService],
  exports: [PortfolioOverviewService],
})
export class PortfolioOverviewModule {}