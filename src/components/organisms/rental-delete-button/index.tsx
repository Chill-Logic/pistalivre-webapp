import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useDeleteRental } from "@/hooks/api/gestao/rentals/useDeleteRental";

type RentalDeleteButtonProps = {
  rentalId: string;
  code: string;
  isActive: boolean;
};

/**
 * Deletes the rental and its documents, after confirming. The API refuses
 * (409) when a charge is linked, and never touches the vehicle.
 */
export function RentalDeleteButton({
  rentalId,
  code,
  isActive,
}: RentalDeleteButtonProps) {
  const navigate = useNavigate();
  const remove = useDeleteRental(rentalId);

  return (
    <ConfirmDialog
      destructive
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 />
          Excluir
        </Button>
      }
      title={`Excluir a locação ${code}?`}
      description={
        isActive
          ? "Ela está ativa: excluir não devolve o veículo, então encerre ou cancele antes. Os documentos dela também são apagados, e locação com cobrança não pode ser excluída."
          : "Os documentos dela também são apagados e isso não pode ser desfeito. Locação com cobrança não pode ser excluída."
      }
      confirmLabel="Excluir locação"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => navigate(ROUTES.rentals, { replace: true }),
        })
      }
    />
  );
}
