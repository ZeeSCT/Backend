import { Module } from "@nestjs/common";
import { RevenueBillingService } from "./revenue-billing.service";

@Module({
  providers: [RevenueBillingService],
  exports: [RevenueBillingService],
})
export class RevenueBillingModule {}