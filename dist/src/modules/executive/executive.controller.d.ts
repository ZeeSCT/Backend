import { ExecutiveService } from './executive.service';
export declare class ExecutiveController {
    private readonly service;
    constructor(service: ExecutiveService);
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
