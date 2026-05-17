import { Module } from "@nestjs/common";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { TaskAssignmentBoardModule } from './task-assignment/task.module';
@Module({ imports: [TaskAssignmentBoardModule], controllers: [ProjectsController], providers: [ProjectsService] })
export class ProjectsModule {}
