import { http } from "@/services/http/client";
import type {
  Statement,
  StatementAnnotationInput,
  StatementFilters,
} from "@/types/statement";

export const statementService = {
  async load(filters: StatementFilters) {
    const { data } = await http.get<Statement>("/finance/statement", {
      params: filters,
    });
    return data;
  },
  /** Our note / internal-transfer mark; the bank's own text never changes. */
  async annotate(input: StatementAnnotationInput) {
    await http.patch("/finance/statement/annotation", input);
  },
};
