import { Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { errorMessage } from "@/helpers/api-error";
import { useSyncAsaasCustomer } from "@/hooks/api/gestao/customers/useAsaasCustomerMutations";

type AsaasSyncButtonProps = {
  customerId: string;
  customerName: string;
};

/**
 * "Vincular ao Asaas" on the customer screen, for who is not there yet (the
 * public pré-cadastro never touches the gateway). The server finds the person
 * by CPF or creates them with the full profile, so charges and NF work.
 */
export function AsaasSyncButton({ customerId, customerName }: AsaasSyncButtonProps) {
  const sync = useSyncAsaasCustomer();
  const [open, setOpen] = useState(false);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline" size="sm">
          <Link2 />
          Vincular ao Asaas
        </Button>
      }
      title="Vincular ao Asaas?"
      description={`O sistema procura ${customerName} no Asaas pelo CPF e, se não achar, cria o cadastro lá com os dados daqui. É o que permite emitir cobrança e nota fiscal para ele.`}
      confirmLabel="Vincular"
      isPending={sync.isPending}
      onConfirm={() =>
        sync.mutate(customerId, {
          onSuccess: () => setOpen(false),
          onError: (error) => toast.error(errorMessage(error)),
        })
      }
    />
  );
}
