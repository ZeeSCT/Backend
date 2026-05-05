import { Module } from '@nestjs/common';
import { RevenueBillingController } from './revenue-billing.controller';
import { RevenueBillingService } from './revenue-billing.service';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Module({
  controllers: [RevenueBillingController],
  providers: [RevenueBillingService, PrismaService],
})
export class RevenueBillingModule {}