import { PrismaService } from '@/common/prisma/prisma.service';
export declare class QaqcService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        inspections: {
            id: string;
            refNo: string;
            healthStatus: import(".prisma/client").$Enums.HealthStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            activity: string;
            inspectionType: string | null;
            inspectorName: string | null;
            scheduledAt: Date | null;
            outcome: string | null;
            notes: string | null;
        }[];
        ncrs: {
            id: string;
            refNo: string;
            description: string;
            packageName: string | null;
            raisedBy: string | null;
            severity: string | null;
            healthStatus: import(".prisma/client").$Enums.HealthStatus;
            dateRaised: Date | null;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
        }[];
    }>;
    summary(): Promise<{
        inspections: number;
        ncrs: number;
    }>;
    inspectionRegister(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    ncrLog(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    punchList(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
}
