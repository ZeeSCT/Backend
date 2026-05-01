import { BadRequestException, Injectable } from '@nestjs/common';

export type PortfolioCategoryCode =
  | 'all'
  | 'its'
  | 'traffic'
  | 'its-maint'
  | 'traffic-maint';

export type ActualPortfolioCategoryCode = Exclude<
  PortfolioCategoryCode,
  'all'
>;

export type DocumentationStage =
  | 'pre-construction'
  | 'design'
  | 'procurement'
  | 'construction'
  | 'testing-commissioning'
  | 'closeout';

export type DocumentationStatusLabel =
  | 'Approved'
  | 'Under review'
  | 'In preparation'
  | 'Overdue'
  | 'Rejected'
  | 'At risk';

interface DocumentationRecord {
  id: string;
  stage: DocumentationStage;
  categoryCode: ActualPortfolioCategoryCode;
  categoryName: string;
  document: string;
  project: string;
  revision: string;
  submitted: string;
  approver: string;
  status: DocumentationStatusLabel;
  count: number;
  overdueDays?: number;
}

const allowedCategories: PortfolioCategoryCode[] = [
  'all',
  'its',
  'traffic',
  'its-maint',
  'traffic-maint',
];

const allowedStages: DocumentationStage[] = [
  'pre-construction',
  'design',
  'procurement',
  'construction',
  'testing-commissioning',
  'closeout',
];

const categoryLabels: Record<PortfolioCategoryCode, string> = {
  all: 'All portfolios',
  its: 'ITS Projects',
  traffic: 'Traffic Projects',
  'its-maint': 'ITS Maintenance',
  'traffic-maint': 'Traffic Maintenance',
};

const stageLabels: Record<DocumentationStage, string> = {
  'pre-construction': 'Pre-construction',
  design: 'Design',
  procurement: 'Procurement',
  construction: 'Construction',
  'testing-commissioning': 'Testing & commissioning',
  closeout: 'Closeout',
};

const statusOrder: DocumentationStatusLabel[] = [
  'Approved',
  'Under review',
  'In preparation',
  'Overdue',
  'At risk',
  'Rejected',
];

