import { ProjectHealthService } from './project-health.service';
export declare class ProjectHealthController {
    private service;
    constructor(service: ProjectHealthService);
    summary(): Promise<{
        onTrackPct: string;
        atRiskPct: string;
        delayedPct: string;
        criticalNote: string;
        onTrack: number;
        atRisk: number;
        delayed: number;
        critical: number;
    }>;
    delayedMilestones(): Promise<any[]>;
    blockedItems(): Promise<{
        projectId: string;
        projectName: string;
        message: string;
    }[]>;
    trend(): Promise<{
        week: string;
        onTrack: number;
        atRisk: number;
        delayed: number;
        critical: number;
    }[]>;
}
