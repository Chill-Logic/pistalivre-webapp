import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useDeleteCustomer } from "@/hooks/api/gestao/customers/useDeleteCustomer";

type CustomerDeleteButtonProps = {
  customerId: string;
  name: string;
  /** The API refuses (409) a customer with rentals; say it up front. */
  hasRentals: boolean;
};

/** Deletes the customer and their documents (not the Asaas record). */
export function CustomerDeleteButton({
  customerId,
  name,
  hasRentals,
}: CustomerDeleteButtonProps) {
  const navigate = useNavigate();
  const remove = useDeleteCustomer(customerId);

  return (
    <ConfirmDialog
      destructive
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 />
          Excluir
        </Button>
      }
      title={`Excluir ${name}?`}
      description={
        hasRentals
          ? "Este cliente tem locações e não pode ser excluído."
          : "Os documentos dele também são apagados (o cadastro no Asaas fica). Isso não pode ser desfeito."
      }
      confirmLabel="Excluir cliente"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => navigate(ROUTES.customers, { replace: true }),
        })
      }
    />
  );
}
