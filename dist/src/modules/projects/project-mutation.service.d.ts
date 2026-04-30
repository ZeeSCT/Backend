import { PrismaService } from '@/common/prisma/prisma.service';
export declare class ProjectMutationService {
    private prisma;
    constructor(prisma: PrismaService);
    updateProject(id: string, data: any): Promise<{
        id: string;
        healthStatus: import(".prisma/client").$Enums.HealthStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        clientName: string;
        portfolio: string;
        projectManagerId: string | null;
        contractValue: import("@prisma/client/runtime/library").Decimal | null;
        completionPct: number;
        plannedStart: Date | null;
        plannedFinish: Date | null;
        forecastFinish: Date | null;
        status: import(".prisma/client").$Enums.RecordStatus;
    }>;
}
