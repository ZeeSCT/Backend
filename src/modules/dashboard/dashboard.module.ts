import { Module } from '@nestjs/common'; import { DashboardController } from './dashboard.controller'; import { DashboardService } from './dashboard.service';import { ProjectHealthEngine } from './project-health.engine';
 @Module({controllers:[DashboardController],providers:[DashboardService,ProjectHealthEngine]}) export class DashboardModule{}
