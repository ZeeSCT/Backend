import { Module } from '@nestjs/common';
import { DocumentStatusController } from './documentation-status.controller';
import { DocumentStatusService } from './documentation-status.service';

@Module({
  controllers: [DocumentStatusController],
  providers: [DocumentStatusService],
  exports: [DocumentStatusService],
})
export class DocumentStatusModule {}