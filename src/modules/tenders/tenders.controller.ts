import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TendersService } from './tenders.service';
@ApiTags('Tender Management Screens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/tenders')
export class TendersController {
  constructor(private service: TendersService) {}
  @Get() findAll(){ return this.service.findAll(); }
  @Get('pipeline-summary') pipelineSummary(){ return this.service.pipelineSummary(); }
  @Get('tender-pipeline') @ApiOperation({ summary:'HTML 2.1 Tender pipeline screen data' }) tenderPipeline(){ return this.service.tenderPipeline(); }
  @Get('enquiry-register') @ApiOperation({ summary:'HTML 2.2 Enquiry register screen data' }) enquiryRegister(){ return this.service.enquiryRegister(); }
  @Get('bid-analysis') @ApiOperation({ summary:'HTML 2.3 Bid analysis screen data' }) bidAnalysis(){ return this.service.bidAnalysis(); }
  @Get('costing-pricing') @ApiOperation({ summary:'HTML 2.4 Costing and pricing screen data' }) costingPricing(){ return this.service.costingPricing(); }
  @Get('risk-assessment') @ApiOperation({ summary:'HTML 2.5 Risk assessment screen data' }) riskAssessment(){ return this.service.riskAssessment(); }
  @Get('tender-approvals') @ApiOperation({ summary:'HTML 2.6 Tender approvals screen data' }) tenderApprovals(){ return this.service.tenderApprovals(); }
  @Get('submission-tracker') @ApiOperation({ summary:'HTML 2.7 Submission tracker screen data' }) submissionTracker(){ return this.service.submissionTracker(); }
  @Get('won-lost-register') @ApiOperation({ summary:'HTML 2.8 Won / lost register screen data' }) wonLostRegister(){ return this.service.wonLostRegister(); }
}
