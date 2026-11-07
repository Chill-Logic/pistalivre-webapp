import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useDeleteSupplier } from "@/hooks/api/gestao/suppliers/useDeleteSupplier";

type SupplierDeleteButtonProps = {
  supplierId: string;
  name: string;
};

/**
 * Deletes the supplier with its vehicle links and documents. A debt that had
 * it as lender keeps the name (snapshot).
 */
export function SupplierDeleteButton({
  supplierId,
  name,
}: SupplierDeleteButtonProps) {
  const navigate = useNavigate();
  const remove = useDeleteSupplier(supplierId);

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
      description="Os vínculos com veículos e os documentos dele também são apagados. Isso não pode ser desfeito."
      confirmLabel="Excluir fornecedor"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => navigate(ROUTES.suppliers, { replace: true }),
        })
      }
    />
  );
}
