import { Module } from '@nestjs/common';
import { ExecutiveController } from './executive.controller';
import { ExecutiveService } from './executive.service';
import { RevenueBillingModule } from './revenue-billing/revenue-billing.module';
@Module({ imports: [RevenueBillingModule], controllers: [ExecutiveController], providers: [ExecutiveService] })

export class ExecutiveModule {}
