import { PrismaService } from '@/common/prisma/prisma.service';
export declare class MaintenanceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        project: {
            name: string;
            code: string;
        };
    } & {
        id: string;
        healthStatus: import(".prisma/client").$Enums.HealthStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        name: string;
        location: string | null;
        assetCode: string;
        assetType: string;
    })[]>;
    summary(): Promise<{
        assets: number;
    }>;
    maintenanceDashboard(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    preventiveTasks(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    correctiveTasks(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
}
