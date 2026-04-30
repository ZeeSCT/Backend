import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private service;
    constructor(service: ProjectsService);
    findAll(): Promise<{
        progress: number;
        healthStatus: import(".prisma/client").$Enums.HealthStatus;
        _count: {
            activities: number;
            milestones: number;
            resources: number;
            inspections: number;
            ncrs: number;
            materialRequests: number;
            purchaseOrders: number;
            assets: number;
        };
        projectManager: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
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
    }[]>;
    projectWorkspace(projectId?: string): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    milestoneTracker(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    workPackageTracker(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    siteProgressView(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    taskAssignmentBoard(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    riskIssueBlocker(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    documentReadiness(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    approvalFollowUp(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    inspectionFollowUp(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    materialResource(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    commercialProgress(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    planningOverview(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    wbsTimeline(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    milestoneRegister(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    activityRegister(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    criticalFloatView(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    resourcePlan(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    monthlyLookahead(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    findOne(id: string): Promise<{
        progress: number;
        healthStatus: import(".prisma/client").$Enums.HealthStatus;
        projectManager: {
            name: string;
            email: string;
        };
        activities: {
            id: string;
            healthStatus: import(".prisma/client").$Enums.HealthStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            plannedStart: Date | null;
            plannedFinish: Date | null;
            documentId: string | null;
            wbsCode: string | null;
            activityId: string;
            activityName: string;
            discipline: string | null;
            location: string | null;
            durationDays: number | null;
            actualStart: Date | null;
            actualFinish: Date | null;
            floatDays: number | null;
            percentComplete: number;
            owner: string | null;
            isCritical: boolean;
        }[];
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
        resources: {
            id: string;
            healthStatus: import(".prisma/client").$Enums.HealthStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            plannedQty: number;
            availableQty: number;
            requiredDate: Date | null;
            documentId: string | null;
            activityId: string | null;
            resourceRole: string;
            resourceName: string | null;
        }[];
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
        materialRequests: {
            id: string;
            refNo: string;
            healthStatus: import(".prisma/client").$Enums.HealthStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            materialName: string;
            plannedQty: number;
            availableQty: number;
            requiredDate: Date | null;
            requestedBy: string | null;
            priority: string | null;
        }[];
        purchaseOrders: {
            id: string;
            refNo: string;
            healthStatus: import(".prisma/client").$Enums.HealthStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            materialName: string;
            vendorName: string;
            amount: import("@prisma/client/runtime/library").Decimal | null;
            issuedAt: Date | null;
            expectedDelivery: Date | null;
        }[];
        assets: {
            id: string;
            healthStatus: import(".prisma/client").$Enums.HealthStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            name: string;
            location: string | null;
            assetCode: string;
            assetType: string;
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
    }>;
}
