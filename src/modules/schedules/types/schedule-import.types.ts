// src/modules/schedules/types/schedule-import.types.ts

export const REQUIRED_SCHEDULE_HEADERS = [
  "WBS Level",
  "WBS code",
  "Activity ID",
  "Activity Name",
  "Duration",
  "Start",
  "Finish",
  "Total Float",
] as const;

export interface ParsedWbsItem {
  tempKey: string;
  parentTempKey: string | null;
  rowNumber: number;
  wbsLevel: number;
  wbsCode: string;
  name: string;
  duration: number | null;
  startDate: Date | null;
  finishDate: Date | null;
  totalFloat: number | null;
}

export interface ParsedScheduleActivity {
  rowNumber: number;
  parentWbsTempKey: string | null;
  activityCode: string;
  activityName: string;
  duration: number | null;
  startDate: Date | null;
  finishDate: Date | null;
  totalFloat: number | null;
  isMilestone: boolean;
  isCritical: boolean;
}

export interface ParsedMilestone {
  activityCode: string;
  milestoneCode: string;
  name: string;
  plannedDate: Date | null;
}

export interface ParsedImportError {
  rowNumber: number;
  columnName?: string;
  errorMessage: string;
  rawValue?: string;
}

export interface ParsedScheduleImport {
  sheetName: string;
  totalRows: number;
  wbsItems: ParsedWbsItem[];
  activities: ParsedScheduleActivity[];
  milestones: ParsedMilestone[];
  errors: ParsedImportError[];
}