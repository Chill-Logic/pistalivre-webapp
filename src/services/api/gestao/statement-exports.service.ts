import { http } from "@/services/http/client";
import type {
  StatementExport,
  StatementExportInput,
  StatementExportResult,
} from "@/types/statement-export";

const idempotent = (key: string) => ({
  headers: { "Idempotency-Key": key },
});

/** Spreadsheets for the accountant (saved) and the bank's official PDF. */
export const statementExportsService = {
  async list() {
    const { data } = await http.get<{ items: StatementExport[] }>(
      "/finance/statement/exports",
    );
    return data.items;
  },
  /** One .xlsx per source; a source that is down comes in `failures`. */
  async create(input: StatementExportInput, key: string) {
    const { data } = await http.post<StatementExportResult>(
      "/finance/statement/exports",
      input,
      { ...idempotent(key), timeout: 120_000 },
    );
    return data;
  },
  /** The SAME file as when it was exported (not a new bank query). */
  async download(id: string) {
    const { data } = await http.get<Blob>(
      `/finance/statement/exports/${id}`,
      { responseType: "blob", timeout: 120_000 },
    );
    return data;
  },
  async remove(id: string) {
    await http.delete(`/finance/statement/exports/${id}`);
  },
  /** The OFFICIAL Inter statement (PDF) for the period. */
  async bankPdf(range: { start: string; end: string }) {
    const { data } = await http.get<Blob>("/finance/statement/bank-pdf", {
      params: range,
      responseType: "blob",
      timeout: 120_000,
    });
    return data;
  },
};
