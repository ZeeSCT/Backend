import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private service;
    constructor(service: DashboardService);
    executive(): Promise<{
        kpis: {
            activeProjects: number;
            portfolioCompletion: number;
            delayedMilestones: number;
            pendingApprovals: number;
            criticalActivities: number;
            openNcrs: number;
            materialShortages: number;
            tenders: number;
        };
        projects: {
            progress: number;
            healthStatus: import(".prisma/client").$Enums.HealthStatus;
            projectManager: {
                name: string;
            };
            milestones: {
                id: string;
                healthStatus: import(".prisma/client").$Enums.HealthStatus;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                documentId: string | null;
                milestoneCode: string | null;
                milestoneName: string;
                baselineDate: Date | null;
                forecastDate: Date | null;
                actualDate: Date | null;
                delayDays: number;
            }[];
            id: string;
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
        }[];
    }>;
    planningPortfolio(): Promise<{
        id: string;
        code: string;
        name: string;
        clientName: string;
        healthStatus: import(".prisma/client").$Enums.HealthStatus;
        progress: number;
        totalActivities: number;
        criticalActivities: number;
        delayedMilestones: number;
        resourceShortages: number;
    }[]>;
}
