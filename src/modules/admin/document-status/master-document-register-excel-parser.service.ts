import { BadRequestException, Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";

export interface ParsedMasterDocumentRegisterRow {
  rowNumber: number;
  slNo: string | null;
  documentType: string | null;
  discipline: string | null;
  documentCategory: string | null;
  documentTitle: string | null;
  documentTypeCode: string | null;
  documentNo: string | null;
  revision: string | null;
  packageName: string | null;
  qty: number | null;
  plannedSubmissionDate: Date | null;
  actualSubmissionDate: Date | null;
  status: string | null;
  delayIndicator: string | null;
  remarks: string | null;
}

export interface MasterDocumentRegisterParseResult {
  sheetName: string;
  headerRowNumber: number;
  totalRows: number;
  validRows: ParsedMasterDocumentRegisterRow[];
  skippedRows: number;
  errors: {
    rowNumber: number;
    message: string;
  }[];
}

type ColumnKey =
  | "slNo"
  | "documentType"
  | "discipline"
  | "documentCategory"
  | "documentTitle"
  | "documentTypeCode"
  | "documentNo"
  | "revision"
  | "packageName"
  | "qty"
  | "plannedSubmissionDate"
  | "actualSubmissionDate"
  | "status"
  | "delayIndicator"
  | "remarks";

const HEADER_ALIASES: Record<ColumnKey, string[]> = {
  slNo: [
    "sl no",
    "sl no.",
    "slno",
    "s no",
    "s no.",
    "serial no",
    "serial number",
  ],
  documentType: [
    "document type",
    "doc type",
    "document submittal type",
    "submittal type",
  ],
  discipline: ["discipline", "department"],
  documentCategory: [
    "doc category",
    "doc. category",
    "document category",
    "category",
  ],
  documentTitle: [
    "document title",
    "doc title",
    "title",
    "description",
  ],
  documentTypeCode: [
    "document type code",
    "doc type code",
    "type code",
    "document code",
    "doc code",
  ],
  documentNo: [
    "document no",
    "document no.",
    "doc no",
    "doc no.",
    "document number",
    "doc number",
  ],
  revision: ["revision", "rev"],
  packageName: ["package", "package name", "pkg"],
  qty: ["qty", "quantity", "qnty"],
  plannedSubmissionDate: [
    "planned submission date",
    "planned submittal date",
    "planned submit date",
    "planned date",
  ],
  actualSubmissionDate: [
    "actual submission date",
    "actual submittal date",
    "actual submit date",
    "actual date",
  ],
  status: ["status", "current status"],
  delayIndicator: ["delay indicator", "delay", "delay status"],
  remarks: ["remarks", "remark", "comments", "comment"],
};

@Injectable()
export class MasterDocumentRegisterExcelParserService {
  async parse(
    fileBuffer: Express.Multer.File["buffer"],
  ): Promise<MasterDocumentRegisterParseResult> {
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(
      Buffer.from(fileBuffer) as unknown as Parameters<
        typeof workbook.xlsx.load
      >[0],
    );

    const detectedSheet = this.findWorksheetWithHeader(workbook);

    if (!detectedSheet) {
      throw new BadRequestException({
        message: "Could not find the Master Document Register header row.",
        hint:
          "The parser scanned all worksheets but could not find a row that looks like the table header. Check the preview below and adjust aliases if needed.",
        scannedSheets: workbook.worksheets.map((sheet) => ({
          sheetName: sheet.name,
          rowCount: sheet.rowCount,
          preview: this.previewWorksheetRows(sheet),
        })),
      });
    }

    const { worksheet, headerRowNumber } = detectedSheet;
    const columnMap = this.buildColumnMap(worksheet.getRow(headerRowNumber));

    if (!columnMap.documentTitle) {
      throw new BadRequestException({
        message: "Document Title column is required in the Excel file.",
        detectedSheet: worksheet.name,
        headerRowNumber,
        detectedColumns: columnMap,
        headerPreview: this.getNormalizedRowValues(
          worksheet.getRow(headerRowNumber),
        ),
      });
    }

    const validRows: ParsedMasterDocumentRegisterRow[] = [];
    const errors: MasterDocumentRegisterParseResult["errors"] = [];
    let skippedRows = 0;

    for (
      let rowNumber = headerRowNumber + 1;
      rowNumber <= worksheet.rowCount;
      rowNumber += 1
    ) {
      const row = worksheet.getRow(rowNumber);

      const documentTitle = this.getString(row, columnMap.documentTitle);
      const documentNo = this.getString(row, columnMap.documentNo);
      const slNo = this.getString(row, columnMap.slNo);

      const isEmptyRow = !documentTitle && !documentNo && !slNo;

      if (isEmptyRow) {
        skippedRows += 1;
        continue;
      }

      try {
        validRows.push({
          rowNumber,
          slNo,
          documentType: this.getString(row, columnMap.documentType),
          discipline: this.getString(row, columnMap.discipline),
          documentCategory: this.getString(row, columnMap.documentCategory),
          documentTitle,
          documentTypeCode: this.getString(row, columnMap.documentTypeCode),
          documentNo,
          revision: this.getString(row, columnMap.revision),
          packageName: this.getString(row, columnMap.packageName),
          qty: this.getNumber(row, columnMap.qty),
          plannedSubmissionDate: this.getDate(
            row,
            columnMap.plannedSubmissionDate,
          ),
          actualSubmissionDate: this.getDate(
            row,
            columnMap.actualSubmissionDate,
          ),
          status: this.getString(row, columnMap.status),
          delayIndicator: this.getString(row, columnMap.delayIndicator),
          remarks: this.getString(row, columnMap.remarks),
        });
      } catch (error) {
        errors.push({
          rowNumber,
          message:
            error instanceof Error ? error.message : "Failed to parse row.",
        });
      }
    }

    return {
      sheetName: worksheet.name,
      headerRowNumber,
      totalRows: worksheet.rowCount,
      validRows,
      skippedRows,
      errors,
    };
  }

  private findWorksheetWithHeader(workbook: ExcelJS.Workbook) {
    for (const worksheet of workbook.worksheets) {
      const headerRowNumber = this.findHeaderRowNumber(worksheet);

      if (headerRowNumber) {
        return {
          worksheet,
          headerRowNumber,
        };
      }
    }

    return null;
  }

  private findHeaderRowNumber(worksheet: ExcelJS.Worksheet) {
    const maxRowsToScan = Math.min(200, worksheet.rowCount);

    let bestMatch: {
      rowNumber: number;
      score: number;
      headers: string[];
    } | null = null;

    for (let rowNumber = 1; rowNumber <= maxRowsToScan; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      const headers = this.getNormalizedRowValues(row);

      if (!headers.length) continue;

      const rowText = headers.join(" | ");
      const score = this.getHeaderMatchScore(headers);

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          rowNumber,
          score,
          headers,
        };
      }

      const hasDocumentTitle = this.rowHasAny(
        headers,
        HEADER_ALIASES.documentTitle,
      );

      const hasStrongSupportingHeader =
        this.rowHasAny(headers, HEADER_ALIASES.slNo) ||
        this.rowHasAny(headers, HEADER_ALIASES.documentType) ||
        this.rowHasAny(headers, HEADER_ALIASES.discipline) ||
        this.rowHasAny(headers, HEADER_ALIASES.status);

      const isTitleRow = rowText.includes("master document register");

      if (!isTitleRow && hasDocumentTitle && hasStrongSupportingHeader) {
        return rowNumber;
      }

      if (!isTitleRow && score >= 5) {
        return rowNumber;
      }
    }

    return bestMatch && bestMatch.score >= 5 ? bestMatch.rowNumber : null;
  }

  private getHeaderMatchScore(headers: string[]) {
    const headerText = headers.join(" | ");

    if (headerText.includes("master document register")) {
      return 0;
    }

    let score = 0;

    if (this.rowHasAny(headers, HEADER_ALIASES.slNo)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.documentType)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.discipline)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.documentCategory)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.documentTitle)) score += 2;
    if (this.rowHasAny(headers, HEADER_ALIASES.documentTypeCode)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.documentNo)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.revision)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.packageName)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.qty)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.plannedSubmissionDate)) {
      score += 1;
    }
    if (this.rowHasAny(headers, HEADER_ALIASES.actualSubmissionDate)) {
      score += 1;
    }
    if (this.rowHasAny(headers, HEADER_ALIASES.status)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.delayIndicator)) score += 1;
    if (this.rowHasAny(headers, HEADER_ALIASES.remarks)) score += 1;

    return score;
  }

  private buildColumnMap(row: ExcelJS.Row) {
    const columnMap: Partial<Record<ColumnKey, number>> = {};

    row.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
      const normalizedHeader = this.normalizeHeader(
        cell.text || this.cellValueToString(cell.value),
      );

      for (const [key, aliases] of Object.entries(HEADER_ALIASES) as [
        ColumnKey,
        string[],
      ][]) {
        if (this.matchesHeader(normalizedHeader, aliases)) {
          columnMap[key] = columnNumber;
        }
      }
    });

    return columnMap;
  }

  private rowHasAny(headers: string[], aliases: string[]) {
    return headers.some((header) => this.matchesHeader(header, aliases));
  }

  private getNormalizedRowValues(row: ExcelJS.Row) {
    const values: string[] = [];

    row.eachCell({ includeEmpty: false }, (cell) => {
      const value = this.normalizeHeader(
        cell.text || this.cellValueToString(cell.value),
      );

      if (value) {
        values.push(value);
      }
    });

    return values;
  }

  private previewWorksheetRows(worksheet: ExcelJS.Worksheet) {
    const rows: {
      rowNumber: number;
      values: string[];
    }[] = [];

    const maxRowsToPreview = Math.min(30, worksheet.rowCount);

    for (let rowNumber = 1; rowNumber <= maxRowsToPreview; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      const values = this.getNormalizedRowValues(row);

      if (values.length) {
        rows.push({
          rowNumber,
          values,
        });
      }
    }

    return rows;
  }

  private matchesHeader(normalizedHeader: string, aliases: string[]) {
    return aliases.some((alias) => {
      const normalizedAlias = this.normalizeHeader(alias);

      return (
        normalizedHeader === normalizedAlias ||
        normalizedHeader.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedHeader)
      );
    });
  }

  private getString(row: ExcelJS.Row, columnNumber?: number): string | null {
    if (!columnNumber) return null;

    const value = row.getCell(columnNumber).value;
    const text = this.cellValueToString(value).trim();

    return text || null;
  }

  private getNumber(row: ExcelJS.Row, columnNumber?: number): number | null {
    const text = this.getString(row, columnNumber);

    if (!text) return null;

    const cleaned = text.replace(/,/g, "");
    const value = Number(cleaned);

    return Number.isNaN(value) ? null : value;
  }

  private getDate(row: ExcelJS.Row, columnNumber?: number): Date | null {
    if (!columnNumber) return null;

    const cell = row.getCell(columnNumber);
    const value = cell.value;

    if (!value) return null;

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "number") {
      return this.excelSerialDateToDate(value);
    }

    const text = this.cellValueToString(value).trim();

    if (!text) return null;

    const parsed = new Date(text);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private cellValueToString(value: unknown): string {
    if (value === null || value === undefined) return "";

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === "object") {
      if ("text" in value && typeof value.text === "string") {
        return value.text;
      }

      if ("result" in value) {
        return this.cellValueToString(value.result);
      }

      if ("richText" in value && Array.isArray(value.richText)) {
        return value.richText
          .map((item: { text?: string }) => item.text ?? "")
          .join("");
      }
    }

    return String(value);
  }

  private normalizeHeader(value: string) {
    return value
      .replace(/\u00a0/g, " ")
      .replace(/\r?\n|\r/g, " ")
      .trim()
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private excelSerialDateToDate(serial: number) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    return new Date(excelEpoch + serial * 24 * 60 * 60 * 1000);
  }
}