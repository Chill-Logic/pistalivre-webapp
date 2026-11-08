import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useDeleteInspection } from "@/hooks/api/gestao/inspections/useInspectionMutations";

/** Deletes the inspection and its photos, after confirming; then `backTo`. */
export function InspectionDeleteButton({
  inspectionId,
  backTo,
}: {
  inspectionId: string;
  backTo: string;
}) {
  const navigate = useNavigate();
  const remove = useDeleteInspection(inspectionId);

  return (
    <ConfirmDialog
      destructive
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 />
          Excluir
        </Button>
      }
      title="Excluir a vistoria?"
      description="Remove a vistoria e as fotos dela. Não dá para desfazer."
      confirmLabel="Excluir vistoria"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => navigate(backTo, { replace: true }),
        })
      }
    />
  );
}
