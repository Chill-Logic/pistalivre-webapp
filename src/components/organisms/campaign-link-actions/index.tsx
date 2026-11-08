import { FlaskConical, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { routeTo } from "@/constants/routes";
import {
  useDeleteCampaignLink,
  useSimulateCampaignLead,
} from "@/hooks/api/gestao/crm/useCampaignLinks";
import type { CampaignLink } from "@/types/crm";

/** "Simular lead" (opens the lead created) and "Apagar", both confirmed. */
export function CampaignLinkActions({ link }: { link: CampaignLink }) {
  const navigate = useNavigate();
  const simulate = useSimulateCampaignLead(link.id);
  const remove = useDeleteCampaignLink(link.id);

  return (
    <>
      <ConfirmDialog
        trigger={
          <Button variant="outline" size="sm">
            <FlaskConical />
            Simular lead
          </Button>
        }
        title="Gerar um lead de teste?"
        description="Cria um lead de teste por este link (fora das métricas) para você conferir a atribuição no funil. Depois, apague-o em “Apagar leads de teste”."
        confirmLabel="Gerar lead de teste"
        isPending={simulate.isPending}
        onConfirm={() =>
          simulate.mutate(undefined, {
            onSuccess: ({ leadId }) => navigate(routeTo.lead(leadId)),
          })
        }
      />
      <ConfirmDialog
        destructive
        trigger={
          <Button variant="ghost" size="sm" className="text-destructive">
            <Trash2 />
            Apagar
          </Button>
        }
        title={`Apagar o link “${link.label}”?`}
        description="Quem abrir o endereço não será mais atribuído a esta campanha. Os leads que já vieram por ele continuam no funil, com a origem preservada."
        confirmLabel="Apagar link"
        isPending={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </>
  );
}
