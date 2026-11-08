import { useMemo } from "react";
import { FileText } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { ProposalStatusBadge } from "@/components/molecules/proposal-status-badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { CopyProposalButton } from "@/components/organisms/copy-proposal-button";
import { routeTo } from "@/constants/routes";
import type { ProposalListItem } from "@/types/proposal";
import { formatPhone } from "@/utils/document";
import { formatDateTime } from "@/utils/format";

type ProposalTableProps = {
  proposals: ProposalListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the proposal list (same props as ProposalList). */
export function ProposalTable({
  proposals,
  isLoading,
  isRefreshing,
}: ProposalTableProps) {
  const columns = useMemo<DataTableColumn<ProposalListItem>[]>(
    () => [
      {
        header: "Destinatário",
        cell: (proposal) => (
          <Text inline size={null} weight="semibold">
            {proposal.recipient.name}
          </Text>
        ),
        className: "max-w-64 truncate",
        skeleton: "w-40",
      },
      {
        header: "Telefone",
        cell: (proposal) =>
          proposal.recipient.phone
            ? formatPhone(proposal.recipient.phone)
            : "—",
        className: "whitespace-nowrap",
        skeleton: "w-28",
      },
      {
        header: "Origem",
        cell: (proposal) => (proposal.lead ? "Lead do CRM" : "Avulsa"),
        skeleton: "w-20",
      },
      {
        header: "Veículo",
        cell: (proposal) => proposal.vehicle?.label ?? "—",
        className: "max-w-56 truncate",
        skeleton: "w-32",
      },
      {
        header: "Emitida em",
        cell: (proposal) => formatDateTime(proposal.createdAt),
        className: "whitespace-nowrap",
        skeleton: "w-28",
      },
      {
        header: "Situação",
        cell: (proposal) => <ProposalStatusBadge status={proposal.status} />,
        skeletonShape: "pill",
      },
      {
        header: "Texto",
        // Its own click: copying must not open the row.
        cell: (proposal) => (
          <Box onClick={(event) => event.stopPropagation()}>
            <CopyProposalButton
              source={{ proposalId: proposal.id }}
              size="icon"
              variant="ghost"
            />
          </Box>
        ),
        skeleton: "w-8",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      items={proposals}
      rowKey={(proposal) => proposal.id}
      rowHref={(proposal) => routeTo.proposal(proposal.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando propostas…"
      empty={
        <EmptyState
          icon={FileText}
          title="Nenhuma proposta encontrada"
          description="As propostas emitidas, do funil e avulsas, aparecem aqui."
        />
      }
    />
  );
}
