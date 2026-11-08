import type { StatementSource } from "@/types/statement";

/** One saved spreadsheet: downloading again gives the SAME file. */
export type StatementExport = {
  id: string;
  source: StatementSource;
  /** yyyy-mm-dd */
  startDate: string;
  endDate: string;
  /** ISO date-time. */
  exportedAt: string;
  fileName: string;
  rowCount: number;
  /** Bytes. */
  size: number;
  createdByName: string | null;
};

export type StatementExportInput = {
  sources: StatementSource[];
  /** yyyy-mm-dd */
  start: string;
  end: string;
};

/** A source that could not be exported (the others still were). */
export type StatementExportFailure = {
  source: StatementSource;
  label: string;
  message: string;
};

export type StatementExportResult = {
  files: { id: string; fileName: string }[];
  failures: StatementExportFailure[];
};
