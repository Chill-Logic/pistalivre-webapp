import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useLeadActions } from "@/hooks/api/gestao/crm/useLeadActions";

/** Deletes the lead with its trail and attachments. */
export function LeadDeleteButton({ leadId, name }: { leadId: string; name: string }) {
  const navigate = useNavigate();
  const { remove } = useLeadActions(leadId);

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
      description="As atividades e os anexos dele também são apagados. Para encerrar um lead que não foi adiante, prefira marcá-lo como perdido. Isso não pode ser desfeito."
      confirmLabel="Excluir lead"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => navigate(ROUTES.crm, { replace: true }),
        })
      }
    />
  );
}
