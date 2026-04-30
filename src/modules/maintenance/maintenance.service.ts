import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { screenResponse } from '@/common/dashboard/dashboard-response';
@Injectable()
export class MaintenanceService{
  constructor(private prisma:PrismaService){}
  findAll(){return this.prisma.asset.findMany({include:{project:{select:{code:true,name:true}}}})}
  async summary(){return {assets:await this.prisma.asset.count()}}
  async maintenanceDashboard(){const assets=await this.findAll();return screenResponse('maintenance-dashboard','Maintenance dashboard',{kpis:{assets:assets.length,healthy:assets.filter(a=>a.healthStatus==='ON_TRACK').length,attention:assets.filter(a=>a.healthStatus!=='ON_TRACK').length},table:assets})}
  async preventiveTasks(){const assets=await this.findAll();return screenResponse('preventive-tasks','Preventive tasks',{kpis:{scheduled:assets.length},table:assets.map((a:any)=>({...a,taskType:'Preventive',taskStatus:'Scheduled'}))})}
  async correctiveTasks(){const assets=await this.findAll();const corrective=assets.filter((a:any)=>a.healthStatus!=='ON_TRACK');return screenResponse('corrective-tasks','Corrective tasks',{kpis:{open:corrective.length},table:corrective.map((a:any)=>({...a,taskType:'Corrective',taskStatus:'Open'}))})}
}
