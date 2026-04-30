import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { enumCountRows, screenResponse } from '@/common/dashboard/dashboard-response';
@Injectable()
export class TendersService {
  constructor(private prisma: PrismaService) {}
  findAll(){ return this.prisma.tender.findMany({ orderBy:{ createdAt:'desc' }, include:{ project:{ select:{ id:true, code:true, name:true } } } }); }
  pipelineSummary(){ return this.prisma.tender.groupBy({ by:['stage'], _count:{ stage:true } }); }
  async base() { const tenders = await this.findAll(); const stageGroups = await this.pipelineSummary(); return { tenders, stageGroups: enumCountRows(stageGroups as any[], 'stage') }; }
  async tenderPipeline(){ const base = await this.base(); return screenResponse('tender-pipeline','Tender pipeline',{ kpis:{ total:base.tenders.length, submitted:base.tenders.filter(t=>t.stage==='SUBMITTED').length, awarded:base.tenders.filter(t=>t.stage==='AWARDED').length, pendingApproval:base.tenders.filter(t=>t.stage==='APPROVAL_PENDING').length }, charts:{ byStage:base.stageGroups }, table:base.tenders }); }
  async enquiryRegister(){ const base = await this.base(); return screenResponse('enquiry-register','Enquiry register',{ kpis:{ enquiries:base.tenders.filter(t=>t.stage==='ENQUIRY').length, underReview:base.tenders.filter(t=>['INTERNAL_REVIEW','COSTING','RISK_REVIEW'].includes(t.stage)).length }, table:base.tenders }); }
  async bidAnalysis(){ const base = await this.base(); return screenResponse('bid-analysis','Bid analysis',{ kpis:{ bidCount:base.tenders.filter(t=>t.bidValue).length, totalBidValue:base.tenders.reduce((s:any,t:any)=>s+Number(t.bidValue??0),0), avgMargin:avg(base.tenders.map((t:any)=>Number(t.marginPct??0)).filter(Boolean)) }, table:base.tenders }); }
  async costingPricing(){ const base = await this.base(); return screenResponse('costing-pricing','Costing & pricing',{ kpis:{ estimatedValue:base.tenders.reduce((s:any,t:any)=>s+Number(t.estimatedValue??0),0), bidValue:base.tenders.reduce((s:any,t:any)=>s+Number(t.bidValue??0),0), avgMargin:avg(base.tenders.map((t:any)=>Number(t.marginPct??0)).filter(Boolean)) }, table:base.tenders }); }
  async riskAssessment(){ const base = await this.base(); return screenResponse('risk-assessment','Risk assessment',{ kpis:{ highRisk:base.tenders.filter((t:any)=>Number(t.riskScore??0)>=70).length, avgRisk:avg(base.tenders.map((t:any)=>Number(t.riskScore??0)).filter(Boolean)) }, table:base.tenders.sort((a:any,b:any)=>Number(b.riskScore??0)-Number(a.riskScore??0)) }); }
  async tenderApprovals(){ const tenders = await this.prisma.tender.findMany({ where:{ stage:'APPROVAL_PENDING' }, orderBy:{ updatedAt:'asc' } }); return screenResponse('tender-approvals','Tender approvals',{ kpis:{ pending:tenders.length }, table:tenders }); }
  async submissionTracker(){ const base = await this.base(); return screenResponse('submission-tracker','Submission tracker',{ kpis:{ dueSoon:base.tenders.filter((t:any)=>t.submissionDeadline).length, submitted:base.tenders.filter(t=>t.stage==='SUBMITTED').length }, table:base.tenders }); }
  async wonLostRegister(){ const base = await this.base(); return screenResponse('won-lost-register','Won / lost register',{ kpis:{ awarded:base.tenders.filter(t=>t.stage==='AWARDED').length, lost:base.tenders.filter(t=>t.stage==='LOST').length, cancelled:base.tenders.filter(t=>['CANCELLED','NO_BID'].includes(t.stage)).length }, table:base.tenders.filter(t=>['AWARDED','LOST','CANCELLED','NO_BID'].includes(t.stage)) }); }
}
function avg(values:number[]){ return values.length ? Math.round((values.reduce((a,b)=>a+b,0)/values.length)*100)/100 : 0; }
