"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding started...');
    await prisma.projectHealthHistory.deleteMany();
    await prisma.planningMilestone.deleteMany();
    await prisma.materialRequest.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.ncr.deleteMany();
    await prisma.project.deleteMany();
    const projects = await prisma.project.createMany({
        data: [
            {
                id: 'p1',
                code: 'P001',
                name: 'Al Barsha MEP',
                clientName: 'Client A',
                portfolio: 'MEP',
                healthStatus: 'ON_TRACK',
            },
            {
                id: 'p2',
                code: 'P002',
                name: 'DAFZA Ind. Ph.2',
                clientName: 'Client B',
                portfolio: 'Industrial',
                healthStatus: 'AT_RISK',
            },
            {
                id: 'p3',
                code: 'P003',
                name: 'JLT Tower',
                clientName: 'Client C',
                portfolio: 'Highrise',
                healthStatus: 'DELAYED',
            },
            {
                id: 'p4',
                code: 'P004',
                name: 'Mirdif Villa',
                clientName: 'Client D',
                portfolio: 'Residential',
                healthStatus: 'CRITICAL',
            },
            {
                id: 'p5',
                code: 'P005',
                name: 'DIP Warehouse',
                clientName: 'Client E',
                portfolio: 'Warehouse',
                healthStatus: 'ON_TRACK',
            },
        ],
    });
    await prisma.planningMilestone.createMany({
        data: [
            { projectId: 'p1', milestoneName: 'M1', delayDays: 5 },
            { projectId: 'p1', milestoneName: 'M2', delayDays: 3 },
            { projectId: 'p1', milestoneName: 'M3', delayDays: 2 },
            { projectId: 'p2', milestoneName: 'M1', delayDays: 4 },
            { projectId: 'p2', milestoneName: 'M2', delayDays: 2 },
            { projectId: 'p3', milestoneName: 'M1', delayDays: 6 },
            { projectId: 'p4', milestoneName: 'M1', delayDays: 7 },
            { projectId: 'p5', milestoneName: 'M1', delayDays: 1 },
        ],
    });
    await prisma.ncr.create({
        data: {
            refNo: 'NCR1',
            projectId: 'p1',
            description: 'Authority issue',
            healthStatus: 'CRITICAL',
        },
    });
    await prisma.materialRequest.create({
        data: {
            refNo: "MR1",
            projectId: "p4",
            materialName: "Cement",
            plannedQty: 10,
            availableQty: 2,
            requiredDate: new Date(),
            requestedBy: "John",
            priority: "HIGH",
            healthStatus: "AT_RISK"
        }
    });
    await prisma.purchaseOrder.create({
        data: {
            refNo: 'PO1',
            projectId: 'p3',
            vendorName: 'Vendor A',
            materialName: 'Steel',
            expectedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
    });
    const now = new Date();
    const weeksAgo = (n) => {
        const d = new Date();
        d.setDate(now.getDate() - n * 7);
        return d;
    };
    await prisma.projectHealthHistory.createMany({
        data: [
            { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(4) },
            { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(4) },
            { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(4) },
            { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(4) },
            { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(3) },
            { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(3) },
            { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(3) },
            { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(3) },
            { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(2) },
            { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(2) },
            { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(2) },
            { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(2) },
            { projectId: 'p1', newStatus: 'ON_TRACK', changedAt: weeksAgo(1) },
            { projectId: 'p2', newStatus: 'AT_RISK', changedAt: weeksAgo(1) },
            { projectId: 'p3', newStatus: 'DELAYED', changedAt: weeksAgo(1) },
            { projectId: 'p4', newStatus: 'CRITICAL', changedAt: weeksAgo(1) },
        ],
    });
    console.log('✅ Seeding completed!');
}
main()
    .catch(e => {
    console.error(e);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map