import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { screenResponse } from '@/common/dashboard/dashboard-response';
@Injectable()
export class QaqcService{
  constructor(private prisma:PrismaService){}
  async findAll(){const [inspections,ncrs]=await Promise.all([this.prisma.inspection.findMany(),this.prisma.ncr.findMany()]);return {inspections,ncrs}}
  async summary(){return {inspections:await this.prisma.inspection.count(),ncrs:await this.prisma.ncr.count()}}
  async inspectionRegister(){const rows=await this.prisma.inspection.findMany({include:{project:{select:{code:true,name:true}}},orderBy:{scheduledAt:'asc'}});return screenResponse('inspection-register','Inspection register',{kpis:{total:rows.length,scheduled:rows.filter(r=>r.outcome==='Scheduled'||!r.outcome).length},table:rows})}
  async ncrLog(){const rows=await this.prisma.ncr.findMany({include:{project:{select:{code:true,name:true}}},orderBy:{dateRaised:'desc'}});return screenResponse('ncr-log','NCR log',{kpis:{total:rows.length,high:rows.filter(r=>r.severity==='High').length},table:rows})}
  async punchList(){const ncrs=await this.prisma.ncr.findMany({include:{project:{select:{code:true,name:true}}},orderBy:{dateRaised:'desc'}});const inspections=await this.prisma.inspection.findMany({include:{project:{select:{code:true,name:true}}}});return screenResponse('punch-list','Punch list',{kpis:{openItems:ncrs.length+inspections.filter(i=>i.outcome && i.outcome!=='Passed').length},items:[...ncrs.map(n=>({type:'NCR',...n})),...inspections.filter(i=>i.outcome&&i.outcome!=='Passed').map(i=>({type:'Inspection',...i}))]})}
}
