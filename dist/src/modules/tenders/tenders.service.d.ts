import { PrismaService } from '@/common/prisma/prisma.service';
export declare class TendersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        project: {
            id: string;
            name: string;
            code: string;
        };
    } & {
        id: string;
        refNo: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        title: string;
        clientName: string;
        status: import(".prisma/client").$Enums.RecordStatus;
        owner: string | null;
        source: string | null;
        estimatedValue: import("@prisma/client/runtime/library").Decimal | null;
        bidValue: import("@prisma/client/runtime/library").Decimal | null;
        stage: import(".prisma/client").$Enums.TenderStage;
        submissionDeadline: Date | null;
        riskScore: number | null;
        marginPct: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    pipelineSummary(): import(".prisma/client").Prisma.GetTenderGroupByPayload<{
        by: "stage"[];
        _count: {
            stage: true;
        };
    }>;
    base(): Promise<{
        tenders: ({
            project: {
                id: string;
                name: string;
                code: string;
            };
        } & {
            id: string;
            refNo: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string | null;
            title: string;
            clientName: string;
            status: import(".prisma/client").$Enums.RecordStatus;
            owner: string | null;
            source: string | null;
            estimatedValue: import("@prisma/client/runtime/library").Decimal | null;
            bidValue: import("@prisma/client/runtime/library").Decimal | null;
            stage: import(".prisma/client").$Enums.TenderStage;
            submissionDeadline: Date | null;
            riskScore: number | null;
            marginPct: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        stageGroups: {
            [x: string]: any;
            key: any;
        }[];
    }>;
    tenderPipeline(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    enquiryRegister(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    bidAnalysis(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    costingPricing(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    riskAssessment(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    tenderApprovals(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    submissionTracker(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    wonLostRegister(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
}
