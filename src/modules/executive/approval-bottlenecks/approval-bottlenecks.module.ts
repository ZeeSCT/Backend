import { Module } from "@nestjs/common";
import { ApprovalBottlenecksService } from "./approval-bottlenecks.service";

@Module({
  providers: [ApprovalBottlenecksService],
  exports: [ApprovalBottlenecksService],
})
export class ApprovalBottlenecksModule {}