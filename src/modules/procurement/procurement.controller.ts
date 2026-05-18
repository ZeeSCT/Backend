import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ProcurementService } from './procurement.service';
@ApiTags('Procurement Screens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/procurement')
export class ProcurementController{
  constructor(private service:ProcurementService){}
  @Get() findAll(){return this.service.findAll()}
  @Get('summary') summary(){return this.service.summary()}
  @Get('material-requests') @ApiOperation({summary:'HTML 5.1 Material requests screen data'}) materialRequests(){return this.service.materialRequests()}
  @Get('rfq-tracker') @ApiOperation({summary:'HTML 5.2 RFQ tracker screen data'}) rfqTracker(){return this.service.rfqTracker()}
  @Get('po-register') @ApiOperation({summary:'HTML 5.3 PO register screen data'}) poRegister(){return this.service.poRegister()}
}