const records: DocumentationRecord[] = [
  {
    id: 'pre-its-1',
    stage: 'pre-construction',
    categoryCode: 'its',
    categoryName: 'ITS Projects',
    document: 'Permit drawings set A',
    project: 'Dubai ITS Corridor',
    revision: 'R03',
    submitted: '17 Mar',
    approver: 'Authority',
    status: 'Overdue',
    count: 18,
    overdueDays: 18,
  },
  {
    id: 'pre-its-2',
    stage: 'pre-construction',
    categoryCode: 'its',
    categoryName: 'ITS Projects',
    document: 'Traffic diversion concept',
    project: 'JLT Smart Parking',
    revision: 'R01',
    submitted: '28 Mar',
    approver: 'Client',
    status: 'Under review',
    count: 12,
  },
  {
    id: 'pre-traffic-1',
    stage: 'pre-construction',
    categoryCode: 'traffic',
    categoryName: 'Traffic Projects',
    document: 'NOC submission package',
    project: 'Business Bay Signal Upgrade',
    revision: 'R02',
    submitted: '20 Mar',
    approver: 'Authority',
    status: 'At risk',
    count: 15,
    overdueDays: 9,
  },
  {
    id: 'pre-traffic-2',
    stage: 'pre-construction',
    categoryCode: 'traffic',
    categoryName: 'Traffic Projects',
    document: 'Project execution plan',
    project: 'Mirdif Junction Works',
    revision: 'R02',
    submitted: '1 Apr',
    approver: 'Client',
    status: 'Approved',
    count: 21,
  },
  {
    id: 'pre-its-maint-1',
    stage: 'pre-construction',
    categoryCode: 'its-maint',
    categoryName: 'ITS Maintenance',
    document: 'Maintenance readiness plan',
    project: 'DAFZA ITS Maintenance',
    revision: 'R01',
    submitted: '24 Mar',
    approver: 'Internal',
    status: 'Under review',
    count: 10,
  },
  {
    id: 'pre-traffic-maint-1',
    stage: 'pre-construction',
    categoryCode: 'traffic-maint',
    categoryName: 'Traffic Maintenance',
    document: 'Signal maintenance method statement',
    project: 'Al Barsha Signal Maintenance',
    revision: 'R02',
    submitted: '22 Mar',
    approver: 'Consultant',
    status: 'Overdue',
    count: 11,
    overdueDays: 14,
  },

  {
    id: 'design-its-1',
    stage: 'design',
    categoryCode: 'its',
    categoryName: 'ITS Projects',
    document: 'ITS architecture drawings',
    project: 'Dubai ITS Corridor',
    revision: 'R04',
    submitted: '12 Mar',
    approver: 'Consultant',
    status: 'Overdue',
    count: 22,
    overdueDays: 21,
  },
  {
    id: 'design-traffic-1',
    stage: 'design',
    categoryCode: 'traffic',
    categoryName: 'Traffic Projects',
    document: 'Signal layout design',
    project: 'Business Bay Signal Upgrade',
    revision: 'R03',
    submitted: '25 Mar',
    approver: 'Client',
    status: 'Under review',
    count: 26,
  },
  {
    id: 'design-its-maint-1',
    stage: 'design',
    categoryCode: 'its-maint',
    categoryName: 'ITS Maintenance',
    document: 'CCTV relocation design',
    project: 'DIP CCTV Maintenance',
    revision: 'R02',
    submitted: '18 Mar',
    approver: 'Consultant',
    status: 'Approved',
    count: 18,
  },
  {
    id: 'design-traffic-maint-1',
    stage: 'design',
    categoryCode: 'traffic-maint',
    categoryName: 'Traffic Maintenance',
    document: 'Controller cabinet modification drawing',
    project: 'Al Barsha Signal Maintenance',
    revision: 'R01',
    submitted: '29 Mar',
    approver: 'Consultant',
    status: 'At risk',
    count: 14,
    overdueDays: 8,
  },

  {
    id: 'proc-its-1',
    stage: 'procurement',
    categoryCode: 'its',
    categoryName: 'ITS Projects',
    document: 'Camera technical submittal',
    project: 'Dubai ITS Corridor',
    revision: 'R02',
    submitted: '20 Mar',
    approver: 'Consultant',
    status: 'Under review',
    count: 16,
  },
  {
    id: 'proc-traffic-1',
    stage: 'procurement',
    categoryCode: 'traffic',
    categoryName: 'Traffic Projects',
    document: 'Signal pole material approval',
    project: 'Mirdif Junction Works',
    revision: 'R01',
    submitted: '23 Mar',
    approver: 'Client',
    status: 'Overdue',
    count: 13,
    overdueDays: 11,
  },
  {
    id: 'proc-its-maint-1',
    stage: 'procurement',
    categoryCode: 'its-maint',
    categoryName: 'ITS Maintenance',
    document: 'Network switch compliance sheet',
    project: 'DAFZA ITS Maintenance',
    revision: 'R01',
    submitted: '30 Mar',
    approver: 'Consultant',
    status: 'Approved',
    count: 19,
  },
  {
    id: 'proc-traffic-maint-1',
    stage: 'procurement',
    categoryCode: 'traffic-maint',
    categoryName: 'Traffic Maintenance',
    document: 'Spare signal heads vendor approval',
    project: 'Deira Traffic Maintenance',
    revision: 'R02',
    submitted: '2 Apr',
    approver: 'Internal',
    status: 'In preparation',
    count: 9,
  },

  {
    id: 'con-its-1',
    stage: 'construction',
    categoryCode: 'its',
    categoryName: 'ITS Projects',
    document: 'Site inspection report',
    project: 'JLT Smart Parking',
    revision: 'R01',
    submitted: '19 Mar',
    approver: 'Consultant',
    status: 'Overdue',
    count: 17,
    overdueDays: 15,
  },
  {
    id: 'con-traffic-1',
    stage: 'construction',
    categoryCode: 'traffic',
    categoryName: 'Traffic Projects',
    document: 'Road marking inspection request',
    project: 'Business Bay Signal Upgrade',
    revision: 'R02',
    submitted: '28 Mar',
    approver: 'Consultant',
    status: 'At risk',
    count: 12,
    overdueDays: 9,
  },
  {
    id: 'con-its-maint-1',
    stage: 'construction',
    categoryCode: 'its-maint',
    categoryName: 'ITS Maintenance',
    document: 'Daily maintenance report',
    project: 'DIP CCTV Maintenance',
    revision: 'R01',
    submitted: '3 Apr',
    approver: 'Internal',
    status: 'Approved',
    count: 25,
  },
  {
    id: 'con-traffic-maint-1',
    stage: 'construction',
    categoryCode: 'traffic-maint',
    categoryName: 'Traffic Maintenance',
    document: 'Work permit checklist',
    project: 'Al Barsha Signal Maintenance',
    revision: 'R01',
    submitted: '4 Apr',
    approver: 'Internal',
    status: 'Under review',
    count: 11,
  },

  {
    id: 'tc-its-1',
    stage: 'testing-commissioning',
    categoryCode: 'its',
    categoryName: 'ITS Projects',
    document: 'FAT report',
    project: 'Dubai ITS Corridor',
    revision: 'R01',
    submitted: '30 Mar',
    approver: 'Consultant',
    status: 'Under review',
    count: 14,
  },
  {
    id: 'tc-traffic-1',
    stage: 'testing-commissioning',
    categoryCode: 'traffic',
    categoryName: 'Traffic Projects',
    document: 'Signal testing procedure',
    project: 'Mirdif Junction Works',
    revision: 'R02',
    submitted: '24 Mar',
    approver: 'Consultant',
    status: 'Overdue',
    count: 10,
    overdueDays: 10,
  },
  {
    id: 'tc-its-maint-1',
    stage: 'testing-commissioning',
    categoryCode: 'its-maint',
    categoryName: 'ITS Maintenance',
    document: 'CCTV commissioning checklist',
    project: 'DAFZA ITS Maintenance',
    revision: 'R01',
    submitted: '28 Mar',
    approver: 'Client',
    status: 'At risk',
    count: 8,
    overdueDays: 8,
  },
  {
    id: 'tc-traffic-maint-1',
    stage: 'testing-commissioning',
    categoryCode: 'traffic-maint',
    categoryName: 'Traffic Maintenance',
    document: 'Controller loop test sheet',
    project: 'Deira Traffic Maintenance',
    revision: 'R02',
    submitted: '21 Mar',
    approver: 'Consultant',
    status: 'Approved',
    count: 13,
  },

  {
    id: 'close-its-1',
    stage: 'closeout',
    categoryCode: 'its',
    categoryName: 'ITS Projects',
    document: 'As-built ITS drawings',
    project: 'JLT Smart Parking',
    revision: 'R04',
    submitted: '23 Mar',
    approver: 'Consultant',
    status: 'Overdue',
    count: 9,
    overdueDays: 12,
  },
  {
    id: 'close-traffic-1',
    stage: 'closeout',
    categoryCode: 'traffic',
    categoryName: 'Traffic Projects',
    document: 'Final completion certificate',
    project: 'Business Bay Signal Upgrade',
    revision: 'R01',
    submitted: '2 Apr',
    approver: 'Authority',
    status: 'Under review',
    count: 7,
  },
  {
    id: 'close-its-maint-1',
    stage: 'closeout',
    categoryCode: 'its-maint',
    categoryName: 'ITS Maintenance',
    document: 'O&M manuals',
    project: 'DIP CCTV Maintenance',
    revision: 'R02',
    submitted: '27 Mar',
    approver: 'Client',
    status: 'At risk',
    count: 6,
    overdueDays: 9,
  },
  {
    id: 'close-traffic-maint-1',
    stage: 'closeout',
    categoryCode: 'traffic-maint',
    categoryName: 'Traffic Maintenance',
    document: 'Handover dossier',
    project: 'Al Barsha Signal Maintenance',
    revision: 'R02',
    submitted: '19 Mar',
    approver: 'Consultant',
    status: 'Approved',
    count: 16,
  },
];

