import { FileText } from "lucide-react";
import { useParams } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  DocumentsCard,
  DocumentsCardSkeleton,
} from "@/components/organisms/documents-card";
import {
  ProposalPreview,
  ProposalPreviewSkeleton,
} from "@/components/organisms/proposal-preview";
import {
  ProposalSummary,
  ProposalSummarySkeleton,
} from "@/components/organisms/proposal-summary";
import { ProposalActions } from "@/components/organisms/proposal-actions";
import { QueryError } from "@/components/organisms/query-error";
import { ProposalDetailLayout } from "@/components/templates/proposal-detail-layout";
import { ROUTES } from "@/constants/routes";
import { isNotFound } from "@/helpers/api-error";
import { useProposal } from "@/hooks/api/gestao/proposals/useProposal";
import { useBackToList } from "@/hooks/ui/useBackToList";

export function ProposalDetailPage() {
  const { id = "" } = useParams();
  const proposal = useProposal(id);
  const backTo = useBackToList(ROUTES.proposals);

  return (
    <Box className="space-y-4">
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <BackLink to={backTo} label="Propostas" />
        {proposal.data && <ProposalActions proposal={proposal.data} />}
      </Box>
      {proposal.isPending && (
        <SkeletonRegion label="Carregando proposta…">
          <ProposalDetailLayout
            summary={<ProposalSummarySkeleton />}
            document={<DocumentsCardSkeleton />}
            preview={<ProposalPreviewSkeleton />}
          />
        </SkeletonRegion>
      )}
      {proposal.isError &&
        (isNotFound(proposal.error) ? (
          <EmptyState
            icon={FileText}
            title="Proposta não encontrada"
            description="Ela pode ter sido excluída ou o endereço está errado."
          />
        ) : (
          <QueryError
            error={proposal.error}
            onRetry={() => proposal.refetch()}
          />
        ))}
      {proposal.data && (
        <ProposalDetailLayout
          summary={<ProposalSummary proposal={proposal.data} />}
          document={
            <DocumentsCard
              title="PDF da proposta"
              documents={proposal.data.document ? [proposal.data.document] : []}
              empty="O PDF desta proposta não existe mais."
            />
          }
          preview={<ProposalPreview html={proposal.data.renderedHtml} />}
        />
      )}
    </Box>
  );
}
