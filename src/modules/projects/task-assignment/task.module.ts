import { Module } from "@nestjs/common";
import { TaskAssignmentBoardController } from "./task.controller";
import { TaskAssignmentBoardService } from "./task.service";
import { PrismaModule } from "@/common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [TaskAssignmentBoardController],
  providers: [TaskAssignmentBoardService],
})
export class TaskAssignmentBoardModule {}
