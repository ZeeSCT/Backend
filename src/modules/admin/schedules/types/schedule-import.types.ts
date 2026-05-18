// src/modules/schedules/types/schedule-import.types.ts

import { ScheduleLocationSource } from "@prisma/client/edge";

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

  roadLocationId?: string | null;
  rawLocationName?: string | null;
  rawRoadCode?: string | null;
  locationSource?: ScheduleLocationSource;
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

  roadLocationId?: string | null;
  rawLocationName?: string | null;
  rawRoadCode?: string | null;
  packageName?: string | null;
  workSectionName?: string | null;
  assetReference?: string | null;
  locationSource?: ScheduleLocationSource;
}

export interface ParsedMilestone {
  activityCode: string;
  milestoneCode: string;
  name: string;
  plannedDate: Date | null;

  roadLocationId?: string | null;
  rawLocationName?: string | null;
  rawRoadCode?: string | null;
  packageName?: string | null;
  workSectionName?: string | null;
  assetReference?: string | null;
  locationSource?: ScheduleLocationSource;
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
