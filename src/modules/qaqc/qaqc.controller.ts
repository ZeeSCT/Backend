import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { QaqcService } from './qaqc.service';
@ApiTags('QA/QC Screens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/qaqc')
export class QaqcController {
  constructor(private service: QaqcService) {}
  @Get() findAll(){return this.service.findAll()}
  @Get('summary') summary(){return this.service.summary()}
  @Get('inspection-register') @ApiOperation({summary:'HTML 4.1 Inspection register screen data'}) inspectionRegister(){return this.service.inspectionRegister()}
  @Get('ncr-log') @ApiOperation({summary:'HTML 4.2 NCR log screen data'}) ncrLog(){return this.service.ncrLog()}
  @Get('punch-list') @ApiOperation({summary:'HTML 4.3 Punch list screen data'}) punchList(){return this.service.punchList()}
}
