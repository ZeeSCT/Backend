import { PrismaService } from '@/common/prisma/prisma.service';
export declare class ProjectHealthService {
    private prisma;
    constructor(prisma: PrismaService);
    private calculateMilestoneStatus;
    getHealthSummary(): Promise<{
        onTrackPct: string;
        atRiskPct: string;
        delayedPct: string;
        criticalNote: string;
        onTrack: number;
        atRisk: number;
        delayed: number;
        critical: number;
    }>;
    getDelayedMilestones(): Promise<any[]>;
    getBlockedItems(): Promise<{
        projectId: string;
        projectName: string;
        message: string;
    }[]>;
    getHealthTrend(): Promise<{
        week: string;
        onTrack: number;
        atRisk: number;
        delayed: number;
        critical: number;
    }[]>;
}
