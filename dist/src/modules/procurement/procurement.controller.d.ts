import { ProcurementService } from './procurement.service';
export declare class ProcurementController {
    private service;
    constructor(service: ProcurementService);
    findAll(): Promise<{
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
    }>;
    summary(): Promise<{
        materialRequests: number;
        purchaseOrders: number;
    }>;
    materialRequests(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    rfqTracker(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
    poRegister(): Promise<{
        screenKey: string;
        title: string;
        generatedAt: string;
    }>;
}
