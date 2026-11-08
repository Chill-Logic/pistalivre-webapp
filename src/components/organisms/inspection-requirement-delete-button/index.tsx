import { Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useDeleteInspectionRequirement } from "@/hooks/api/gestao/templates/useInspectionTemplateMutations";

/** Removes an item from a vehicle type's inspection (with confirmation). */
export function InspectionRequirementDeleteButton({
  requirementId,
  label,
  typeName,
}: {
  requirementId: string;
  label: string;
  typeName: string;
}) {
  const remove = useDeleteInspectionRequirement(requirementId);
  return (
    <ConfirmDialog
      destructive
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          aria-label={`Excluir o item ${label}`}
        >
          <Trash2 />
        </Button>
      }
      title={`Excluir “${label}”?`}
      description={`Deixa de ser pedido nas próximas vistorias de ${typeName}. As vistorias já feitas não mudam.`}
      confirmLabel="Excluir item"
      isPending={remove.isPending}
      onConfirm={() => remove.mutate()}
    />
  );
}
