import { Module } from '@nestjs/common';
import { RevenueBillingController } from './revenue-billing.controller';
import { RevenueBillingService } from './revenue-billing.service';

@Module({
  controllers: [RevenueBillingController],
  providers: [RevenueBillingService],
})
export class RevenueBillingModule {}