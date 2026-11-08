import { Ban } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useCancelInvoice } from "@/hooks/api/gestao/invoices/useInvoiceMutations";
import type { Invoice } from "@/types/invoice";

/** Cancels the NFS-e at Asaas (final; outside the city's window it refuses). */
export function InvoiceCancelButton({ invoice }: { invoice: Invoice }) {
  const cancel = useCancelInvoice();
  const [open, setOpen] = useState(false);
  const name = invoice.number ? `NF ${invoice.number}` : "nota fiscal";

  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          aria-label={`Cancelar ${name}`}
        >
          <Ban />
          Cancelar NF
        </Button>
      }
      title="Cancelar nota fiscal?"
      description="A nota é cancelada no Asaas. Essa ação é definitiva; fora do prazo da prefeitura o Asaas recusa."
      confirmLabel="Cancelar nota"
      isPending={cancel.isPending}
      onConfirm={() =>
        cancel.mutate(invoice.id, {
          onSuccess: () => setOpen(false),
          onError: (error) => toast.error(moneyErrorMessage(error)),
        })
      }
    />
  );
}
