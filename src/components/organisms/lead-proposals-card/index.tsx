import { Check, FileText, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { DocumentItem } from "@/components/molecules/document-item";
import { EmptyState } from "@/components/molecules/empty-state";
import { ProposalStatusBadge } from "@/components/molecules/proposal-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import { CopyProposalButton } from "@/components/organisms/copy-proposal-button";
import { DocumentEditDialog } from "@/components/organisms/document-edit-dialog";
import { ProposalRejectDialog } from "@/components/organisms/proposal-reject-dialog";
import { queryKeys } from "@/constants/query-keys";
import { routeTo } from "@/constants/routes";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import {
  useAcceptProposal,
  useDeleteProposal,
} from "@/hooks/api/gestao/proposals/useProposalMutations";
import type { LeadProposal } from "@/types/crm";
import { formatDateTime } from "@/utils/format";

type LeadProposalsCardProps = {
  leadId: string;
  proposals: LeadProposal[];
  /** "Emitir proposta", next to the title (hidden on a lost lead). */
  action?: ReactNode;
};

/**
 * The proposals issued to this lead, newest first: where each one stands,
 * its PDF (view, download, rename) and what can still be done with it.
 */
export function LeadProposalsCard({
  leadId,
  proposals,
  action,
}: LeadProposalsCardProps) {
  return (
    <Card>
      <CardHeader>
        <Box className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Propostas</CardTitle>
          {action}
        </Box>
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhuma proposta emitida ainda"
            description="Emita uma minuta enxuta para apresentar ao lead antes do contrato."
          />
        ) : (
          <List className="divide-y">
            {proposals.map((proposal) => (
              <LeadProposalRow
                key={proposal.id}
                leadId={leadId}
                proposal={proposal}
              />
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

function LeadProposalRow({
  leadId,
  proposal,
}: {
  leadId: string;
  proposal: LeadProposal;
}) {
  const accept = useAcceptProposal(proposal.id);
  const remove = useDeleteProposal(proposal.id);
  const { view, download } = useFileActions();
  const [accepting, setAccepting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { document } = proposal;

  return (
    <ListItem className="space-y-2 py-3">
      <Box className="flex flex-wrap items-center gap-2">
        <ProposalStatusBadge status={proposal.status} />
        <TextLink to={routeTo.proposal(proposal.id)} className="text-sm">
          Emitida em {formatDateTime(proposal.createdAt)}
        </TextLink>
      </Box>
      {proposal.status === "REJECTED" && proposal.rejectionReason && (
        <Text size="xs" tone="muted" className="break-words">
          Motivo da recusa: {proposal.rejectionReason}
        </Text>
      )}
      {document ? (
        <DocumentItem
          document={document}
          onView={() => view.mutate(document)}
          onDownload={() => download.mutate(document)}
          isViewing={view.isPending && view.variables?.id === document.id}
          isDownloading={
            download.isPending && download.variables?.id === document.id
          }
          actions={
            <DocumentEditDialog
              document={document}
              owner={{ type: "LEAD", id: leadId }}
              invalidate={queryKeys.crm.lead(leadId)}
            />
          }
        />
      ) : (
        <Text size="xs" tone="muted">
          O PDF desta proposta não existe mais.
        </Text>
      )}
      <Box className="flex flex-wrap gap-2">
        <CopyProposalButton source={{ html: proposal.renderedHtml }} />
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
              description="Registra que o lead aceitou esta proposta. Depois é só converter em cliente."
              confirmLabel="Marcar aceita"
              isPending={accept.isPending}
              onConfirm={() =>
                accept.mutate(undefined, {
                  onSuccess: () => setAccepting(false),
                })
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
            remove.mutate(undefined, { onSuccess: () => setDeleting(false) })
          }
        />
      </Box>
    </ListItem>
  );
}
