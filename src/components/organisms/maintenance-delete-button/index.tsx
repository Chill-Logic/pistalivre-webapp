import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useDeleteMaintenance } from "@/hooks/api/gestao/maintenances/useMaintenanceMutations";

/** Deletes the maintenance and its attachments, after confirming. */
export function MaintenanceDeleteButton({
  maintenanceId,
}: {
  maintenanceId: string;
}) {
  const navigate = useNavigate();
  const remove = useDeleteMaintenance(maintenanceId);

  return (
    <ConfirmDialog
      destructive
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 />
          Excluir
        </Button>
      }
      title="Excluir a manutenção?"
      description="Os anexos dela também são apagados. Um reembolso pedido a partir dela continua existindo, só sem o vínculo."
      confirmLabel="Excluir manutenção"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => navigate(ROUTES.maintenances, { replace: true }),
        })
      }
    />
  );
}
