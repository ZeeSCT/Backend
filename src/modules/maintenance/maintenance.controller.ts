import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { MaintenanceService } from './maintenance.service';
@ApiTags('Maintenance Screens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/maintenance')
export class MaintenanceController{
  constructor(private service:MaintenanceService){}
  @Get() findAll(){return this.service.findAll()}
  @Get('summary') summary(){return this.service.summary()}
  @Get('maintenance-dashboard') @ApiOperation({summary:'HTML 6.1 Maintenance dashboard screen data'}) maintenanceDashboard(){return this.service.maintenanceDashboard()}
  @Get('preventive-tasks') @ApiOperation({summary:'HTML 6.2 Preventive tasks screen data'}) preventiveTasks(){return this.service.preventiveTasks()}
  @Get('corrective-tasks') @ApiOperation({summary:'HTML 6.3 Corrective tasks screen data'}) correctiveTasks(){return this.service.correctiveTasks()}
}
