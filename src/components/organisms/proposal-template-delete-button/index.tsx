import { Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useDeleteProposalTemplate } from "@/hooks/api/gestao/templates/useProposalTemplateMutations";

/**
 * Deletes a proposal template. Proposals already issued keep their own
 * snapshot; deactivating is the softer option.
 */
export function ProposalTemplateDeleteButton({
  templateId,
  name,
}: {
  templateId: string;
  name: string;
}) {
  const remove = useDeleteProposalTemplate(templateId);

  return (
    <ConfirmDialog
      destructive
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 />
          Excluir
        </Button>
      }
      title={`Excluir o modelo “${name}”?`}
      description="Propostas já emitidas com ele não mudam (cada uma guarda o próprio texto). Para só tirá-lo da emissão, edite e desmarque “Ativo”."
      confirmLabel="Excluir modelo"
      isPending={remove.isPending}
      onConfirm={() => remove.mutate()}
    />
  );
}
