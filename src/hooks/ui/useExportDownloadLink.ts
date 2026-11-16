import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useDownloadStatementExport } from "@/hooks/api/gestao/finance/useStatementExportMutations";
import { useStatementExports } from "@/hooks/api/gestao/finance/useStatementExports";

/**
 * `?baixar=<id>` (the link the AI agent sends after "exportar_extrato"):
 * downloads that saved spreadsheet once, then drops the param — a reload or
 * the back button must not download it again.
 */
export function useExportDownloadLink() {
  const [params, setParams] = useSearchParams();
  const id = params.get("baixar");
  const exports = useStatementExports();
  const download = useDownloadStatementExport();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!id || !exports.data || handled.current === id) return;
    handled.current = id;
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("baixar");
        return next;
      },
      { replace: true },
    );
    const item = exports.data.find((e) => e.id === id);
    if (!item) {
      toast.error(
        "Essa planilha não está mais no histórico (foi excluída ou o link está incompleto).",
      );
      return;
    }
    download.mutate(item, {
      onSuccess: () => toast.success(`${item.fileName} baixada`),
    });
  }, [id, exports.data, setParams, download]);
}
