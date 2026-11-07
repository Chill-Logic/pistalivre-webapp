import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useDeleteVehicle } from "@/hooks/api/gestao/vehicles/useDeleteVehicle";
import { formatPlate } from "@/utils/plate";

type VehicleDeleteButtonProps = {
  vehicleId: string;
  plate: string;
};

/** Deletes the vehicle and its documents (bucket included), after confirming. */
export function VehicleDeleteButton({
  vehicleId,
  plate,
}: VehicleDeleteButtonProps) {
  const navigate = useNavigate();
  const remove = useDeleteVehicle(vehicleId);

  return (
    <ConfirmDialog
      destructive
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 />
          Excluir
        </Button>
      }
      title={`Excluir o veículo ${formatPlate(plate)}?`}
      description="Os documentos dele também são apagados. Isso não pode ser desfeito."
      confirmLabel="Excluir veículo"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => navigate(ROUTES.vehicles, { replace: true }),
        })
      }
    />
  );
}
