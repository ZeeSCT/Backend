// src/modules/schedules/schedules.module.ts

import { Module } from "@nestjs/common";
import { SchedulesController } from "./schedules.controller";
import { SchedulesService } from "./schedules.service";
import { ScheduleExcelParserService } from "./schedule-excel-parser.service";
import { PrismaService } from "@/common/prisma/prisma.service";

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService, ScheduleExcelParserService, PrismaService],
})
export class SchedulesModule {}