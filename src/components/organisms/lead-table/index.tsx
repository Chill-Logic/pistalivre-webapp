import { useMemo } from "react";
import { Target } from "lucide-react";
import type { ReactNode } from "react";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { LeadStatusBadge } from "@/components/molecules/lead-status-badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { LeadStageSelect } from "@/components/organisms/lead-stage-select";
import { routeTo } from "@/constants/routes";
import { leadOriginLabel } from "@/helpers/crm";
import type { CrmOptions, LeadListItem } from "@/types/crm";
import { formatPhone } from "@/utils/document";
import { formatDate } from "@/utils/format";

type LeadTableProps = {
  leads: LeadListItem[] | undefined;
  /** With them, the stage is changed right in the row. */
  options?: CrmOptions;
  isLoading: boolean;
  isRefreshing?: boolean;
  /** Under the empty state (e.g. "Links de campanha"). */
  emptyAction?: ReactNode;
};

/** Table view of the lead list (same props as LeadList). */
export function LeadTable({
  leads,
  options,
  isLoading,
  isRefreshing,
  emptyAction,
}: LeadTableProps) {
  const columns = useMemo<DataTableColumn<LeadListItem>[]>(
    () => [
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
        cell: (lead) => (
          <>
            <Text inline size={null} className="block truncate">
              {leadOriginLabel(lead)}
            </Text>
            {lead.campaignLabel && (
              <Text inline size="xs" tone="muted" className="block truncate">
                Link: {lead.campaignLabel}
              </Text>
            )}
          </>
        ),
        className: "max-w-40",
        skeleton: "w-24",
      },
      {
        header: "Entrou em",
        cell: (lead) => formatDate(lead.createdAt),
        skeleton: "w-20",
      },
      {
        header: "Estágio",
        cell: (lead) =>
          options ? (
            <LeadStageSelect lead={lead} options={options} />
          ) : (
            <LeadStatusBadge status={lead.status} isTest={lead.isTest} />
          ),
        skeletonShape: "pill",
      },
    ],
    [options],
  );

  return (
    <DataTable
      columns={columns}
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
