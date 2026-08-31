import ExcelJS from 'exceljs';

export type ResearchWorkbookCell = string | number | boolean | null;

export interface ResearchWorkbookSheet {
  readonly name: string;
  readonly columns: readonly string[];
  readonly rows: readonly (readonly ResearchWorkbookCell[])[];
}

export interface ResearchWorkbookOptions {
  readonly exportedAtIso: string;
  readonly sheets: readonly ResearchWorkbookSheet[];
}

const maximumColumnWidth = 48;
const sampledRowCount = 250;

function displayedLength(value: ResearchWorkbookCell): number {
  if (value === null) return 0;
  return String(value)
    .split(/\r?\n/u)
    .reduce((maximum, line) => Math.max(maximum, line.length), 0);
}

function columnWidth(sheet: ResearchWorkbookSheet, columnIndex: number): number {
  const sampledRows = sheet.rows.slice(0, sampledRowCount);
  const contentWidth = sampledRows.reduce((maximum, row) => {
    const value = row[columnIndex] ?? null;
    return Math.max(maximum, displayedLength(value));
  }, sheet.columns[columnIndex]?.length ?? 0);
  return Math.min(maximumColumnWidth, Math.max(12, contentWidth + 2));
}

function addSheet(workbook: ExcelJS.Workbook, sheet: ResearchWorkbookSheet): void {
  const worksheet = workbook.addWorksheet(sheet.name, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  worksheet.addRow([...sheet.columns]);
  for (const row of sheet.rows) worksheet.addRow([...row]);

  const header = worksheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF315C5C' },
  };
  header.alignment = { vertical: 'middle', wrapText: true };
  header.height = 30;

  worksheet.columns.forEach((column, index) => {
    column.width = columnWidth(sheet, index);
    column.alignment = { vertical: 'top', wrapText: true };
  });
  if (sheet.columns.length > 0) {
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columns.length },
    };
  }
}

export async function createResearchWorkbook({
  exportedAtIso,
  sheets,
}: ResearchWorkbookOptions): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const exportDate = new Date(exportedAtIso);
  workbook.creator = 'PassWo Study Export';
  workbook.lastModifiedBy = 'PassWo Study Export';
  workbook.created = exportDate;
  workbook.modified = exportDate;
  workbook.subject = 'Kontrollierter pseudonymisierter Forschungsdatenexport';
  workbook.title = 'PassWo Study Export';

  for (const sheet of sheets) addSheet(workbook, sheet);
  const workbookBuffer = await workbook.xlsx.writeBuffer({
    useSharedStrings: true,
    useStyles: true,
  });
  return Buffer.from(workbookBuffer);
}
