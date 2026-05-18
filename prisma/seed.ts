// prisma/seed.ts
import "dotenv/config";

import {
  PrismaClient,
  HealthStatus,
  InvoiceStatus,
  RecordStatus,
  UserRole,
  ResourceType,
  ResourceAssignmentScope,
  ScheduleLocationSource,
  ActivityStatus,
  DocumentImportSource,
} from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

function d(value: string) {
  return new Date(value);
}

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function normalizeLocationName(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/\./g, "")
    .replace(/&/g, "AND")
    .replace(/\s+/g, " ")
    .replace(/\bROAD\b/g, "RD")
    .replace(/\bSTREET\b/g, "ST");
}

function getLookupKeys(name: string, aliases: string[] = []) {
  return [name, ...aliases].map((value) => normalizeLocationName(value));
}

/**
 * IMPORTANT:
 * This must run before any PlanningDocument create/update.
 * PlanningDocument.workflowStatusCode defaults to "draft",
 * so "draft" must already exist in DocumentWorkflowStatusLookup.
 */
async function seedDocumentWorkflowStatuses() {
  const documentWorkflowStatuses = [
    { code: "draft", label: "Draft", tone: "blue", displayOrder: 1 },
    { code: "submitted", label: "Submitted", tone: "blue", displayOrder: 2 },
    {
      code: "under-review",
      label: "Under Review",
      tone: "amber",
      displayOrder: 3,
    },
    { code: "pending", label: "Pending", tone: "amber", displayOrder: 4 },
    { code: "approved", label: "Approved", tone: "green", displayOrder: 5 },
    { code: "rejected", label: "Rejected", tone: "red", displayOrder: 6 },
  ];

  for (const item of documentWorkflowStatuses) {
    await prisma.documentWorkflowStatusLookup.upsert({
      where: { code: item.code },
      update: {
        label: item.label,
        tone: item.tone,
        displayOrder: item.displayOrder,
        isActive: true,
      },
      create: {
        code: item.code,
        label: item.label,
        tone: item.tone,
        displayOrder: item.displayOrder,
        isActive: true,
      },
    });
  }

  console.log("Document workflow statuses seeded.");
}

  async function seedResources() {
    console.log("Seeding resources...");

    const resources = [
      {
        employeeCode: "RES-SE-001",
        name: "Ahmed Khan",
        type: ResourceType.SITE_ENGINEER,
        designation: "Site Engineer",
        discipline: "ITS",
        email: "ahmed.khan@scientechnic.local",
        phone: "+971500000001",
      },
      {
        employeeCode: "RES-SE-002",
        name: "Ravi Menon",
        type: ResourceType.SITE_ENGINEER,
        designation: "Site Engineer",
        discipline: "Traffic Systems",
        email: "ravi.menon@scientechnic.local",
        phone: "+971500000002",
      },
      {
        employeeCode: "RES-FE-001",
        name: "Mohammed Ali",
        type: ResourceType.FIELD_ENGINEER,
        designation: "Field Engineer",
        discipline: "Site Execution",
        email: "mohammed.ali@scientechnic.local",
        phone: "+971500000003",
      },
      {
        employeeCode: "RES-SUP-001",
        name: "Suresh Kumar",
        type: ResourceType.SUPERVISOR,
        designation: "Supervisor",
        discipline: "Civil Works",
        email: "suresh.kumar@scientechnic.local",
        phone: "+971500000004",
      },
      {
        employeeCode: "RES-SUP-002",
        name: "Imran Shaikh",
        type: ResourceType.SUPERVISOR,
        designation: "Supervisor",
        discipline: "ITS Installation",
        email: "imran.shaikh@scientechnic.local",
        phone: "+971500000005",
      },
      {
        employeeCode: "RES-TECH-001",
        name: "Arun Joseph",
        type: ResourceType.TECHNICIAN,
        designation: "Technician",
        discipline: "ITS Installation",
        email: "arun.joseph@scientechnic.local",
        phone: "+971500000006",
      },
      {
        employeeCode: "RES-TECH-002",
        name: "Bilal Hassan",
        type: ResourceType.TECHNICIAN,
        designation: "Technician",
        discipline: "Traffic Signal",
        email: "bilal.hassan@scientechnic.local",
        phone: "+971500000007",
      },
      {
        employeeCode: "RES-TECH-003",
        name: "Naveen Raj",
        type: ResourceType.TECHNICIAN,
        designation: "Technician",
        discipline: "ELV",
        email: "naveen.raj@scientechnic.local",
        phone: "+971500000008",
      },
      {
        employeeCode: "RES-CREW-001",
        name: "Civil Installation Crew A",
        type: ResourceType.CREW,
        designation: "Civil Crew",
        discipline: "Civil Works",
        email: null,
        phone: null,
      },
      {
        employeeCode: "RES-CREW-002",
        name: "ITS Installation Crew A",
        type: ResourceType.CREW,
        designation: "ITS Crew",
        discipline: "ITS Installation",
        email: null,
        phone: null,
      },
      {
        employeeCode: "RES-EQ-001",
        name: "Boom Lift",
        type: ResourceType.EQUIPMENT,
        designation: "Equipment",
        discipline: "Access Equipment",
        email: null,
        phone: null,
      },
      {
        employeeCode: "RES-EQ-002",
        name: "Cable Pulling Machine",
        type: ResourceType.EQUIPMENT,
        designation: "Equipment",
        discipline: "Installation Equipment",
        email: null,
        phone: null,
      },
      {
        employeeCode: "RES-MAT-001",
        name: "Fiber Optic Cable",
        type: ResourceType.MATERIAL,
        designation: "Material",
        discipline: "Fiber Network",
        email: null,
        phone: null,
      },
      {
        employeeCode: "RES-VEN-001",
        name: "Traffic Signal Vendor",
        type: ResourceType.VENDOR,
        designation: "Vendor",
        discipline: "Traffic Systems",
        email: "vendor.traffic@scientechnic.local",
        phone: "+971500000009",
      },
      {
        employeeCode: "RES-SUB-001",
        name: "Civil Works Subcontractor",
        type: ResourceType.SUBCONTRACTOR,
        designation: "Subcontractor",
        discipline: "Civil Works",
        email: "subcontractor.civil@scientechnic.local",
        phone: "+971500000010",
      },
    ];

    for (const resource of resources) {
      await prisma.resource.upsert({
        where: {
          employeeCode: resource.employeeCode,
        },
        update: {
          name: resource.name,
          type: resource.type,
          designation: resource.designation,
          discipline: resource.discipline,
          email: resource.email,
          phone: resource.phone,
          isActive: true,
        },
        create: {
          employeeCode: resource.employeeCode,
          name: resource.name,
          type: resource.type,
          designation: resource.designation,
          discipline: resource.discipline,
          email: resource.email,
          phone: resource.phone,
          isActive: true,
        },
      });
    }

    console.log(`Seeded ${resources.length} resources.`);
  }

  async function main() {
    console.log("Starting seed...");

    await seedDocumentWorkflowStatuses();

    /* ---------------------------------- */
    /* USERS */
    /* ---------------------------------- */

    const passwordHash = await bcrypt.hash(
      process.env.SEED_ADMIN_PASSWORD || "Admin@123",
      10,
    );

    const admin = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {
        name: "Admin User",
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
      create: {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    });

    const pm = await prisma.user.upsert({
      where: { email: "pm@example.com" },
      update: {
        name: "A. Karim",
        role: UserRole.PROJECT_MANAGER,
        isActive: true,
      },
      create: {
        name: "A. Karim",
        email: "pm@example.com",
        passwordHash,
        role: UserRole.PROJECT_MANAGER,
        isActive: true,
      },
    });

    const pm2 = await prisma.user.upsert({
      where: { email: "pm2@example.com" },
      update: {
        name: "N. Rashid",
        role: UserRole.PROJECT_MANAGER,
        isActive: true,
      },
      create: {
        name: "N. Rashid",
        email: "pm2@example.com",
        passwordHash,
        role: UserRole.PROJECT_MANAGER,
        isActive: true,
      },
    });

    const pm3 = await prisma.user.upsert({
      where: { email: "pm3@example.com" },
      update: {
        name: "S. Mehta",
        role: UserRole.PROJECT_MANAGER,
        isActive: true,
      },
      create: {
        name: "S. Mehta",
        email: "pm3@example.com",
        passwordHash,
        role: UserRole.PROJECT_MANAGER,
        isActive: true,
      },
    });

    const pm4 = await prisma.user.upsert({
      where: { email: "pm4@example.com" },
      update: {
        name: "F. Al Hamad",
        role: UserRole.PROJECT_MANAGER,
        isActive: true,
      },
      create: {
        name: "F. Al Hamad",
        email: "pm4@example.com",
        passwordHash,
        role: UserRole.PROJECT_MANAGER,
        isActive: true,
      },
    });

  /* ---------------------------------- */
  /* PORTFOLIO CATEGORIES */
  /* ---------------------------------- */

  const itsCategory = await prisma.portfolioCategory.upsert({
    where: { code: "its" },
    update: {
      name: "ITS Projects",
      description: "Intelligent Transport Systems projects",
      isActive: true,
      displayOrder: 1,
    },
    create: {
      code: "its",
      name: "ITS Projects",
      description: "Intelligent Transport Systems projects",
      isActive: true,
      displayOrder: 1,
    },
  });

  const trafficCategory = await prisma.portfolioCategory.upsert({
    where: { code: "traffic" },
    update: {
      name: "Traffic Projects",
      description: "Traffic infrastructure projects",
      isActive: true,
      displayOrder: 2,
    },
    create: {
      code: "traffic",
      name: "Traffic Projects",
      description: "Traffic infrastructure projects",
      isActive: true,
      displayOrder: 2,
    },
  });

  const itsMaintenanceCategory = await prisma.portfolioCategory.upsert({
    where: { code: "its-maint" },
    update: {
      name: "ITS Maintenance",
      description: "ITS maintenance works",
      isActive: true,
      displayOrder: 3,
    },
    create: {
      code: "its-maint",
      name: "ITS Maintenance",
      description: "ITS maintenance works",
      isActive: true,
      displayOrder: 3,
    },
  });

  const trafficMaintenanceCategory = await prisma.portfolioCategory.upsert({
    where: { code: "traffic-maint" },
    update: {
      name: "Traffic Maintenance",
      description: "Traffic maintenance works",
      isActive: true,
      displayOrder: 4,
    },
    create: {
      code: "traffic-maint",
      name: "Traffic Maintenance",
      description: "Traffic maintenance works",
      isActive: true,
      displayOrder: 4,
    },
  });

  const categoryMap = {
    its: itsCategory,
    traffic: trafficCategory,
    "its-maint": itsMaintenanceCategory,
    "traffic-maint": trafficMaintenanceCategory,
  };

  type CategoryCode = keyof typeof categoryMap;

  /* ---------------------------------- */
  /* TYPES */
  /* ---------------------------------- */

  type SeedDocumentInput = {
    fileName: string;
    revision: string;
    planType?: string;
    stageCode?: string;
    approvalStatusCode?: string;
    workflowStatusCode?: string;
    approver?: string;
    submittedAt?: Date;
    dueDate?: Date;
    approvedAt?: Date | null;
    count?: number;
    baselineStart?: Date;
    baselineFinish?: Date;
    forecastFinish?: Date;
    uploadedBy?: string;
  };

  type SeedDocumentationStatusRecord = {
    id: string;
    stageCode: string;
    categoryCode: CategoryCode;
    document: string;
    projectCode: string;
    revision: string;
    submittedAt: Date;
    approver: string;
    approvalStatusCode: string;
    count: number;
    overdueDays?: number;
  };

  type SeedActivityInput = {
    wbsCode?: string;
    activityId: string;
    activityName: string;
    discipline?: string;
    location?: string;
    roadLocationName?: string;
    rawRoadCode?: string;
    packageName?: string;
    workSectionName?: string;
    assetReference?: string;
    locationSource?: ScheduleLocationSource;
    durationDays?: number;
    plannedStart?: Date;
    plannedFinish?: Date;
    actualStart?: Date;
    actualFinish?: Date;
    floatDays?: number;
    percentComplete?: number;
    owner?: string;
    isCritical?: boolean;
    healthStatus?: HealthStatus;
  };

  type SeedMilestoneInput = {
    milestoneCode?: string;
    milestoneName: string;
    baselineDate?: Date;
    forecastDate?: Date;
    actualDate?: Date;
    delayDays?: number;
    linkedActivity?: string;
    healthStatus?: HealthStatus;
    roadLocationName?: string;
    rawRoadCode?: string;
    packageName?: string;
    workSectionName?: string;
    assetReference?: string;
    locationSource?: ScheduleLocationSource;
  };

  type SeedProjectInput = {
    code: string;
    name: string;
    clientName: string;
    categoryCode: CategoryCode;
    projectManagerId: string;
    contractValue?: number;
    completionPct: number;
    plannedProgress: number;
    actualProgress: number;
    healthStatus: HealthStatus;
    delayedApprovals?: number;
    blockedItems?: number;
    billingReadyAmount?: number | null;
    topIssue?: string | null;
    topIssueAgeDays?: number | null;
    plannedStart?: Date;
    plannedFinish?: Date;
    forecastFinish?: Date;
    document?: SeedDocumentInput;
    documents?: SeedDocumentInput[];
    activities?: SeedActivityInput[];
    milestones?: SeedMilestoneInput[];
  };

  type SeededRoadLocation = {
    id: string;
    name: string;
    normalizedName: string;
    roadCode: string;
  };

  type SeedResourceInput = {
    name: string;
    email: string;
    phone?: string;
    designation?: string;
    discipline?: string;
    employeeCode?: string;
    userId?: string;
  };

  type SeedProjectResourceAssignmentInput = {
    projectCode: string;
    resourceEmail: string;
    roadLocationName?: string;
    scope: ResourceAssignmentScope;
    packageName?: string;
    workSectionName?: string;
    plannedStart?: Date;
    plannedFinish?: Date;
    remarks?: string;
  };

  /* ---------------------------------- */
  /* LOOKUP TABLES */
  /* ---------------------------------- */

  async function seedLookupTables() {
    const documentationStages = [
      {
        code: "pre-construction",
        label: "Pre-construction",
        displayOrder: 1,
      },
      {
        code: "design",
        label: "Design",
        displayOrder: 2,
      },
      {
        code: "procurement",
        label: "Procurement",
        displayOrder: 3,
      },
      {
        code: "construction",
        label: "Construction",
        displayOrder: 4,
      },
      {
        code: "testing-commissioning",
        label: "Testing & commissioning",
        displayOrder: 5,
      },
      {
        code: "closeout",
        label: "Closeout",
        displayOrder: 6,
      },
    ];

    for (const stage of documentationStages) {
      await prisma.documentationStageLookup.upsert({
        where: { code: stage.code },
        update: {
          label: stage.label,
          displayOrder: stage.displayOrder,
          isActive: true,
        },
        create: {
          code: stage.code,
          label: stage.label,
          displayOrder: stage.displayOrder,
          isActive: true,
        },
      });
    }

    const documentApprovalStatuses = [
      {
        code: "in-preparation",
        label: "In preparation",
        severity: "purple",
        displayOrder: 1,
      },
      {
        code: "not-submitted",
        label: "Not Submitted",
        severity: "purple",
        displayOrder: 2,
      },
      {
        code: "internal-review",
        label: "Internal Review",
        severity: "amber",
        displayOrder: 3,
      },
      {
        code: "under-review",
        label: "Under review",
        severity: "amber",
        displayOrder: 4,
      },
      {
        code: "consultant-review",
        label: "Consultant Review",
        severity: "amber",
        displayOrder: 5,
      },
      {
        code: "client-pending",
        label: "Client Pending",
        severity: "red",
        displayOrder: 6,
      },
      {
        code: "at-risk",
        label: "At risk",
        severity: "amber",
        displayOrder: 7,
      },
      {
        code: "overdue",
        label: "Overdue",
        severity: "red",
        displayOrder: 8,
      },
      {
        code: "resubmit",
        label: "Resubmit",
        severity: "red",
        displayOrder: 9,
      },
      {
        code: "approved",
        label: "Approved",
        severity: "green",
        displayOrder: 10,
      },
      {
        code: "rejected",
        label: "Rejected",
        severity: "red",
        displayOrder: 11,
      },
      {
        code: "closed",
        label: "Closed",
        severity: "green",
        displayOrder: 12,
      },
    ];

    for (const item of documentApprovalStatuses) {
      await prisma.documentApprovalStatusLookup.upsert({
        where: { code: item.code },
        update: {
          label: item.label,
          severity: item.severity,
          displayOrder: item.displayOrder,
          isActive: true,
        },
        create: {
          code: item.code,
          label: item.label,
          severity: item.severity,
          displayOrder: item.displayOrder,
          isActive: true,
        },
      });
    }

    const documentDisciplines = [
      { code: "its", label: "ITS", displayOrder: 1 },
      { code: "civil", label: "Civil", displayOrder: 2 },
      { code: "electrical", label: "Electrical", displayOrder: 3 },
      { code: "testing", label: "Testing", displayOrder: 4 },
      { code: "material", label: "Material", displayOrder: 5 },
      { code: "om", label: "O&M", displayOrder: 6 },
    ];

    for (const item of documentDisciplines) {
      await prisma.documentDisciplineLookup.upsert({
        where: { code: item.code },
        update: {
          label: item.label,
          displayOrder: item.displayOrder,
          isActive: true,
        },
        create: {
          code: item.code,
          label: item.label,
          displayOrder: item.displayOrder,
          isActive: true,
        },
      });
    }

    const documentOwners = [
      { code: "engineering", label: "Engineering", displayOrder: 1 },
      { code: "document-control", label: "Document Control", displayOrder: 2 },
      { code: "client", label: "Client", displayOrder: 3 },
      { code: "consultant", label: "Consultant", displayOrder: 4 },
      { code: "qaqc", label: "QA/QC", displayOrder: 5 },
      { code: "site-team", label: "Site Team", displayOrder: 6 },
      { code: "procurement", label: "Procurement", displayOrder: 7 },
    ];

    for (const item of documentOwners) {
      await prisma.documentOwnerLookup.upsert({
        where: { code: item.code },
        update: {
          label: item.label,
          displayOrder: item.displayOrder,
          isActive: true,
        },
        create: {
          code: item.code,
          label: item.label,
          displayOrder: item.displayOrder,
          isActive: true,
        },
      });
    }

    await seedDocumentWorkflowStatuses();

    const projectHealthStatuses = [
      {
        code: "ON_TRACK",
        label: "On track",
        severity: "success",
        displayOrder: 1,
      },
      {
        code: "AT_RISK",
        label: "At risk",
        severity: "warning",
        displayOrder: 2,
      },
      {
        code: "DELAYED",
        label: "Delayed",
        severity: "warning",
        displayOrder: 3,
      },
      {
        code: "CRITICAL",
        label: "Critical",
        severity: "danger",
        displayOrder: 4,
      },
    ];

    for (const status of projectHealthStatuses) {
      await prisma.projectHealthStatusLookup.upsert({
        where: { code: status.code },
        update: {
          label: status.label,
          severity: status.severity,
          displayOrder: status.displayOrder,
          isActive: true,
        },
        create: {
          code: status.code,
          label: status.label,
          severity: status.severity,
          displayOrder: status.displayOrder,
          isActive: true,
        },
      });
    }

    const milestoneStatuses = [
      {
        code: "complete",
        label: "Complete",
        severity: "success",
        displayOrder: 1,
      },
      {
        code: "delayed",
        label: "Delayed",
        severity: "danger",
        displayOrder: 2,
      },
      {
        code: "at-risk",
        label: "At risk",
        severity: "warning",
        displayOrder: 3,
      },
      {
        code: "upcoming",
        label: "Upcoming",
        severity: "neutral",
        displayOrder: 4,
      },
    ];

    for (const status of milestoneStatuses) {
      await prisma.milestoneStatusLookup.upsert({
        where: { code: status.code },
        update: {
          label: status.label,
          severity: status.severity,
          displayOrder: status.displayOrder,
          isActive: true,
        },
        create: {
          code: status.code,
          label: status.label,
          severity: status.severity,
          displayOrder: status.displayOrder,
          isActive: true,
        },
      });
    }

    const activitySeverities = [
      {
        code: "success",
        label: "Success",
        displayOrder: 1,
      },
      {
        code: "warning",
        label: "Warning",
        displayOrder: 2,
      },
      {
        code: "danger",
        label: "Danger",
        displayOrder: 3,
      },
    ];

    for (const severity of activitySeverities) {
      await prisma.activitySeverityLookup.upsert({
        where: { code: severity.code },
        update: {
          label: severity.label,
          displayOrder: severity.displayOrder,
          isActive: true,
        },
        create: {
          code: severity.code,
          label: severity.label,
          displayOrder: severity.displayOrder,
          isActive: true,
        },
      });
    }

    console.log("Lookup tables seeded.");
  }

  await seedLookupTables();

  /* ---------------------------------- */
  /* HELPERS */
  /* ---------------------------------- */

  function getDocumentationDueDate(record: SeedDocumentationStatusRecord) {
    if (record.overdueDays && record.overdueDays > 0) {
      return new Date(Date.now() - record.overdueDays * DAY_MS);
    }

    if (
      record.approvalStatusCode === "approved" ||
      record.approvalStatusCode === "rejected"
    ) {
      return record.submittedAt;
    }

    return new Date(Date.now() + 21 * DAY_MS);
  }

  async function seedProject(input: SeedProjectInput) {
    const category = categoryMap[input.categoryCode];

    const projectData = {
      name: input.name,
      clientName: input.clientName,
      portfolio: category.code,
      portfolioCategoryId: category.id,
      projectManagerId: input.projectManagerId,
      contractValue: input.contractValue ?? null,
      completionPct: input.completionPct,
      plannedProgress: input.plannedProgress,
      actualProgress: input.actualProgress,
      healthStatus: input.healthStatus,
      delayedApprovals: input.delayedApprovals ?? 0,
      blockedItems: input.blockedItems ?? 0,
      billingReadyAmount: input.billingReadyAmount ?? null,
      topIssue: input.topIssue ?? null,
      topIssueAgeDays: input.topIssueAgeDays ?? null,
      plannedStart: input.plannedStart ?? null,
      plannedFinish: input.plannedFinish ?? null,
      forecastFinish: input.forecastFinish ?? null,
      status: RecordStatus.ACTIVE,
    };

    const project = await prisma.project.upsert({
      where: { code: input.code },
      update: projectData,
      create: {
        code: input.code,
        ...projectData,
      },
    });

    let primaryDocument: { id: string } | null = null;

    async function upsertPlanningDocument(
      projectId: string,
      doc: SeedDocumentInput,
    ) {
      const existingDocument = await prisma.planningDocument.findFirst({
        where: {
          projectId,
          fileName: doc.fileName,
          revision: doc.revision,
          stageCode: doc.stageCode ?? "pre-construction",
        },
      });

      const approvalStatusCode = doc.approvalStatusCode ?? "in-preparation";

      const documentData = {
        planType: doc.planType ?? "BASELINE",
        stageCode: doc.stageCode ?? "pre-construction",
        approvalStatusCode,
        workflowStatusCode: doc.workflowStatusCode ?? "draft",
        approver: doc.approver ?? null,
        submittedAt: doc.submittedAt ?? null,
        dueDate: doc.dueDate ?? null,
        approvedAt:
          doc.approvedAt ??
          (approvalStatusCode === "approved" && doc.submittedAt
            ? addDays(doc.submittedAt, 4)
            : null),
        count: doc.count ?? 1,
        baselineStart: doc.baselineStart ?? null,
        baselineFinish: doc.baselineFinish ?? null,
        forecastFinish: doc.forecastFinish ?? null,
        status: RecordStatus.ACTIVE,
        uploadedBy: doc.uploadedBy ?? admin.name,
      };

      if (existingDocument) {
        return prisma.planningDocument.update({
          where: { id: existingDocument.id },
          data: documentData,
        });
      }

      return prisma.planningDocument.create({
        data: {
          projectId,
          fileName: doc.fileName,
          revision: doc.revision,
          ...documentData,
        },
      });
    }

    const documentInputs =
      input.documents && input.documents.length > 0
        ? input.documents
        : input.document
          ? [input.document]
          : [];

    for (const doc of documentInputs) {
      const savedDocument = await upsertPlanningDocument(project.id, doc);

      if (!primaryDocument) {
        primaryDocument = savedDocument;
      }
    }

    if (input.activities?.length) {
      for (const activity of input.activities) {
        const matchedRoadLocation = findRoadLocationByName(
          activity.roadLocationName ?? activity.location,
        );

        if (matchedRoadLocation) {
          await prisma.projectRoadLocation.upsert({
            where: {
              projectId_roadLocationId: {
                projectId: project.id,
                roadLocationId: matchedRoadLocation.id,
              },
            },
            update: {},
            create: {
              projectId: project.id,
              roadLocationId: matchedRoadLocation.id,
            },
          });
        }

        const activityLocationData = {
          location: activity.location ?? activity.roadLocationName ?? null,
          roadLocationId: matchedRoadLocation?.id ?? null,
          rawLocationName:
            activity.roadLocationName ?? activity.location ?? null,
          rawRoadCode:
            activity.rawRoadCode ?? matchedRoadLocation?.roadCode ?? null,
          packageName: activity.packageName ?? null,
          workSectionName: activity.workSectionName ?? null,
          assetReference: activity.assetReference ?? null,
          locationSource:
            activity.locationSource ??
            (matchedRoadLocation
              ? ScheduleLocationSource.EXCEL_PARENT_ROW
              : ScheduleLocationSource.NONE),
        };

        await prisma.planningActivity.upsert({
          where: {
            projectId_activityId: {
              projectId: project.id,
              activityId: activity.activityId,
            },
          },
          update: {
            documentId: primaryDocument?.id ?? null,
            wbsCode: activity.wbsCode ?? null,
            activityName: activity.activityName,
            discipline: activity.discipline ?? null,
            durationDays: activity.durationDays ?? null,
            plannedStart: activity.plannedStart ?? null,
            plannedFinish: activity.plannedFinish ?? null,
            actualStart: activity.actualStart ?? null,
            actualFinish: activity.actualFinish ?? null,
            floatDays: activity.floatDays ?? null,
            percentComplete: activity.percentComplete ?? 0,
            owner: activity.owner ?? null,
            isCritical: activity.isCritical ?? false,
            healthStatus: activity.healthStatus ?? HealthStatus.ON_TRACK,
            ...activityLocationData,
          },
          create: {
            projectId: project.id,
            documentId: primaryDocument?.id ?? null,
            wbsCode: activity.wbsCode ?? null,
            activityId: activity.activityId,
            activityName: activity.activityName,
            discipline: activity.discipline ?? null,
            durationDays: activity.durationDays ?? null,
            plannedStart: activity.plannedStart ?? null,
            plannedFinish: activity.plannedFinish ?? null,
            actualStart: activity.actualStart ?? null,
            actualFinish: activity.actualFinish ?? null,
            floatDays: activity.floatDays ?? null,
            percentComplete: activity.percentComplete ?? 0,
            owner: activity.owner ?? null,
            isCritical: activity.isCritical ?? false,
            healthStatus: activity.healthStatus ?? HealthStatus.ON_TRACK,
            ...activityLocationData,
          },
        });
      }
    }

    if (input.milestones?.length) {
      for (const milestone of input.milestones) {
        const existingMilestone = await prisma.planningMilestone.findFirst({
          where: {
            projectId: project.id,
            milestoneCode: milestone.milestoneCode ?? null,
            milestoneName: milestone.milestoneName,
          },
        });

        const matchedRoadLocation = findRoadLocationByName(
          milestone.roadLocationName,
        );

        if (matchedRoadLocation) {
          await prisma.projectRoadLocation.upsert({
            where: {
              projectId_roadLocationId: {
                projectId: project.id,
                roadLocationId: matchedRoadLocation.id,
              },
            },
            update: {},
            create: {
              projectId: project.id,
              roadLocationId: matchedRoadLocation.id,
            },
          });
        }

        const milestoneData = {
          documentId: primaryDocument?.id ?? null,
          baselineDate: milestone.baselineDate ?? null,
          forecastDate: milestone.forecastDate ?? null,
          actualDate: milestone.actualDate ?? null,
          delayDays: milestone.delayDays ?? 0,
          linkedActivity: milestone.linkedActivity ?? null,
          healthStatus: milestone.healthStatus ?? HealthStatus.ON_TRACK,

          roadLocationId: matchedRoadLocation?.id ?? null,
          rawLocationName: milestone.roadLocationName ?? null,
          rawRoadCode:
            milestone.rawRoadCode ?? matchedRoadLocation?.roadCode ?? null,
          packageName: milestone.packageName ?? null,
          workSectionName: milestone.workSectionName ?? null,
          assetReference: milestone.assetReference ?? null,
          locationSource:
            milestone.locationSource ??
            (matchedRoadLocation
              ? ScheduleLocationSource.EXCEL_PARENT_ROW
              : ScheduleLocationSource.NONE),
        };

        if (existingMilestone) {
          await prisma.planningMilestone.update({
            where: { id: existingMilestone.id },
            data: milestoneData,
          });
        } else {
          await prisma.planningMilestone.create({
            data: {
              projectId: project.id,
              milestoneCode: milestone.milestoneCode ?? null,
              milestoneName: milestone.milestoneName,
              ...milestoneData,
            },
          });
        }
      }
    }

    return project;
  }

  async function seedDocumentationStatusRecords() {
    const records: SeedDocumentationStatusRecord[] = [
      {
        id: "pre-its-1",
        stageCode: "pre-construction",
        categoryCode: "its",
        document: "Permit drawings set A",
        projectCode: "PRJ-001",
        revision: "R03",
        submittedAt: d("2026-03-17"),
        approver: "Authority",
        approvalStatusCode: "overdue",
        count: 18,
        overdueDays: 18,
      },
      {
        id: "pre-its-2",
        stageCode: "pre-construction",
        categoryCode: "its",
        document: "Traffic diversion concept",
        projectCode: "PRJ-002",
        revision: "R01",
        submittedAt: d("2026-03-28"),
        approver: "Client",
        approvalStatusCode: "under-review",
        count: 12,
      },
      {
        id: "pre-traffic-1",
        stageCode: "pre-construction",
        categoryCode: "traffic",
        document: "NOC submission package",
        projectCode: "PRJ-003",
        revision: "R02",
        submittedAt: d("2026-03-20"),
        approver: "Authority",
        approvalStatusCode: "at-risk",
        count: 15,
        overdueDays: 9,
      },
      {
        id: "pre-traffic-2",
        stageCode: "pre-construction",
        categoryCode: "traffic",
        document: "Project execution plan",
        projectCode: "PRJ-004",
        revision: "R02",
        submittedAt: d("2026-04-01"),
        approver: "Client",
        approvalStatusCode: "approved",
        count: 21,
      },
      {
        id: "pre-its-maint-1",
        stageCode: "pre-construction",
        categoryCode: "its-maint",
        document: "Maintenance readiness plan",
        projectCode: "PRJ-005",
        revision: "R01",
        submittedAt: d("2026-03-24"),
        approver: "Internal",
        approvalStatusCode: "under-review",
        count: 10,
      },
      {
        id: "pre-traffic-maint-1",
        stageCode: "pre-construction",
        categoryCode: "traffic-maint",
        document: "Signal maintenance method statement",
        projectCode: "PRJ-007",
        revision: "R02",
        submittedAt: d("2026-03-22"),
        approver: "Consultant",
        approvalStatusCode: "overdue",
        count: 11,
        overdueDays: 14,
      },
      {
        id: "design-its-1",
        stageCode: "design",
        categoryCode: "its",
        document: "ITS architecture drawings",
        projectCode: "PRJ-001",
        revision: "R04",
        submittedAt: d("2026-03-12"),
        approver: "Consultant",
        approvalStatusCode: "overdue",
        count: 22,
        overdueDays: 21,
      },
      {
        id: "design-traffic-1",
        stageCode: "design",
        categoryCode: "traffic",
        document: "Signal layout design",
        projectCode: "PRJ-003",
        revision: "R03",
        submittedAt: d("2026-03-25"),
        approver: "Client",
        approvalStatusCode: "under-review",
        count: 26,
      },
      {
        id: "design-its-maint-1",
        stageCode: "design",
        categoryCode: "its-maint",
        document: "CCTV relocation design",
        projectCode: "PRJ-005",
        revision: "R02",
        submittedAt: d("2026-03-18"),
        approver: "Consultant",
        approvalStatusCode: "approved",
        count: 18,
      },
      {
        id: "design-traffic-maint-1",
        stageCode: "design",
        categoryCode: "traffic-maint",
        document: "Controller cabinet modification drawing",
        projectCode: "PRJ-007",
        revision: "R01",
        submittedAt: d("2026-03-29"),
        approver: "Consultant",
        approvalStatusCode: "at-risk",
        count: 14,
        overdueDays: 8,
      },
      {
        id: "proc-its-1",
        stageCode: "procurement",
        categoryCode: "its",
        document: "Camera technical submittal",
        projectCode: "PRJ-001",
        revision: "R02",
        submittedAt: d("2026-03-20"),
        approver: "Consultant",
        approvalStatusCode: "under-review",
        count: 16,
      },
      {
        id: "proc-traffic-1",
        stageCode: "procurement",
        categoryCode: "traffic",
        document: "Signal pole material approval",
        projectCode: "PRJ-004",
        revision: "R01",
        submittedAt: d("2026-03-23"),
        approver: "Client",
        approvalStatusCode: "overdue",
        count: 13,
        overdueDays: 11,
      },
      {
        id: "proc-its-maint-1",
        stageCode: "procurement",
        categoryCode: "its-maint",
        document: "Network switch compliance sheet",
        projectCode: "PRJ-005",
        revision: "R01",
        submittedAt: d("2026-03-30"),
        approver: "Consultant",
        approvalStatusCode: "approved",
        count: 19,
      },
      {
        id: "proc-traffic-maint-1",
        stageCode: "procurement",
        categoryCode: "traffic-maint",
        document: "Spare signal heads vendor approval",
        projectCode: "PRJ-008",
        revision: "R02",
        submittedAt: d("2026-04-02"),
        approver: "Internal",
        approvalStatusCode: "in-preparation",
        count: 9,
      },
      {
        id: "con-its-1",
        stageCode: "construction",
        categoryCode: "its",
        document: "Site inspection report",
        projectCode: "PRJ-002",
        revision: "R01",
        submittedAt: d("2026-03-19"),
        approver: "Consultant",
        approvalStatusCode: "overdue",
        count: 17,
        overdueDays: 15,
      },
      {
        id: "con-traffic-1",
        stageCode: "construction",
        categoryCode: "traffic",
        document: "Road marking inspection request",
        projectCode: "PRJ-003",
        revision: "R02",
        submittedAt: d("2026-03-28"),
        approver: "Consultant",
        approvalStatusCode: "at-risk",
        count: 12,
        overdueDays: 9,
      },
      {
        id: "con-its-maint-1",
        stageCode: "construction",
        categoryCode: "its-maint",
        document: "Daily maintenance report",
        projectCode: "PRJ-006",
        revision: "R01",
        submittedAt: d("2026-04-03"),
        approver: "Internal",
        approvalStatusCode: "approved",
        count: 25,
      },
      {
        id: "con-traffic-maint-1",
        stageCode: "construction",
        categoryCode: "traffic-maint",
        document: "Work permit checklist",
        projectCode: "PRJ-007",
        revision: "R01",
        submittedAt: d("2026-04-04"),
        approver: "Internal",
        approvalStatusCode: "under-review",
        count: 11,
      },
      {
        id: "tc-its-1",
        stageCode: "testing-commissioning",
        categoryCode: "its",
        document: "FAT report",
        projectCode: "PRJ-001",
        revision: "R01",
        submittedAt: d("2026-03-30"),
        approver: "Consultant",
        approvalStatusCode: "under-review",
        count: 14,
      },
      {
        id: "tc-traffic-1",
        stageCode: "testing-commissioning",
        categoryCode: "traffic",
        document: "Signal testing procedure",
        projectCode: "PRJ-004",
        revision: "R02",
        submittedAt: d("2026-03-24"),
        approver: "Consultant",
        approvalStatusCode: "overdue",
        count: 10,
        overdueDays: 10,
      },
      {
        id: "tc-its-maint-1",
        stageCode: "testing-commissioning",
        categoryCode: "its-maint",
        document: "CCTV commissioning checklist",
        projectCode: "PRJ-006",
        revision: "R01",
        submittedAt: d("2026-03-28"),
        approver: "Client",
        approvalStatusCode: "at-risk",
        count: 8,
        overdueDays: 8,
      },
      {
        id: "tc-traffic-maint-1",
        stageCode: "testing-commissioning",
        categoryCode: "traffic-maint",
        document: "Controller loop test sheet",
        projectCode: "PRJ-008",
        revision: "R02",
        submittedAt: d("2026-03-21"),
        approver: "Consultant",
        approvalStatusCode: "approved",
        count: 13,
      },
      {
        id: "close-its-1",
        stageCode: "closeout",
        categoryCode: "its",
        document: "As-built ITS drawings",
        projectCode: "PRJ-002",
        revision: "R04",
        submittedAt: d("2026-03-23"),
        approver: "Consultant",
        approvalStatusCode: "overdue",
        count: 9,
        overdueDays: 12,
      },
      {
        id: "close-traffic-1",
        stageCode: "closeout",
        categoryCode: "traffic",
        document: "Final completion certificate",
        projectCode: "PRJ-003",
        revision: "R01",
        submittedAt: d("2026-04-02"),
        approver: "Authority",
        approvalStatusCode: "under-review",
        count: 7,
      },
      {
        id: "close-its-maint-1",
        stageCode: "closeout",
        categoryCode: "its-maint",
        document: "O&M manuals",
        projectCode: "PRJ-006",
        revision: "R02",
        submittedAt: d("2026-03-27"),
        approver: "Client",
        approvalStatusCode: "at-risk",
        count: 6,
        overdueDays: 9,
      },
      {
        id: "close-traffic-maint-1",
        stageCode: "closeout",
        categoryCode: "traffic-maint",
        document: "Handover dossier",
        projectCode: "PRJ-008",
        revision: "R02",
        submittedAt: d("2026-03-19"),
        approver: "Consultant",
        approvalStatusCode: "approved",
        count: 16,
      },
    ];

    for (const record of records) {
      const project = await prisma.project.findUnique({
        where: {
          code: record.projectCode,
        },
      });

      if (!project) {
        throw new Error(
          `Cannot seed documentation record ${record.id}: project ${record.projectCode} not found`,
        );
      }

      const dueDate = getDocumentationDueDate(record);

      const existingDocument = await prisma.planningDocument.findFirst({
        where: {
          projectId: project.id,
          fileName: record.document,
          revision: record.revision,
          stageCode: record.stageCode,
        },
      });

      const data = {
        planType: record.stageCode,
        stageCode: record.stageCode,
        approvalStatusCode: record.approvalStatusCode,
        workflowStatusCode: "draft",
        approver: record.approver,
        submittedAt: record.submittedAt,
        dueDate,
        approvedAt:
          record.approvalStatusCode === "approved"
            ? addDays(record.submittedAt, 4)
            : null,
        count: record.count,
        status: RecordStatus.ACTIVE,
        uploadedBy: admin.name,
      };

      if (existingDocument) {
        await prisma.planningDocument.update({
          where: {
            id: existingDocument.id,
          },
          data,
        });
      } else {
        await prisma.planningDocument.create({
          data: {
            projectId: project.id,
            fileName: record.document,
            revision: record.revision,
            ...data,
          },
        });
      }
    }

    console.log("Documentation status records seeded.");
  }

  async function seedRevenueBilling() {
    const billingData = [
      {
        projectCode: "PRJ-001",
        contractValue: 42000000,
        invoicedToDate: 17500000,
        billingReadyAmount: 1800000,
        overdueReceivables: 600000,
      },
      {
        projectCode: "PRJ-002",
        contractValue: 18000000,
        invoicedToDate: 9800000,
        billingReadyAmount: 1100000,
        overdueReceivables: 300000,
      },
      {
        projectCode: "PRJ-003",
        contractValue: 18500000,
        invoicedToDate: 12500000,
        billingReadyAmount: 2000000,
        overdueReceivables: 450000,
      },
      {
        projectCode: "PRJ-004",
        contractValue: 22000000,
        invoicedToDate: 14500000,
        billingReadyAmount: 1500000,
        overdueReceivables: 0,
      },
      {
        projectCode: "PRJ-005",
        contractValue: 7200000,
        invoicedToDate: 5200000,
        billingReadyAmount: 1600000,
        overdueReceivables: 0,
      },
      {
        projectCode: "PRJ-006",
        contractValue: 5400000,
        invoicedToDate: 2900000,
        billingReadyAmount: 1000000,
        overdueReceivables: 250000,
      },
      {
        projectCode: "PRJ-007",
        contractValue: 6500000,
        invoicedToDate: 4700000,
        billingReadyAmount: 1100000,
        overdueReceivables: 0,
      },
      {
        projectCode: "PRJ-008",
        contractValue: 4100000,
        invoicedToDate: 2100000,
        billingReadyAmount: 1800000,
        overdueReceivables: 500000,
      },
    ];

    for (const item of billingData) {
      const project = await prisma.project.findUnique({
        where: {
          code: item.projectCode,
        },
      });

      if (!project) {
        throw new Error(
          `Cannot seed billing: project ${item.projectCode} not found`,
        );
      }

      await prisma.projectBilling.upsert({
        where: {
          projectId: project.id,
        },
        update: {
          contractValue: item.contractValue,
          invoicedToDate: item.invoicedToDate,
          billingReadyAmount: item.billingReadyAmount,
          overdueReceivables: item.overdueReceivables,
        },
        create: {
          projectId: project.id,
          contractValue: item.contractValue,
          invoicedToDate: item.invoicedToDate,
          billingReadyAmount: item.billingReadyAmount,
          overdueReceivables: item.overdueReceivables,
        },
      });
    }

    console.log("Revenue billing seeded.");
  }

  async function seedInvoices() {
    const invoices = [
      {
        invoiceNo: "INV-PRJ001-001",
        projectCode: "PRJ-001",
        amount: 9500000,
        status: InvoiceStatus.PAID,
        issueDate: d("2026-01-15"),
        dueDate: d("2026-02-14"),
        items: [
          {
            description: "Mobilization and initial works",
            amount: 4000000,
          },
          {
            description: "ITS equipment procurement",
            amount: 5500000,
          },
        ],
      },
      {
        invoiceNo: "INV-PRJ001-002",
        projectCode: "PRJ-001",
        amount: 8000000,
        status: InvoiceStatus.OVERDUE,
        issueDate: d("2026-03-01"),
        dueDate: d("2026-03-31"),
        items: [
          {
            description: "Civil and MEP progress billing",
            amount: 8000000,
          },
        ],
      },
      {
        invoiceNo: "INV-PRJ002-001",
        projectCode: "PRJ-002",
        amount: 9800000,
        status: InvoiceStatus.APPROVED,
        issueDate: d("2026-02-20"),
        dueDate: d("2026-03-21"),
        items: [
          {
            description: "Dubai Creek ITS upgrade progress billing",
            amount: 9800000,
          },
        ],
      },
      {
        invoiceNo: "INV-PRJ003-001",
        projectCode: "PRJ-003",
        amount: 12500000,
        status: InvoiceStatus.PAID,
        issueDate: d("2026-02-05"),
        dueDate: d("2026-03-06"),
        items: [
          {
            description: "Traffic signal works progress billing",
            amount: 12500000,
          },
        ],
      },
      {
        invoiceNo: "INV-PRJ004-001",
        projectCode: "PRJ-004",
        amount: 14500000,
        status: InvoiceStatus.APPROVED,
        issueDate: d("2026-03-10"),
        dueDate: d("2026-04-09"),
        items: [
          {
            description: "Road marking package progress billing",
            amount: 14500000,
          },
        ],
      },
    ];

    for (const item of invoices) {
      const project = await prisma.project.findUnique({
        where: {
          code: item.projectCode,
        },
      });

      if (!project) {
        throw new Error(
          `Cannot seed invoice ${item.invoiceNo}: project ${item.projectCode} not found`,
        );
      }

      const invoice = await prisma.invoice.upsert({
        where: {
          invoiceNo: item.invoiceNo,
        },
        update: {
          projectId: project.id,
          amount: item.amount,
          status: item.status,
          issueDate: item.issueDate,
          dueDate: item.dueDate,
        },
        create: {
          invoiceNo: item.invoiceNo,
          projectId: project.id,
          amount: item.amount,
          status: item.status,
          issueDate: item.issueDate,
          dueDate: item.dueDate,
        },
      });

      await prisma.invoiceItem.deleteMany({
        where: {
          invoiceId: invoice.id,
        },
      });

      await prisma.invoiceItem.createMany({
        data: item.items.map((invoiceItem) => ({
          invoiceId: invoice.id,
          description: invoiceItem.description,
          amount: invoiceItem.amount,
        })),
      });
    }

    console.log("Invoices seeded.");
  }

  async function upsertUserByEmail(input: {
    name: string;
    email: string;
    role: UserRole;
  }) {
    return prisma.user.upsert({
      where: {
        email: input.email,
      },
      update: {
        name: input.name,
        role: input.role,
        isActive: true,
      },
      create: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        isActive: true,
      },
    });
  }

  async function upsertResourceByEmail(input: SeedResourceInput) {
    const existingResource = await prisma.resource.findFirst({
      where: {
        email: input.email,
      },
    });

    const data = {
      name: input.name,
      type: ResourceType.FIELD_ENGINEER,
      discipline: input.discipline ?? "Civil / ITS",
      designation: input.designation ?? "Field Engineer",
      employeeCode: input.employeeCode ?? null,
      email: input.email,
      phone: input.phone ?? null,
      userId: input.userId ?? null,
      isActive: true,
    };

    if (existingResource) {
      return prisma.resource.update({
        where: {
          id: existingResource.id,
        },
        data,
      });
    }

    return prisma.resource.create({
      data,
    });
  }

  async function seedFieldResourcesAndAssignments() {
    const fieldUser1 = await upsertUserByEmail({
      name: "M. Nair",
      email: "field1@example.com",
      role: UserRole.ENGINEER,
    });

    const fieldUser2 = await upsertUserByEmail({
      name: "K. Thomas",
      email: "field2@example.com",
      role: UserRole.ENGINEER,
    });

    const fieldUser3 = await upsertUserByEmail({
      name: "Y. Khan",
      email: "field3@example.com",
      role: UserRole.ENGINEER,
    });

    await upsertResourceByEmail({
      name: "M. Nair",
      email: "field1@example.com",
      phone: "+971500000001",
      employeeCode: "FE-001",
      discipline: "Civil / Trial Trenches",
      designation: "Field Engineer",
      userId: fieldUser1.id,
    });

    await upsertResourceByEmail({
      name: "K. Thomas",
      email: "field2@example.com",
      phone: "+971500000002",
      employeeCode: "FE-002",
      discipline: "Duct / Fiber",
      designation: "Field Engineer",
      userId: fieldUser2.id,
    });

    await upsertResourceByEmail({
      name: "Y. Khan",
      email: "field3@example.com",
      phone: "+971500000003",
      employeeCode: "FE-003",
      discipline: "Traffic / ITS Maintenance",
      designation: "Field Engineer",
      userId: fieldUser3.id,
    });

    const assignments: SeedProjectResourceAssignmentInput[] = [
      {
        projectCode: "PRJ-001",
        resourceEmail: "field1@example.com",
        roadLocationName: "Al Khail Street",
        scope: ResourceAssignmentScope.ROAD_LOCATION,
        packageName: "PACKAGE 01",
        workSectionName: "TT EXECUTION FOR 25M POLE - D68/CCTV-G-02",
        plannedStart: d("2026-08-21"),
        plannedFinish: d("2026-09-02"),
        remarks: "Assigned for trial trench execution on Al Khail Street.",
      },
      {
        projectCode: "PRJ-001",
        resourceEmail: "field2@example.com",
        roadLocationName: "Al Khawaneej Road",
        scope: ResourceAssignmentScope.ROAD_LOCATION,
        packageName: "PACKAGE 01",
        workSectionName: "TT EXECUTION FOR 25M POLE - D89/CCTV-G-02",
        plannedStart: d("2026-08-25"),
        plannedFinish: d("2026-09-08"),
        remarks:
          "Assigned for trial trench and duct execution on Al Khawaneej Road.",
      },
      {
        projectCode: "PRJ-001",
        resourceEmail: "field1@example.com",
        roadLocationName: "Al Rebat St",
        scope: ResourceAssignmentScope.ROAD_LOCATION,
        packageName: "PACKAGE 01",
        workSectionName: "TT EXECUTION FOR 25M POLE - D83/CCTV-G-01",
        plannedStart: d("2026-08-29"),
        plannedFinish: d("2026-09-14"),
        remarks: "Assigned for Al Rebat Street field execution.",
      },
      {
        projectCode: "PRJ-007",
        resourceEmail: "field3@example.com",
        roadLocationName: "Sheikh Zayed Rd",
        scope: ResourceAssignmentScope.ROAD_LOCATION,
        plannedStart: d("2026-05-01"),
        plannedFinish: d("2026-06-30"),
        remarks: "Assigned for SZR signal maintenance works.",
      },
    ];

    for (const assignment of assignments) {
      const project = await prisma.project.findUnique({
        where: {
          code: assignment.projectCode,
        },
      });

      if (!project) {
        throw new Error(
          `Cannot seed resource assignment: project ${assignment.projectCode} not found`,
        );
      }

      const resource = await prisma.resource.findFirst({
        where: {
          email: assignment.resourceEmail,
        },
      });

      if (!resource) {
        throw new Error(
          `Cannot seed resource assignment: resource ${assignment.resourceEmail} not found`,
        );
      }

      const roadLocation = findRoadLocationByName(assignment.roadLocationName);

      if (assignment.roadLocationName && !roadLocation) {
        throw new Error(
          `Cannot seed resource assignment: road location ${assignment.roadLocationName} not found`,
        );
      }

      if (roadLocation) {
        await prisma.projectRoadLocation.upsert({
          where: {
            projectId_roadLocationId: {
              projectId: project.id,
              roadLocationId: roadLocation.id,
            },
          },
          update: {},
          create: {
            projectId: project.id,
            roadLocationId: roadLocation.id,
          },
        });
      }

      await prisma.projectResourceAssignment.deleteMany({
        where: {
          projectId: project.id,
          resourceId: resource.id,
          roadLocationId: roadLocation?.id ?? null,
          scope: assignment.scope,
          packageName: assignment.packageName ?? null,
          workSectionName: assignment.workSectionName ?? null,
        },
      });

      await prisma.projectResourceAssignment.create({
        data: {
          projectId: project.id,
          resourceId: resource.id,
          roadLocationId: roadLocation?.id ?? null,
          scope: assignment.scope,
          packageName: assignment.packageName ?? null,
          workSectionName: assignment.workSectionName ?? null,
          plannedStart: assignment.plannedStart ?? null,
          plannedFinish: assignment.plannedFinish ?? null,
          remarks: assignment.remarks ?? null,
          isActive: true,
        },
      });
    }

    console.log("Field resources and assignments seeded.");
  }

  async function seedSampleScheduleImportWithLocations() {
    const project = await prisma.project.findUnique({
      where: {
        code: "PRJ-001",
      },
    });

    if (!project) {
      throw new Error("Cannot seed sample schedule import: PRJ-001 not found");
    }

    const upload = await prisma.projectScheduleUpload.upsert({
      where: {
        projectId_revisionNo: {
          projectId: project.id,
          revisionNo: 1,
        },
      },
      update: {
        fileName: "PRJ-001 trial trenches baseline.xlsx",
        status: "IMPORTED",
        totalRows: 40,
        validRows: 40,
        errorRows: 0,
        sheetName: "Baseline",
        importedAt: new Date(),
      },
      create: {
        projectId: project.id,
        fileName: "PRJ-001 trial trenches baseline.xlsx",
        revisionNo: 1,
        uploadedById: admin.id,
        status: "IMPORTED",
        totalRows: 40,
        validRows: 40,
        errorRows: 0,
        sheetName: "Baseline",
        importedAt: new Date(),
      },
    });

    async function upsertWbsItem(input: {
      parentId?: string | null;
      wbsCode: string;
      wbsLevel: number;
      name: string;
      startDate?: Date;
      finishDate?: Date;
      duration?: number;
      rowNumber?: number;
      roadLocationName?: string;
      rawRoadCode?: string;
    }) {
      const roadLocation = findRoadLocationByName(input.roadLocationName);

      if (roadLocation) {
        await prisma.projectRoadLocation.upsert({
          where: {
            projectId_roadLocationId: {
              projectId: project.id,
              roadLocationId: roadLocation.id,
            },
          },
          update: {},
          create: {
            projectId: project.id,
            roadLocationId: roadLocation.id,
          },
        });
      }

      return prisma.wbsItem.upsert({
        where: {
          uploadId_wbsCode: {
            uploadId: upload.id,
            wbsCode: input.wbsCode,
          },
        },
        update: {
          parentId: input.parentId ?? null,
          wbsLevel: input.wbsLevel,
          name: input.name,
          startDate: input.startDate ?? null,
          finishDate: input.finishDate ?? null,
          duration: input.duration ?? null,
          rowNumber: input.rowNumber ?? null,
          roadLocationId: roadLocation?.id ?? null,
          rawLocationName: input.roadLocationName ?? null,
          rawRoadCode: input.rawRoadCode ?? roadLocation?.roadCode ?? null,
          locationSource: roadLocation
            ? ScheduleLocationSource.EXCEL_PARENT_ROW
            : ScheduleLocationSource.NONE,
        },
        create: {
          projectId: project.id,
          uploadId: upload.id,
          parentId: input.parentId ?? null,
          wbsCode: input.wbsCode,
          wbsLevel: input.wbsLevel,
          name: input.name,
          startDate: input.startDate ?? null,
          finishDate: input.finishDate ?? null,
          duration: input.duration ?? null,
          rowNumber: input.rowNumber ?? null,
          roadLocationId: roadLocation?.id ?? null,
          rawLocationName: input.roadLocationName ?? null,
          rawRoadCode: input.rawRoadCode ?? roadLocation?.roadCode ?? null,
          locationSource: roadLocation
            ? ScheduleLocationSource.EXCEL_PARENT_ROW
            : ScheduleLocationSource.NONE,
        },
      });
    }

    async function upsertScheduleActivity(input: {
      wbsItemId: string;
      activityCode: string;
      activityName: string;
      duration?: number;
      startDate?: Date;
      finishDate?: Date;
      rowNumber?: number;
      roadLocationName?: string;
      rawRoadCode?: string;
      packageName?: string;
      workSectionName?: string;
      assetReference?: string;
      isCritical?: boolean;
    }) {
      const roadLocation = findRoadLocationByName(input.roadLocationName);

      if (roadLocation) {
        await prisma.projectRoadLocation.upsert({
          where: {
            projectId_roadLocationId: {
              projectId: project.id,
              roadLocationId: roadLocation.id,
            },
          },
          update: {},
          create: {
            projectId: project.id,
            roadLocationId: roadLocation.id,
          },
        });
      }

      return prisma.scheduleActivity.upsert({
        where: {
          uploadId_activityCode: {
            uploadId: upload.id,
            activityCode: input.activityCode,
          },
        },
        update: {
          wbsItemId: input.wbsItemId,
          activityName: input.activityName,
          duration: input.duration ?? null,
          startDate: input.startDate ?? null,
          finishDate: input.finishDate ?? null,
          rowNumber: input.rowNumber ?? null,
          isCritical: input.isCritical ?? false,
          status: ActivityStatus.NOT_STARTED,
          roadLocationId: roadLocation?.id ?? null,
          rawLocationName: input.roadLocationName ?? null,
          rawRoadCode: input.rawRoadCode ?? roadLocation?.roadCode ?? null,
          packageName: input.packageName ?? null,
          workSectionName: input.workSectionName ?? null,
          assetReference: input.assetReference ?? null,
          locationSource: roadLocation
            ? ScheduleLocationSource.EXCEL_PARENT_ROW
            : ScheduleLocationSource.NONE,
        },
        create: {
          projectId: project.id,
          uploadId: upload.id,
          wbsItemId: input.wbsItemId,
          activityCode: input.activityCode,
          activityName: input.activityName,
          duration: input.duration ?? null,
          startDate: input.startDate ?? null,
          finishDate: input.finishDate ?? null,
          rowNumber: input.rowNumber ?? null,
          isCritical: input.isCritical ?? false,
          status: ActivityStatus.NOT_STARTED,
          roadLocationId: roadLocation?.id ?? null,
          rawLocationName: input.roadLocationName ?? null,
          rawRoadCode: input.rawRoadCode ?? roadLocation?.roadCode ?? null,
          packageName: input.packageName ?? null,
          workSectionName: input.workSectionName ?? null,
          assetReference: input.assetReference ?? null,
          locationSource: roadLocation
            ? ScheduleLocationSource.EXCEL_PARENT_ROW
            : ScheduleLocationSource.NONE,
        },
      });
    }

    const package01 = await upsertWbsItem({
      wbsCode: "PKG-01",
      wbsLevel: 6,
      name: "PACKAGE 01 (25m - 4, 10m - 0, NDRC - 0, Duct - 40m)",
      startDate: d("2026-07-24"),
      finishDate: d("2026-09-14"),
      duration: 53,
      rowNumber: 6,
    });

    const alKhailStreet = await upsertWbsItem({
      parentId: package01.id,
      wbsCode: "PKG-01-AL-KHAIL-STREET",
      wbsLevel: 7,
      name: "AL KHAIL STREET",
      startDate: d("2026-07-24"),
      finishDate: d("2026-09-04"),
      duration: 43,
      rowNumber: 7,
      roadLocationName: "Al Khail Street",
      rawRoadCode: "D68",
    });

    const alKhailPoleWork = await upsertWbsItem({
      parentId: alKhailStreet.id,
      wbsCode: "PKG-01-AL-KHAIL-D68-CCTV-G-02",
      wbsLevel: 8,
      name: "TT EXECUTION FOR 25M POLE - D68/CCTV-G-02",
      startDate: d("2026-07-24"),
      finishDate: d("2026-09-02"),
      duration: 41,
      rowNumber: 8,
      roadLocationName: "Al Khail Street",
      rawRoadCode: "D68",
    });

    await upsertScheduleActivity({
      wbsItemId: alKhailPoleWork.id,
      activityCode: "PRE-TEX-V-T1-P1-1912",
      activityName: "Site Setting out",
      duration: 1,
      startDate: d("2026-08-21"),
      finishDate: d("2026-08-21"),
      rowNumber: 9,
      roadLocationName: "Al Khail Street",
      rawRoadCode: "D68",
      packageName: "PACKAGE 01",
      workSectionName: "TT EXECUTION FOR 25M POLE - D68/CCTV-G-02",
      assetReference: "D68/CCTV-G-02",
    });

    await upsertScheduleActivity({
      wbsItemId: alKhailPoleWork.id,
      activityCode: "PRE-TEX-V-T1-P1-1916",
      activityName: "Excavation",
      duration: 1,
      startDate: d("2026-08-22"),
      finishDate: d("2026-08-22"),
      rowNumber: 13,
      roadLocationName: "Al Khail Street",
      rawRoadCode: "D68",
      packageName: "PACKAGE 01",
      workSectionName: "TT EXECUTION FOR 25M POLE - D68/CCTV-G-02",
      assetReference: "D68/CCTV-G-02",
      isCritical: true,
    });

    await upsertScheduleActivity({
      wbsItemId: alKhailPoleWork.id,
      activityCode: "PRE-TEX-V-T1-P1-1918",
      activityName: "Backfilling",
      duration: 1,
      startDate: d("2026-09-02"),
      finishDate: d("2026-09-02"),
      rowNumber: 15,
      roadLocationName: "Al Khail Street",
      rawRoadCode: "D68",
      packageName: "PACKAGE 01",
      workSectionName: "TT EXECUTION FOR 25M POLE - D68/CCTV-G-02",
      assetReference: "D68/CCTV-G-02",
    });

    const alKhawaneejRoad = await upsertWbsItem({
      parentId: package01.id,
      wbsCode: "PKG-01-AL-KHAWANEEJ-ROAD",
      wbsLevel: 7,
      name: "AL KHAWANEEJ ROAD",
      startDate: d("2026-07-24"),
      finishDate: d("2026-09-08"),
      duration: 47,
      rowNumber: 30,
      roadLocationName: "Al Khawaneej Road",
      rawRoadCode: "D89",
    });

    const alKhawaneejPoleWork = await upsertWbsItem({
      parentId: alKhawaneejRoad.id,
      wbsCode: "PKG-01-AL-KHAWANEEJ-D89-CCTV-G-02",
      wbsLevel: 8,
      name: "TT EXECUTION FOR 25M POLE - D89/CCTV-G-02",
      startDate: d("2026-07-24"),
      finishDate: d("2026-09-06"),
      duration: 45,
      rowNumber: 31,
      roadLocationName: "Al Khawaneej Road",
      rawRoadCode: "D89",
    });

    await upsertScheduleActivity({
      wbsItemId: alKhawaneejPoleWork.id,
      activityCode: "PRE-TEX-V-T1-P1-2170",
      activityName: "Site Setting out",
      duration: 1,
      startDate: d("2026-08-25"),
      finishDate: d("2026-08-25"),
      rowNumber: 32,
      roadLocationName: "Al Khawaneej Road",
      rawRoadCode: "D89",
      packageName: "PACKAGE 01",
      workSectionName: "TT EXECUTION FOR 25M POLE - D89/CCTV-G-02",
      assetReference: "D89/CCTV-G-02",
    });

    const alRebatStreet = await upsertWbsItem({
      parentId: package01.id,
      wbsCode: "PKG-01-AL-REBAT-ST",
      wbsLevel: 7,
      name: "AL REBAT ST",
      startDate: d("2026-07-24"),
      finishDate: d("2026-09-14"),
      duration: 53,
      rowNumber: 60,
      roadLocationName: "Al Rebat St",
      rawRoadCode: "D83",
    });

    const alRebatPoleWork = await upsertWbsItem({
      parentId: alRebatStreet.id,
      wbsCode: "PKG-01-AL-REBAT-D83-CCTV-G-01",
      wbsLevel: 8,
      name: "TT EXECUTION FOR 25M POLE - D83/CCTV-G-01",
      startDate: d("2026-07-24"),
      finishDate: d("2026-09-10"),
      duration: 49,
      rowNumber: 61,
      roadLocationName: "Al Rebat St",
      rawRoadCode: "D83",
    });

    await upsertScheduleActivity({
      wbsItemId: alRebatPoleWork.id,
      activityCode: "PRE-TEX-V-T1-P1-1950",
      activityName: "Site Setting out",
      duration: 1,
      startDate: d("2026-08-29"),
      finishDate: d("2026-08-29"),
      rowNumber: 62,
      roadLocationName: "Al Rebat St",
      rawRoadCode: "D83",
      packageName: "PACKAGE 01",
      workSectionName: "TT EXECUTION FOR 25M POLE - D83/CCTV-G-01",
      assetReference: "D83/CCTV-G-01",
    });

    console.log("Sample schedule import with road locations seeded.");
  }

  await prisma.systemSetting.upsert({
    where: { key: "jwt_expiry" },
    update: {},
    create: {
      key: "jwt_expiry",
      label: "JWT Expiry",
      value: "1 day",
      category: "Security",
      status: "Active",
      description: "Authentication token expiry duration",
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "excel_upload_max_size" },
    update: {},
    create: {
      key: "excel_upload_max_size",
      label: "Excel Upload Max Size",
      value: "25MB",
      category: "Planning",
      status: "Active",
      description: "Maximum upload size for planning Excel files",
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "cors_origin" },
    update: {},
    create: {
      key: "cors_origin",
      label: "CORS Origin",
      value:
        "http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005",
      category: "Security",
      status: "Pending",
      description: "Allowed frontend origin",
    },
  });

  /* ---------------------------------- */
  /* PROJECTS */
  /* ---------------------------------- */

  async function seedRoadLocations() {
    const roadLocations = [
      {
        name: "Al Khail Street",
        roadCode: "D68",
        aliases: ["AL KHAIL STREET", "AL KHAIL ST"],
      },
      {
        name: "Al Khawaneej Road",
        roadCode: "D89",
        aliases: ["AL KHAWANEEJ ROAD", "AL KHAWANEEJ RD"],
      },
      {
        name: "Al Rebat St",
        roadCode: "D83",
        aliases: ["AL REBAT ST", "AL REBAT STREET"],
      },
      {
        name: "Marakech Street",
        roadCode: "D68",
        aliases: ["MARAKECH STREET", "MARRAKECH STREET", "MARAKECH ST"],
      },
      {
        name: "Riyadh Street",
        roadCode: "D81",
        aliases: ["RIYADH STREET", "RIYADH ST"],
      },
      {
        name: "Sheikh Zayed Rd",
        roadCode: "E11",
        aliases: ["SHEIKH ZAYED ROAD", "SHEIKH ZAYED RD", "SZR"],
      },
      {
        name: "AL ASAYEL STREET",
        roadCode: "D72",
        aliases: ["AL ASAYEL STREET", "AL ASAYEL ST"],
      },
      {
        name: "Al Khail Rd",
        roadCode: "E44",
        aliases: ["AL KHAIL ROAD", "AL KHAIL RD"],
      },
      {
        name: "Al Safa Street",
        roadCode: "D71",
        aliases: ["AL SAFA STREET", "AL SAFA ST"],
      },
      {
        name: "Al Wasl St",
        roadCode: "D92",
        aliases: ["AL WASL ST", "AL WASL STREET"],
      },
      {
        name: "First al khail Rd",
        roadCode: "D86",
        aliases: ["FIRST AL KHAIL ROAD", "FIRST AL KHAIL RD"],
      },
      {
        name: "Garn al sabkha St",
        roadCode: "D59",
        aliases: ["GARN AL SABKHA ST", "GARN AL SABKHA STREET"],
      },
      {
        name: "Hessa Street",
        roadCode: "D61",
        aliases: ["HESSA STREET", "HESSA ST"],
      },
      {
        name: "Jumeirah Road",
        roadCode: "D94",
        aliases: ["JUMEIRAH ROAD", "JUMEIRAH RD"],
      },
      {
        name: "Latifa Bint Hamdan Street",
        roadCode: "D67",
        aliases: ["LATIFA BINT HAMDAN STREET", "LATIFA BINT HAMDAN ST"],
      },
      {
        name: "Meydan & Manama Road",
        roadCode: "D77",
        aliases: ["MEYDAN & MANAMA ROAD", "MEYDAN AND MANAMA ROAD"],
      },
      {
        name: "Al Khaleej Road",
        roadCode: "D92",
        aliases: ["AL KHALEEJ ROAD", "AL KHALEEJ RD"],
      },
      {
        name: "Infinity Bridge",
        roadCode: "D85",
        aliases: ["INFINITY BRIDGE"],
      },
      {
        name: "Kuwait Street",
        roadCode: "D77",
        aliases: ["KUWAIT STREET", "KUWAIT ST"],
      },
      {
        name: "Oud Maitha Street",
        roadCode: "D79",
        aliases: ["OUD MAITHA STREET", "OUD MAITHA ST"],
      },
      {
        name: "Zabeel Street",
        roadCode: "D84",
        aliases: ["ZABEEL STREET", "ZABEEL ST"],
      },
      {
        name: "Cairo St",
        roadCode: "D95",
        aliases: ["CAIRO ST", "CAIRO STREET"],
      },
      {
        name: "Al Yalayis St",
        roadCode: "D57",
        aliases: ["AL YALAYIS ST", "AL YALAYIS STREET"],
      },
      {
        name: "Emirates Rd",
        roadCode: "E611",
        aliases: ["EMIRATES ROAD", "EMIRATES RD"],
      },
      {
        name: "JAFZA Industrial area",
        roadCode: "D86",
        aliases: ["JAFZA INDUSTRIAL AREA", "JAFZA INDUSTRIAL ZONE"],
      },
      {
        name: "SMBZR",
        roadCode: "E311",
        aliases: [
          "SMBZR",
          "SHEIKH MOHAMMED BIN ZAYED ROAD",
          "SHEIKH MOHAMMED BIN ZAYED RD",
        ],
      },
      {
        name: "Sheikh Zayed bin Hamdan Al Nahyan Street",
        roadCode: "D54",
        aliases: [
          "SHEIKH ZAYED BIN HAMDAN AL NAHYAN STREET",
          "SHEIKH ZAYED BIN HAMDAN AL NAHYAN ST",
        ],
      },
      {
        name: "DXB-Al Ain Rd",
        roadCode: "E66",
        aliases: ["DXB-AL AIN RD", "DUBAI AL AIN ROAD", "DUBAI AL AIN RD"],
      },
      {
        name: "Nad Al Hammar Road",
        roadCode: "D62",
        aliases: ["NAD AL HAMMAR ROAD", "NAD AL HAMMAR RD"],
      },
      {
        name: "Al Fay Road",
        roadCode: "E44",
        aliases: ["AL FAY ROAD", "AL FAY RD"],
      },
      {
        name: "Algeria St",
        roadCode: "D56",
        aliases: ["ALGERIA ST", "ALGERIA STREET"],
      },
      {
        name: "Ras al khor al awir",
        roadCode: "E44",
        aliases: [
          "RAS AL KHOR AL AWIR",
          "RAS AL KHOR AL AWEER",
          "RAS AL KHOR ROAD",
        ],
      },
      {
        name: "STREET 123",
        roadCode: "D61",
        aliases: ["STREET 123", "ST 123"],
      },
      {
        name: "Umm Suqueim",
        roadCode: "D63",
        aliases: ["UMM SUQEIM", "UMM SUQUEIM", "UMM SUQEIM STREET"],
      },
      {
        name: "Al Amardi",
        roadCode: "D50",
        aliases: ["AL AMARDI", "AL AMARDI ROAD"],
      },
      {
        name: "Al Nahda St",
        roadCode: "D93",
        aliases: ["AL NAHDA ST", "AL NAHDA STREET"],
      },
      {
        name: "Amman St",
        roadCode: "D97",
        aliases: ["AMMAN ST", "AMMAN STREET"],
      },
      {
        name: "Tripoli Road",
        roadCode: "D83",
        aliases: ["TRIPOLI ROAD", "TRIPOLI RD"],
      },
      {
        name: "Tunis Street",
        roadCode: "D93",
        aliases: ["TUNIS STREET", "TUNIS ST"],
      },
    ];

    const lookup = new Map<string, SeededRoadLocation>();

    for (const [index, item] of roadLocations.entries()) {
      const normalizedName = normalizeLocationName(item.name);

      const savedRoadLocation = await prisma.roadLocation.upsert({
        where: {
          normalizedName_roadCode: {
            normalizedName,
            roadCode: item.roadCode,
          },
        },
        update: {
          name: item.name,
          aliases: item.aliases,
          isActive: true,
          displayOrder: index + 1,
        },
        create: {
          name: item.name,
          normalizedName,
          roadCode: item.roadCode,
          aliases: item.aliases,
          isActive: true,
          displayOrder: index + 1,
        },
      });

      for (const key of getLookupKeys(item.name, item.aliases)) {
        lookup.set(key, savedRoadLocation);
      }
    }

    console.log("Road locations seeded.");

    return lookup;
  }

  const roadLocationLookup = await seedRoadLocations();

  function findRoadLocationByName(value?: string | null) {
    if (!value) return null;
    return roadLocationLookup.get(normalizeLocationName(value)) ?? null;
  }

  await seedProject({
    code: "PRJ-001",
    name: "Al Barsha MEP Works",
    clientName: "EMAAR",
    categoryCode: "its",
    projectManagerId: pm.id,
    contractValue: 42000000,
    completionPct: 42,
    plannedProgress: 61,
    actualProgress: 42,
    healthStatus: HealthStatus.CRITICAL,
    delayedApprovals: 7,
    blockedItems: 3,
    billingReadyAmount: 1800000,
    topIssue: "Authority approval delayed for IFC drawing package",
    topIssueAgeDays: 18,
    plannedStart: d("2025-01-05"),
    plannedFinish: d("2026-10-31"),
    forecastFinish: d("2026-11-18"),
    activities: [
      {
        wbsCode: "ITS.01.02",
        activityId: "A1020",
        activityName: "Traffic signal controller installation",
        discipline: "ITS",
        location: "Al Khail Street",
        roadLocationName: "Al Khail Street",
        rawRoadCode: "D68",
        packageName: "PACKAGE 01",
        workSectionName: "TT EXECUTION FOR 25M POLE - D68/CCTV-G-02",
        assetReference: "D68/CCTV-G-02",
        locationSource: ScheduleLocationSource.EXCEL_PARENT_ROW,
        durationDays: 12,
        plannedStart: d("2026-05-02"),
        plannedFinish: d("2026-05-14"),
        floatDays: 0,
        percentComplete: 42,
        owner: "ITS Engineer",
        isCritical: true,
        healthStatus: HealthStatus.CRITICAL,
      },
      {
        wbsCode: "ITS.01.03",
        activityId: "A1045",
        activityName: "Fiber backbone testing",
        discipline: "Fiber",
        location: "Al Rebat St",
        roadLocationName: "Al Rebat St",
        rawRoadCode: "D83",
        packageName: "PACKAGE 01",
        workSectionName: "TT EXECUTION FOR DUCT 20m",
        assetReference: "D83/DUCT",
        locationSource: ScheduleLocationSource.EXCEL_PARENT_ROW,
        durationDays: 7,
        plannedStart: d("2026-05-10"),
        plannedFinish: d("2026-05-17"),
        floatDays: 2,
        percentComplete: 30,
        owner: "Fiber Team",
        healthStatus: HealthStatus.AT_RISK,
      },
    ],
    milestones: [
      {
        milestoneCode: "MS-ITS-001",
        milestoneName: "Authority approval",
        baselineDate: d("2026-05-15"),
        forecastDate: d("2026-05-29"),
        delayDays: 14,
        linkedActivity: "A1020",
        healthStatus: HealthStatus.CRITICAL,
      },
      {
        milestoneCode: "MS-ITS-002",
        milestoneName: "SCADA integration complete",
        baselineDate: d("2026-06-10"),
        forecastDate: d("2026-06-18"),
        delayDays: 8,
        healthStatus: HealthStatus.DELAYED,
      },
    ],
  });

  await seedProject({
    code: "PRJ-002",
    name: "Dubai Creek ITS Upgrade",
    clientName: "Dubai Municipality",
    categoryCode: "its",
    projectManagerId: pm2.id,
    contractValue: 18000000,
    completionPct: 58,
    plannedProgress: 67,
    actualProgress: 58,
    healthStatus: HealthStatus.DELAYED,
    delayedApprovals: 3,
    blockedItems: 1,
    billingReadyAmount: 1100000,
    topIssue: "NOC approval pending",
    topIssueAgeDays: 11,
    plannedStart: d("2025-04-01"),
    plannedFinish: d("2026-09-30"),
    forecastFinish: d("2026-10-20"),
    milestones: [
      {
        milestoneCode: "MS-ITS-003",
        milestoneName: "NOC approval",
        baselineDate: d("2026-06-01"),
        forecastDate: d("2026-06-12"),
        delayDays: 11,
        healthStatus: HealthStatus.DELAYED,
      },
    ],
  });

  await seedProject({
    code: "PRJ-003",
    name: "JLT Traffic Signal Works",
    clientName: "RTA",
    categoryCode: "traffic",
    projectManagerId: pm3.id,
    contractValue: 18500000,
    completionPct: 71,
    plannedProgress: 80,
    actualProgress: 71,
    healthStatus: HealthStatus.AT_RISK,
    delayedApprovals: 2,
    blockedItems: 0,
    billingReadyAmount: 2000000,
    topIssue: "Signal pole material delivery variance",
    topIssueAgeDays: 7,
    plannedStart: d("2025-03-01"),
    plannedFinish: d("2026-06-30"),
    forecastFinish: d("2026-07-12"),
    milestones: [
      {
        milestoneCode: "MS-TRF-001",
        milestoneName: "Signal pole material delivery",
        baselineDate: d("2026-05-20"),
        forecastDate: d("2026-05-27"),
        delayDays: 7,
        healthStatus: HealthStatus.AT_RISK,
      },
    ],
  });

  await seedProject({
    code: "PRJ-004",
    name: "DIP Road Marking Package",
    clientName: "DIP Authority",
    categoryCode: "traffic",
    projectManagerId: pm4.id,
    contractValue: 22000000,
    completionPct: 83,
    plannedProgress: 85,
    actualProgress: 83,
    healthStatus: HealthStatus.ON_TRACK,
    delayedApprovals: 1,
    blockedItems: 3,
    billingReadyAmount: 1500000,
    plannedStart: d("2025-05-01"),
    plannedFinish: d("2026-08-15"),
    forecastFinish: d("2026-08-15"),
  });

  await seedProject({
    code: "PRJ-005",
    name: "Business Bay CCTV Maintenance",
    clientName: "Dubai Municipality",
    categoryCode: "its-maint",
    projectManagerId: pm.id,
    contractValue: 7200000,
    completionPct: 89,
    plannedProgress: 92,
    actualProgress: 89,
    healthStatus: HealthStatus.ON_TRACK,
    delayedApprovals: 0,
    blockedItems: 1,
    billingReadyAmount: 1600000,
    plannedStart: d("2025-06-01"),
    plannedFinish: d("2026-05-31"),
    forecastFinish: d("2026-05-31"),
  });

  await seedProject({
    code: "PRJ-006",
    name: "Mirdif VMS Maintenance",
    clientName: "RTA",
    categoryCode: "its-maint",
    projectManagerId: pm2.id,
    contractValue: 5400000,
    completionPct: 67,
    plannedProgress: 75,
    actualProgress: 67,
    healthStatus: HealthStatus.AT_RISK,
    delayedApprovals: 5,
    blockedItems: 2,
    billingReadyAmount: 1000000,
    topIssue: "VMS repair closure at risk",
    topIssueAgeDays: 7,
    plannedStart: d("2025-07-01"),
    plannedFinish: d("2026-06-30"),
    forecastFinish: d("2026-07-08"),
    milestones: [
      {
        milestoneCode: "MS-ITSM-001",
        milestoneName: "VMS repair closure",
        baselineDate: d("2026-05-10"),
        forecastDate: d("2026-05-17"),
        delayDays: 7,
        healthStatus: HealthStatus.AT_RISK,
      },
    ],
  });

  await seedProject({
    code: "PRJ-007",
    name: "SZR Signal Maintenance",
    clientName: "RTA",
    categoryCode: "traffic-maint",
    projectManagerId: pm3.id,
    contractValue: 6500000,
    completionPct: 76,
    plannedProgress: 82,
    actualProgress: 76,
    healthStatus: HealthStatus.ON_TRACK,
    delayedApprovals: 0,
    blockedItems: 0,
    billingReadyAmount: 1100000,
    plannedStart: d("2025-02-15"),
    plannedFinish: d("2026-02-14"),
    forecastFinish: d("2026-02-20"),
  });

  await seedProject({
    code: "PRJ-008",
    name: "Bur Dubai Signal Maintenance",
    clientName: "Dubai Municipality",
    categoryCode: "traffic-maint",
    projectManagerId: pm4.id,
    contractValue: 4100000,
    completionPct: 62,
    plannedProgress: 78,
    actualProgress: 62,
    healthStatus: HealthStatus.DELAYED,
    delayedApprovals: 6,
    blockedItems: 3,
    billingReadyAmount: 1800000,
    topIssue: "Night work permit delayed",
    topIssueAgeDays: 12,
    plannedStart: d("2025-04-15"),
    plannedFinish: d("2026-04-14"),
    forecastFinish: d("2026-05-04"),
    milestones: [
      {
        milestoneCode: "MS-TRFM-001",
        milestoneName: "Night work permit",
        baselineDate: d("2026-04-20"),
        forecastDate: d("2026-05-02"),
        delayDays: 12,
        healthStatus: HealthStatus.DELAYED,
      },
    ],
  });

  /* ---------------------------------- */
  /* DOCUMENT CONTROLLER SAMPLE DOCUMENTS */
  /* ---------------------------------- */

  const itsProject = await prisma.project.findFirst({
    where: {
      OR: [{ code: "PRJ-001" }, { portfolio: "its" }],
    },
  });

  if (itsProject) {
    const documents = [
      {
        documentNo: "ITS-DRW-001",
        title: "Traffic Signal Controller Cabinet Layout",
        fileName: "Traffic Signal Controller Cabinet Layout.pdf",
        revision: "R03",
        disciplineCode: "its",
        ownerCode: "engineering",
        workflowStatusCode: "under-review",
        approvalStatusCode: "client-pending",
        dueDate: new Date("2026-03-18"),
        progressPct: 68,
        lastUpdate: "Comment received",
        remarks: "Pending client comments on cabinet layout.",
      },
      {
        documentNo: "ITS-MST-014",
        title: "Master Testing & Commissioning Procedure",
        fileName: "Master Testing & Commissioning Procedure.pdf",
        revision: "R01",
        disciplineCode: "testing",
        ownerCode: "qaqc",
        workflowStatusCode: "submitted",
        approvalStatusCode: "consultant-review",
        dueDate: new Date("2026-03-20"),
        progressPct: 45,
        lastUpdate: "Submitted to consultant",
        remarks: "Submitted to consultant for review.",
      },
      {
        documentNo: "ITS-CAL-008",
        title: "Camera Calibration Report Package",
        fileName: "Camera Calibration Report Package.pdf",
        revision: "R02",
        disciplineCode: "its",
        ownerCode: "site-team",
        workflowStatusCode: "approved",
        approvalStatusCode: "closed",
        dueDate: new Date("2026-03-12"),
        progressPct: 100,
        lastUpdate: "Approved with comments",
        remarks: "Approved with comments.",
      },
      {
        documentNo: "ITS-MAT-021",
        title: "Material Submittal for Field Cabinets",
        fileName: "Material Submittal for Field Cabinets.pdf",
        revision: "R04",
        disciplineCode: "material",
        ownerCode: "procurement",
        workflowStatusCode: "rejected",
        approvalStatusCode: "resubmit",
        dueDate: new Date("2026-03-17"),
        progressPct: 28,
        lastUpdate: "Missing compliance sheet",
        remarks: "Compliance sheet missing. Resubmission required.",
      },
      {
        documentNo: "ITS-SHOP-030",
        title: "Shop Drawing - Gantry Pole Foundation",
        fileName: "Shop Drawing - Gantry Pole Foundation.pdf",
        revision: "R02",
        disciplineCode: "civil",
        ownerCode: "engineering",
        workflowStatusCode: "pending",
        approvalStatusCode: "internal-review",
        dueDate: new Date("2026-03-22"),
        progressPct: 35,
        lastUpdate: "Internal checker assigned",
        remarks: "Internal checker assigned.",
      },
      {
        documentNo: "ITS-OM-006",
        title: "Operation & Maintenance Manual Draft",
        fileName: "Operation & Maintenance Manual Draft.pdf",
        revision: "R00",
        disciplineCode: "om",
        ownerCode: "document-control",
        workflowStatusCode: "draft",
        approvalStatusCode: "not-submitted",
        dueDate: new Date("2026-03-25"),
        progressPct: 18,
        lastUpdate: "Draft preparation",
        remarks: "Draft preparation in progress.",
      },
    ];

    for (const item of documents) {
      const existingDocument = await prisma.planningDocument.findFirst({
        where: {
          projectId: itsProject.id,
          documentNo: item.documentNo,
        },
      });

      const documentData = {
        title: item.title,
        fileName: item.fileName,
        revision: item.revision,

        planType: "DOCUMENT_REGISTER",
        status: RecordStatus.ACTIVE,
        uploadedBy: admin.name,

        dueDate: item.dueDate,
        progressPct: item.progressPct,
        lastUpdate: item.lastUpdate,
        remarks: item.remarks,
        importSource: DocumentImportSource.MANUAL,
        isActive: true,

        stage: {
          connect: {
            code: "design",
          },
        },

        discipline: {
          connect: {
            code: item.disciplineCode,
          },
        },

        owner: {
          connect: {
            code: item.ownerCode,
          },
        },

        workflowStatus: {
          connect: {
            code: item.workflowStatusCode,
          },
        },

        approvalStatus: {
          connect: {
            code: item.approvalStatusCode,
          },
        },
      };

      if (existingDocument) {
        await prisma.planningDocument.update({
          where: {
            id: existingDocument.id,
          },
          data: documentData,
        });
      } else {
        await prisma.planningDocument.create({
          data: {
            project: {
              connect: {
                id: itsProject.id,
              },
            },
            documentNo: item.documentNo,
            ...documentData,
          },
        });
      }
    }

    console.log("Document controller sample documents seeded.");
  }

  await seedSampleScheduleImportWithLocations();
  await seedFieldResourcesAndAssignments();

  await seedDocumentationStatusRecords();
  await seedRevenueBilling();
  await seedInvoices();

  await seedResources();

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
