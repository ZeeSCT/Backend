import { PrismaService } from '@/common/prisma/prisma.service';
export declare class ExecutiveService {
    private prisma;
    constructor(prisma: PrismaService);
    portfolioOverview(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    projectHealth(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    revenueBilling(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    approvalBottlenecks(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    documentationStatus(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    projectDrillDown(projectId?: string): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
}
