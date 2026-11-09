import { useMemo } from "react";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { AiAuditFilters } from "@/types/ai";

const KEYS = ["canal", "pessoa", "app", "ferramenta", "resultado", "de", "ate"] as const;

/** The audit's filters in the URL (shareable; any change goes back to page 1). */
export function useAiAuditFilters() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } = useUrlFilters(KEYS);
  const filters = useMemo<AiAuditFilters>(
    () => ({
      page,
      pageSize,
      channel: values.canal,
      userId: values.pessoa,
      clientId: values.app,
      tool: values.ferramenta,
      ok: values.resultado === "sucesso" ? "true" : values.resultado === "falha" ? "false" : "",
      de: values.de,
      ate: values.ate,
    }),
    [values, page, pageSize],
  );
  return { filters, values, setFilter, setPage, setPageSize };
}
