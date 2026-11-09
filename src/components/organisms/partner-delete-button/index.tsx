import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useDeletePartner } from "@/hooks/api/gestao/partners/usePartnerMutations";

type PartnerDeleteButtonProps = {
  partnerId: string;
  name: string;
};

/**
 * Deletes a partner without contracts (the page offers it only then: a
 * contract is the partner's history, so the API refuses it).
 */
export function PartnerDeleteButton({
  partnerId,
  name,
}: PartnerDeleteButtonProps) {
  const navigate = useNavigate();
  const remove = useDeletePartner(partnerId);

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
      description="O cadastro e o acesso à área do parceiro são apagados. Isso não pode ser desfeito."
      confirmLabel="Excluir parceiro"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () => navigate(ROUTES.partners, { replace: true }),
        })
      }
    />
  );
}
