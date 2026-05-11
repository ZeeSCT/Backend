// src/modules/schedules/schedule-excel-parser.service.ts

import { Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import {
  ParsedImportError,
  ParsedMilestone,
  ParsedScheduleActivity,
  ParsedScheduleImport,
  ParsedWbsItem,
  REQUIRED_SCHEDULE_HEADERS,
} from "./types/schedule-import.types";

@Injectable()
export class ScheduleExcelParserService {
  async parse(
    fileBuffer: Express.Multer.File["buffer"],
  ): Promise<ParsedScheduleImport> {
    const workbook = new ExcelJS.Workbook();

    const excelBuffer = Buffer.from(fileBuffer);

    await workbook.xlsx.load(
      excelBuffer as unknown as Parameters<typeof workbook.xlsx.load>[0],
    );

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return {
        sheetName: "",
        totalRows: 0,
        wbsItems: [],
        activities: [],
        milestones: [],
        errors: [
          {
            rowNumber: 0,
            errorMessage: "Excel file does not contain any worksheets.",
          },
        ],
      };
    }

    const errors: ParsedImportError[] = [];
    const wbsItems: ParsedWbsItem[] = [];
    const activities: ParsedScheduleActivity[] = [];
    const milestones: ParsedMilestone[] = [];

    const headerMap = this.buildHeaderMap(worksheet, errors);

    if (errors.length > 0) {
      return {
        sheetName: worksheet.name,
        totalRows: Math.max(worksheet.rowCount - 1, 0),
        wbsItems,
        activities,
        milestones,
        errors,
      };
    }

    const latestWbsByLevel = new Map<number, ParsedWbsItem>();
    let currentLeafWbs: ParsedWbsItem | null = null;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (this.isEmptyRow(row)) return;

      const rawWbsLevel = this.getCellText(row, headerMap["WBS Level"]);
      const rawWbsCode = this.getCellText(row, headerMap["WBS code"]);
      const rawActivityCode = this.getCellText(row, headerMap["Activity ID"]);
      const rawActivityNameFromHeader = this.getCellText(
        row,
        headerMap["Activity Name"],
      );
      const rawDuration = this.getCellText(row, headerMap["Duration"]);
      const rawStartValue = this.getCellValue(row, headerMap["Start"]);
      const rawFinishValue = this.getCellValue(row, headerMap["Finish"]);
      const rawTotalFloat = this.getCellText(row, headerMap["Total Float"]);

      const wbsLevel = this.parseInteger(rawWbsLevel);
      const wbsCode = rawWbsCode.trim();
      const activityCodeCandidate = rawActivityCode.trim();

      const duration = this.parseOptionalInteger(rawDuration);
      const startDate = this.parseDate(rawStartValue);
      const finishDate = this.parseDate(rawFinishValue);
      const totalFloat = this.parseOptionalInteger(rawTotalFloat);

      const activityCodeLooksValid =
        this.looksLikeActivityCode(activityCodeCandidate);

      const isWbsRow =
        wbsLevel !== null &&
        wbsCode.length > 0 &&
        !activityCodeLooksValid;

      const isActivityRow = activityCodeLooksValid;

      /**
       * Many Primavera/MS Project exports contain title, blank, spacing,
       * or continuation rows. These should not fail the whole import.
       */
      if (!isWbsRow && !isActivityRow) {
        return;
      }

      const activityCode = isActivityRow ? activityCodeCandidate : "";

      const activityName = isWbsRow
        ? this.resolveWbsName(row, headerMap, rawActivityNameFromHeader)
        : this.resolveActivityName(row, headerMap, rawActivityNameFromHeader);

      if (isWbsRow) {
        const rowErrors: ParsedImportError[] = [];

        /**
         * Do not reject WBS rows if the name is shifted/missing.
         * Use a safe fallback so the hierarchy can still be created.
         */
        const wbsName = activityName || `WBS ${wbsCode}`;

        if (duration !== null && duration < 0) {
          rowErrors.push({
            rowNumber,
            columnName: "Duration",
            errorMessage: "Duration cannot be negative.",
            rawValue: rawDuration,
          });
        }

        if (startDate && finishDate && finishDate < startDate) {
          rowErrors.push({
            rowNumber,
            columnName: "Finish",
            errorMessage: "Finish date cannot be before Start date.",
            rawValue: this.stringifyCellValue(rawFinishValue),
          });
        }

        if (rowErrors.length > 0) {
          errors.push(...rowErrors);
          return;
        }

        const parent = this.findNearestParentWbs(wbsLevel, latestWbsByLevel);
        const tempKey = `${rowNumber}:${wbsCode}`;

        const wbsItem: ParsedWbsItem = {
          tempKey,
          parentTempKey: parent?.tempKey ?? null,
          rowNumber,
          wbsLevel,
          wbsCode,
          name: wbsName,
          duration,
          startDate,
          finishDate,
          totalFloat,
        };

        wbsItems.push(wbsItem);

        latestWbsByLevel.set(wbsLevel, wbsItem);

        for (const existingLevel of Array.from(latestWbsByLevel.keys())) {
          if (existingLevel > wbsLevel) {
            latestWbsByLevel.delete(existingLevel);
          }
        }

        currentLeafWbs = wbsItem;
        return;
      }

      if (isActivityRow) {
        const rowErrors: ParsedImportError[] = [];

        if (!activityName) {
          rowErrors.push({
            rowNumber,
            columnName: "Activity Name",
            errorMessage: "Activity Name is required.",
          });
        }

        if (duration === null || duration < 0) {
          rowErrors.push({
            rowNumber,
            columnName: "Duration",
            errorMessage: "Duration must be a valid non-negative number.",
            rawValue: rawDuration,
          });
        }

        /**
         * Some milestone rows have only Finish date.
         * Some normal activity rows may have both Start and Finish.
         * Require at least one date instead of requiring Finish only.
         */
        if (!startDate && !finishDate) {
          rowErrors.push({
            rowNumber,
            columnName: "Start/Finish",
            errorMessage: "Either Start or Finish date is required.",
            rawValue: `${this.stringifyCellValue(rawStartValue)} / ${this.stringifyCellValue(rawFinishValue)}`,
          });
        }

        if (startDate && finishDate && finishDate < startDate) {
          rowErrors.push({
            rowNumber,
            columnName: "Finish",
            errorMessage: "Finish date cannot be before Start date.",
            rawValue: this.stringifyCellValue(rawFinishValue),
          });
        }

        if (!currentLeafWbs) {
          rowErrors.push({
            rowNumber,
            columnName: "WBS code",
            errorMessage:
              "Activity row could not be linked because no parent WBS row was found above it.",
          });
        }

        if (rowErrors.length > 0) {
          errors.push(...rowErrors);
          return;
        }

        const isMilestone =
          duration === 0 || activityCode.toUpperCase().startsWith("MS-");

        const isCritical = totalFloat !== null && totalFloat <= 0;

        const parsedActivity: ParsedScheduleActivity = {
          rowNumber,
          parentWbsTempKey: currentLeafWbs?.tempKey ?? null,
          activityCode,
          activityName,
          duration,
          startDate,
          finishDate,
          totalFloat,
          isMilestone,
          isCritical,
        };

        activities.push(parsedActivity);

        if (isMilestone) {
          milestones.push({
            activityCode,
            milestoneCode: activityCode,
            name: activityName,
            plannedDate: finishDate ?? startDate,
          });
        }
      }
    });

    this.validateDuplicateActivities(activities, errors);
    this.validateDuplicateWbsCodes(wbsItems, errors);

    return {
      sheetName: worksheet.name,
      totalRows: Math.max(worksheet.rowCount - 1, 0),
      wbsItems,
      activities,
      milestones,
      errors,
    };
  }

  private buildHeaderMap(
    worksheet: ExcelJS.Worksheet,
    errors: ParsedImportError[],
  ): Record<string, number> {
    const headerRow = worksheet.getRow(1);
    const headerMap: Record<string, number> = {};

    headerRow.eachCell((cell, colNumber) => {
      const value = String(cell.value ?? "").trim();

      if (value) {
        headerMap[value] = colNumber;
      }
    });

    for (const requiredHeader of REQUIRED_SCHEDULE_HEADERS) {
      if (!headerMap[requiredHeader]) {
        errors.push({
          rowNumber: 1,
          columnName: requiredHeader,
          errorMessage: `Missing required column "${requiredHeader}".`,
        });
      }
    }

    return headerMap;
  }

  private findNearestParentWbs(
    currentLevel: number,
    latestWbsByLevel: Map<number, ParsedWbsItem>,
  ): ParsedWbsItem | null {
    const lowerLevels = Array.from(latestWbsByLevel.keys())
      .filter((level) => level < currentLevel)
      .sort((a, b) => b - a);

    const nearestLevel = lowerLevels[0];

    if (nearestLevel === undefined) return null;

    return latestWbsByLevel.get(nearestLevel) ?? null;
  }

  private validateDuplicateActivities(
    activities: ParsedScheduleActivity[],
    errors: ParsedImportError[],
  ) {
    const seen = new Map<string, number>();

    for (const activity of activities) {
      const key = activity.activityCode.trim().toUpperCase();
      const existingRow = seen.get(key);

      if (existingRow) {
        errors.push({
          rowNumber: activity.rowNumber,
          columnName: "Activity ID",
          errorMessage: `Duplicate Activity ID "${activity.activityCode}". Already found on row ${existingRow}.`,
          rawValue: activity.activityCode,
        });
      }

      seen.set(key, activity.rowNumber);
    }
  }

  private validateDuplicateWbsCodes(
    wbsItems: ParsedWbsItem[],
    errors: ParsedImportError[],
  ) {
    const seen = new Map<string, number>();

    for (const item of wbsItems) {
      const key = item.wbsCode.trim().toUpperCase();
      const existingRow = seen.get(key);

      if (existingRow) {
        errors.push({
          rowNumber: item.rowNumber,
          columnName: "WBS code",
          errorMessage: `Duplicate WBS code "${item.wbsCode}". Already found on row ${existingRow}.`,
          rawValue: item.wbsCode,
        });
      }

      seen.set(key, item.rowNumber);
    }
  }

  private isEmptyRow(row: ExcelJS.Row): boolean {
    if (!Array.isArray(row.values)) return true;

    return row.values
      .slice(1)
      .every((value) => String(value ?? "").trim().length === 0);
  }

  private getCellValue(row: ExcelJS.Row, columnNumber: number): ExcelJS.CellValue {
    return row.getCell(columnNumber).value;
  }

  private getCellText(row: ExcelJS.Row, columnNumber: number): string {
    const value = row.getCell(columnNumber).value;

    if (value === null || value === undefined) return "";

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === "object") {
      if ("text" in value) {
        return String(value.text ?? "").trim();
      }

      if ("result" in value) {
        return String(value.result ?? "").trim();
      }

      if ("richText" in value && Array.isArray(value.richText)) {
        return value.richText.map((part) => part.text).join("").trim();
      }

      if ("hyperlink" in value && "text" in value) {
        return String(value.text ?? "").trim();
      }
    }

    return String(value).trim();
  }

  private stringifyCellValue(value: ExcelJS.CellValue): string {
    if (value === null || value === undefined) return "";

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === "object") {
      if ("text" in value) {
        return String(value.text ?? "");
      }

      if ("result" in value) {
        return String(value.result ?? "");
      }

      if ("richText" in value && Array.isArray(value.richText)) {
        return value.richText.map((part) => part.text).join("");
      }
    }

    return String(value);
  }

  private parseInteger(value: string): number | null {
    const cleaned = value.replace(/,/g, "").trim();

    if (!cleaned) return null;

    const parsed = Number(cleaned);

    if (!Number.isFinite(parsed)) return null;

    return Math.trunc(parsed);
  }

  private parseOptionalInteger(value: string): number | null {
    return this.parseInteger(value);
  }

  private parseDate(value: ExcelJS.CellValue): Date | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }

    if (typeof value === "number") {
      return this.excelSerialDateToJsDate(value);
    }

    if (typeof value === "object") {
      if ("result" in value) {
        return this.parseDate(value.result as ExcelJS.CellValue);
      }

      if ("text" in value) {
        return this.parseDate(value.text as ExcelJS.CellValue);
      }
    }

    const raw = String(value).trim();

    if (!raw) return null;

    const customParsed = this.parseDayMonthYear(raw);

    if (customParsed) {
      return customParsed;
    }

    const parsedByJs = new Date(raw);

    if (!Number.isNaN(parsedByJs.getTime())) {
      return parsedByJs;
    }

    return null;
  }

  private parseDayMonthYear(value: string): Date | null {
    const match = value.match(/^(\d{1,2})[-/ ]([A-Za-z]{3,})[-/ ](\d{2,4})$/);

    if (!match) return null;

    const [, dayRaw, monthRaw, yearRaw] = match;

    const monthMap: Record<string, number> = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      sept: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    };

    const day = Number(dayRaw);
    const month = monthMap[monthRaw.toLowerCase()];
    const year =
      yearRaw.length === 2 ? 2000 + Number(yearRaw) : Number(yearRaw);

    if (!Number.isInteger(day)) return null;
    if (month === undefined) return null;
    if (!Number.isInteger(year)) return null;

    const date = new Date(Date.UTC(year, month, day));

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  private excelSerialDateToJsDate(serial: number): Date {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;

    return new Date(utcValue * 1000);
  }

  private looksLikeActivityCode(value: string): boolean {
    const cleaned = value.trim();

    if (!cleaned) {
      return false;
    }

    /**
     * WBS codes look like:
     * 1
     * 1.1
     * 3.2.3.1.1.1
     */
    if (/^\d+(\.\d+)*$/.test(cleaned)) {
      return false;
    }

    /**
     * WBS names usually have spaces.
     * Activity codes usually do not.
     */
    if (/\s/.test(cleaned)) {
      return false;
    }

    /**
     * Examples matched:
     * MS-1001
     * PRE-TNC-V-T1-P1-1085
     * A1000
     * ACT-001
     */
    return /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(cleaned);
  }

  private resolveWbsName(
    row: ExcelJS.Row,
    headerMap: Record<string, number>,
    rawActivityNameFromHeader: string,
  ): string {
    const directName = rawActivityNameFromHeader.trim();

    if (directName) {
      return directName;
    }

    /**
     * Some Excel exports visually place the WBS title in shifted cells.
     * So scan the row and pick the first meaningful text that is not a known
     * numeric/date/code column.
     */
    return this.findFirstMeaningfulTextInRow(row, headerMap, {
      allowActivityCodeCell: true,
    });
  }

  private resolveActivityName(
    row: ExcelJS.Row,
    headerMap: Record<string, number>,
    rawActivityNameFromHeader: string,
  ): string {
    const directName = rawActivityNameFromHeader.trim();

    if (directName) {
      return directName;
    }

    return this.findFirstTextBetweenColumns(
      row,
      headerMap["Activity ID"] + 1,
      headerMap["Duration"] - 1,
    );
  }

  private findFirstTextBetweenColumns(
    row: ExcelJS.Row,
    startColumn: number,
    endColumn: number,
  ): string {
    if (startColumn > endColumn) {
      return "";
    }

    for (
      let columnNumber = startColumn;
      columnNumber <= endColumn;
      columnNumber++
    ) {
      const value = this.getCellText(row, columnNumber).trim();

      if (!this.isMeaningfulNameCandidate(value)) {
        continue;
      }

      return value;
    }

    return "";
  }

  private findFirstMeaningfulTextInRow(
    row: ExcelJS.Row,
    headerMap: Record<string, number>,
    options?: {
      allowActivityCodeCell?: boolean;
    },
  ): string {
    const excludedColumns = new Set<number>([
      headerMap["WBS Level"],
      headerMap["WBS code"],
      headerMap["Duration"],
      headerMap["Start"],
      headerMap["Finish"],
      headerMap["Total Float"],
    ]);

    if (!options?.allowActivityCodeCell) {
      excludedColumns.add(headerMap["Activity ID"]);
    }

    if (!Array.isArray(row.values)) {
      return "";
    }

    for (let columnNumber = 1; columnNumber < row.values.length; columnNumber++) {
      if (excludedColumns.has(columnNumber)) {
        continue;
      }

      const value = this.getCellText(row, columnNumber).trim();

      if (!this.isMeaningfulNameCandidate(value)) {
        continue;
      }

      return value;
    }

    return "";
  }

  private isMeaningfulNameCandidate(value: string): boolean {
    const cleaned = value.trim();

    if (!cleaned) {
      return false;
    }

    if (this.looksLikeNumber(cleaned)) {
      return false;
    }

    if (this.parseDate(cleaned)) {
      return false;
    }

    /**
     * Do not use WBS codes as names.
     */
    if (/^\d+(\.\d+)*$/.test(cleaned)) {
      return false;
    }

    return true;
  }

  private looksLikeNumber(value: string): boolean {
    const cleaned = value.replace(/,/g, "").trim();

    if (!cleaned) {
      return false;
    }

    return Number.isFinite(Number(cleaned));
  }
}