@Injectable()
export class DocumentStatusService {
  getDocumentStatus(
    category: PortfolioCategoryCode = 'all',
    stage: DocumentationStage = 'pre-construction',
  ) {
    if (!allowedCategories.includes(category)) {
      throw new BadRequestException('Invalid portfolio category');
    }

    if (!allowedStages.includes(stage)) {
      throw new BadRequestException('Invalid documentation stage');
    }

    const filteredRecords = records.filter((record) => {
      const matchesStage = record.stage === stage;

      const matchesCategory =
        category === 'all' || record.categoryCode === category;

      return matchesStage && matchesCategory;
    });

    const totalDocuments = this.sumCounts(filteredRecords);

    const approved = this.sumStatusCounts(filteredRecords, ['Approved']);

    const underReview = this.sumStatusCounts(filteredRecords, [
      'Under review',
      'At risk',
    ]);

    const overdue = this.sumStatusCounts(filteredRecords, ['Overdue']);

    const inPreparation = this.sumStatusCounts(filteredRecords, [
      'In preparation',
    ]);

    const rejected = this.sumStatusCounts(filteredRecords, ['Rejected']);

    const atRisk = this.sumStatusCounts(filteredRecords, ['At risk']);

    const statusSummary = statusOrder
      .map((status) => {
        const value = this.sumStatusCounts(filteredRecords, [status]);

        return {
          label: status,
          value,
          percent: this.getPercent(value, totalDocuments),
        };
      })
      .filter((item) => item.value > 0);

    const overdueApprovals = filteredRecords
      .filter(
        (record) => record.status === 'Overdue' || record.status === 'At risk',
      )
      .sort((a, b) => (b.overdueDays ?? 0) - (a.overdueDays ?? 0))
      .slice(0, 4)
      .map((record) => ({
        id: record.id,
        project: record.project,
        document: record.document,
        title: `${record.project} — ${record.document}`,
        approver: record.approver,
        status: record.status,
        days: record.overdueDays ?? 0,
        severity: record.status === 'Overdue' ? 'danger' : 'warning',
      }));

    const register = filteredRecords.map((record) => ({
      id: record.id,
      categoryCode: record.categoryCode,
      categoryName: record.categoryName,
      document: record.document,
      project: record.project,
      revision: record.revision,
      submitted: record.submitted,
      approver: record.approver,
      status: record.status,
      count: record.count,
      overdueDays: record.overdueDays ?? null,
    }));

    return {
      selectedCategory: category,
      selectedCategoryLabel: categoryLabels[category],
      selectedStage: stage,
      selectedStageLabel: stageLabels[stage],
      kpis: {
        totalDocuments,
        approved,
        underReview,
        overdue,
        inPreparation,
        rejected,
        atRisk,
      },
      statusSummary,
      overdueApprovals,
      register,
    };
  }

  private sumCounts(items: DocumentationRecord[]) {
    return items.reduce((total, item) => total + item.count, 0);
  }

  private sumStatusCounts(
    items: DocumentationRecord[],
    statuses: DocumentationStatusLabel[],
  ) {
    return items.reduce((total, item) => {
      return statuses.includes(item.status) ? total + item.count : total;
    }, 0);
  }

  private getPercent(value: number, total: number) {
    if (total === 0) return 0;

    return Math.round((value / total) * 100);
  }
}