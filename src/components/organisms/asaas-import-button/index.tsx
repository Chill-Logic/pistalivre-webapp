import { Download } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { routeTo } from "@/constants/routes";
import { errorMessage } from "@/helpers/api-error";
import { useImportAsaasCustomer } from "@/hooks/api/gestao/customers/useAsaasCustomerMutations";
import type { AsaasOnlyCustomer } from "@/types/customer";
import { formatCpf } from "@/utils/document";

/**
 * Brings an "only in Asaas" customer into our base, already linked (name,
 * CPF, e-mail and phone come from Asaas), then opens the edit form to
 * complete the record.
 */
export function AsaasImportButton({
  customer,
}: {
  customer: AsaasOnlyCustomer;
}) {
  const importCustomer = useImportAsaasCustomer();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const document = customer.document
    ? `CPF ${formatCpf(customer.document)}`
    : "sem CPF";

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          size="sm"
          aria-label={`Importar ${customer.name} do Asaas`}
        >
          <Download />
          Importar
        </Button>
      }
      title="Importar do Asaas?"
      description={`${customer.name} (${document}) entra no cadastro já vinculado ao Asaas, com nome, CPF, e-mail e telefone de lá. Em seguida, você completa o resto do cadastro.`}
      confirmLabel="Importar"
      isPending={importCustomer.isPending}
      onConfirm={() =>
        importCustomer.mutate(customer.id, {
          onSuccess: (created) => {
            setOpen(false);
            navigate(routeTo.editCustomer(created.id));
          },
          onError: (error) => toast.error(errorMessage(error)),
        })
      }
    />
  );
}
