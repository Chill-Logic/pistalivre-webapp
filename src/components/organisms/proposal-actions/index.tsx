import { Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { ProposalConvertDialog } from "@/components/organisms/proposal-convert-dialog";
import { ProposalRejectDialog } from "@/components/organisms/proposal-reject-dialog";
import { ROUTES } from "@/constants/routes";
import {
  useAcceptProposal,
  useDeleteProposal,
} from "@/hooks/api/gestao/proposals/useProposalMutations";
import type { ProposalDetail } from "@/types/proposal";

/**
 * What can be done with an issued proposal (same rules as the management
 * app): while SENT, mark it accepted or refused; a standalone one can become
 * a CRM lead; delete takes the PDF along.
 */
export function ProposalActions({ proposal }: { proposal: ProposalDetail }) {
  const accept = useAcceptProposal(proposal.id);
  const remove = useDeleteProposal(proposal.id);
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <Box className="flex flex-wrap justify-end gap-2">
      {!proposal.lead && <ProposalConvertDialog proposal={proposal} />}
      {proposal.status === "SENT" && (
        <>
          <ConfirmDialog
            open={accepting}
            onOpenChange={setAccepting}
            trigger={
              <Button variant="outline" size="sm">
                <Check />
                Aceita
              </Button>
            }
            title="Marcar proposta como aceita?"
            description="Registra que o destinatário aceitou esta proposta."
            confirmLabel="Marcar aceita"
            isPending={accept.isPending}
            onConfirm={() =>
              accept.mutate(undefined, { onSuccess: () => setAccepting(false) })
            }
          />
          <ProposalRejectDialog proposalId={proposal.id} />
        </>
      )}
      <ConfirmDialog
        destructive
        open={deleting}
        onOpenChange={setDeleting}
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            aria-label="Excluir proposta"
          >
            <Trash2 />
            Excluir
          </Button>
        }
        title="Excluir proposta?"
        description="Remove a proposta e o PDF. Não pode ser desfeito."
        confirmLabel="Excluir proposta"
        isPending={remove.isPending}
        onConfirm={() =>
          remove.mutate(undefined, {
            onSuccess: () => navigate(ROUTES.proposals, { replace: true }),
          })
        }
      />
    </Box>
  );
}
