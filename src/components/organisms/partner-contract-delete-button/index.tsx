import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { routeTo } from "@/constants/routes";
import { useDeletePartnerContract } from "@/hooks/api/gestao/partners/usePartnerContractMutations";

type PartnerContractDeleteButtonProps = {
  contractId: string;
  code: string;
  partnerId: string;
};

/** Deletes a draft (only drafts: once active, it is the partner's history). */
export function PartnerContractDeleteButton({
  contractId,
  code,
  partnerId,
}: PartnerContractDeleteButtonProps) {
  const navigate = useNavigate();
  const remove = useDeletePartnerContract(contractId);

  return (
    <ConfirmDialog
      destructive
      trigger={
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 />
          Excluir
        </Button>
      }
      title={`Excluir o rascunho ${code}?`}
      description="O contrato e os veículos incluídos nele são apagados. Isso não pode ser desfeito."
      confirmLabel="Excluir rascunho"
      isPending={remove.isPending}
      onConfirm={() =>
        remove.mutate(undefined, {
          onSuccess: () =>
            navigate(routeTo.partner(partnerId), { replace: true }),
        })
      }
    />
  );
}
