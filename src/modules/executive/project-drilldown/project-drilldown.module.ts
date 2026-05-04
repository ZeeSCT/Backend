import { Module } from "@nestjs/common";
import { ProjectDrillDownService } from "./project-drilldown.service";

@Module({
  providers: [ProjectDrillDownService],
  exports: [ProjectDrillDownService],
})
export class ProjectDrillDownModule {}