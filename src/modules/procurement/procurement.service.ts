import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { screenResponse } from '@/common/dashboard/dashboard-response';
@Injectable()
export class ProcurementService{
  constructor(private prisma:PrismaService){}
  async findAll(){const [materialRequests,purchaseOrders]=await Promise.all([this.prisma.materialRequest.findMany(),this.prisma.purchaseOrder.findMany()]);return {materialRequests,purchaseOrders}}
  async summary(){return {materialRequests:await this.prisma.materialRequest.count(),purchaseOrders:await this.prisma.purchaseOrder.count()}}
  async materialRequests(){const rows=await this.prisma.materialRequest.findMany({include:{project:{select:{code:true,name:true}}},orderBy:{requestDate:'desc'}});return screenResponse('material-requests','Material requests',{kpis:{total:rows.length,critical:rows.filter(r=>r.healthStatus==='CRITICAL').length},table:rows})}
  async rfqTracker(){const requests=await this.prisma.materialRequest.findMany({include:{project:{select:{code:true,name:true}}},orderBy:{requestDate:'desc'}});return screenResponse('rfq-tracker','RFQ tracker',{kpis:{rfqsToRaise:requests.length,highPriority:requests.filter(r=>r.priority==='High').length},table:requests.map(r=>({...r,rfqStatus:r.priority==='High'?'Urgent RFQ':'Pending RFQ'}))})}
  async poRegister(){const rows=await this.prisma.purchaseOrder.findMany({include:{project:{select:{code:true,name:true}}},orderBy:{issuedAt:'desc'}});return screenResponse('po-register','PO register',{kpis:{total:rows.length,totalAmount:rows.reduce((s:any,r:any)=>s+Number(r.amount??0),0),atRisk:rows.filter(r=>r.healthStatus!=='ON_TRACK').length},table:rows})}
}
