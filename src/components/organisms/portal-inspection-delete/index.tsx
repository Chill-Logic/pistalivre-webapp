import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useInspectionMutations } from "@/hooks/api/cliente/rentals/useInspectionMutations";

/** Deletes an inspection the renter made (and its photos). */
export function PortalInspectionDelete({
  rentalId,
  inspectionId,
}: {
  rentalId: string;
  inspectionId: string;
}) {
  const { remove } = useInspectionMutations(rentalId);
  const [open, setOpen] = useState(false);

  return (
    <ConfirmDialog
      destructive
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 />
          Excluir
        </Button>
      }
      title="Excluir vistoria?"
      description="Remove a vistoria e as fotos dela. Não dá para desfazer."
      confirmLabel="Excluir vistoria"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(inspectionId, { onSuccess: () => setOpen(false) })
      }
    />
  );
}
