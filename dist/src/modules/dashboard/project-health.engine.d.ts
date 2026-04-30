import { PrismaService } from '@/common/prisma/prisma.service';
export declare class ProjectHealthEngine {
    private prisma;
    constructor(prisma: PrismaService);
    recalculateProjectHealth(projectId: string): Promise<{
        projectId: string;
        status: import(".prisma/client").$Enums.HealthStatus;
        completionPct: number;
        delayed: number;
        critical: number;
    }>;
}
