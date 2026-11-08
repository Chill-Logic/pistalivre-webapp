import { Target } from "lucide-react";
import type { ReactNode } from "react";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { LeadStatusBadge } from "@/components/molecules/lead-status-badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { routeTo } from "@/constants/routes";
import { sourceLabel } from "@/helpers/crm";
import type { LeadListItem } from "@/types/crm";
import { formatPhone } from "@/utils/document";
import { formatDate } from "@/utils/format";

const COLUMNS: DataTableColumn<LeadListItem>[] = [
  {
    header: "Nome",
    cell: (lead) => (
      <Text inline size={null} weight="semibold">
        {lead.name}
      </Text>
    ),
    className: "max-w-56 truncate",
    skeleton: "w-36",
  },
  {
    header: "Telefone",
    cell: (lead) => (lead.phone ? formatPhone(lead.phone) : "—"),
    className: "whitespace-nowrap",
    skeleton: "w-28",
  },
  {
    header: "E-mail",
    cell: (lead) => lead.email ?? "—",
    className: "max-w-56 truncate",
    skeleton: "w-40",
  },
  {
    header: "Interesse",
    cell: (lead) => lead.interest ?? "—",
    className: "max-w-48 truncate",
    skeleton: "w-28",
  },
  {
    header: "Origem",
    cell: (lead) => lead.campaignLabel ?? sourceLabel(lead.source),
    className: "max-w-40 truncate",
    skeleton: "w-20",
  },
  {
    header: "Entrou em",
    cell: (lead) => formatDate(lead.createdAt),
    skeleton: "w-20",
  },
  {
    header: "Estágio",
    cell: (lead) => <LeadStatusBadge status={lead.status} isTest={lead.isTest} />,
    skeletonShape: "pill",
  },
];

type LeadTableProps = {
  leads: LeadListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
  /** Under the empty state (e.g. "Links de campanha"). */
  emptyAction?: ReactNode;
};

/** Table view of the lead list (same props as LeadList). */
export function LeadTable({
  leads,
  isLoading,
  isRefreshing,
  emptyAction,
}: LeadTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      items={leads}
      rowKey={(lead) => lead.id}
      rowHref={(lead) => routeTo.lead(lead.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando leads…"
      empty={
        <EmptyState
          icon={Target}
          title="Nenhum lead encontrado"
          description="Ajuste a busca, o estágio ou mostre os leads de teste."
          action={emptyAction}
        />
      }
    />
  );
}
