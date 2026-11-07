import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useDeleteContractTemplate } from "@/hooks/api/gestao/templates/useContractTemplateMutations";

/**
 * Deletes a contract template. Contracts already issued keep their own
 * snapshot, so they are not affected; deactivating is the softer option.
 */
export function ContractTemplateDeleteButton({
  templateId,
  name,
}: {
  templateId: string;
  name: string;
}) {
  const navigate = useNavigate();
  const remove = useDeleteContractTemplate(templateId);

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
      description="Contratos já gerados com ele não mudam (cada um guarda o próprio texto). Para só tirá-lo da lista de geração, edite e desmarque “Ativo”."
      confirmLabel="Excluir modelo"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => navigate(ROUTES.models, { replace: true }),
        })
      }
    />
  );
}
