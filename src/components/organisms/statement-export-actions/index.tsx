import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { errorMessage } from "@/helpers/api-error";
import {
  useDeleteStatementExport,
  useDownloadStatementExport,
} from "@/hooks/api/gestao/finance/useStatementExportMutations";
import type { StatementExport } from "@/types/statement-export";
import { formatCalendarDate } from "@/utils/format";

/** "Baixar" (the same saved file) and "Excluir" (confirmed). */
export function StatementExportActions({
  item,
  compact = false,
}: {
  item: StatementExport;
  /** Icons only (table rows); the labels stay for screen readers. */
  compact?: boolean;
}) {
  const download = useDownloadStatementExport();
  const remove = useDeleteStatementExport();
  const [open, setOpen] = useState(false);
  const period = `${formatCalendarDate(item.startDate)} a ${formatCalendarDate(item.endDate)}`;

  return (
    <>
      <Button
        variant="ghost"
        size={compact ? "icon" : "sm"}
        disabled={download.isPending}
        onClick={() => download.mutate(item)}
        aria-label={`Baixar ${item.fileName}`}
        title="Baixar"
      >
        {download.isPending ? <Spinner /> : <Download />}
        {!compact && "Baixar"}
      </Button>
      <ConfirmDialog
        destructive
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button
            variant="ghost"
            size={compact ? "icon" : "sm"}
            className="text-destructive"
            aria-label={`Excluir ${item.fileName}`}
            title="Excluir"
          >
            <Trash2 />
            {!compact && "Excluir"}
          </Button>
        }
        title="Excluir exportação?"
        description={`A planilha de ${period} sai do histórico e não dá mais para baixá-la. Os lançamentos do banco não mudam.`}
        confirmLabel="Excluir"
        isPending={remove.isPending}
        onConfirm={() =>
          remove.mutate(item.id, {
            onSuccess: () => setOpen(false),
            onError: (error) => toast.error(errorMessage(error)),
          })
        }
      />
    </>
  );
}
