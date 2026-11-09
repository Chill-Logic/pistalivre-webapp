import { useMemo } from "react";
import { Badge } from "@/components/atoms/badge";
import { Text } from "@/components/atoms/text";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { PartnersEmpty } from "@/components/organisms/partner-list";
import { routeTo } from "@/constants/routes";
import { partnerDocument } from "@/helpers/partner";
import type { PartnerListRow } from "@/types/partner";
import { formatDateTime } from "@/utils/format";

type PartnerTableProps = {
  partners: PartnerListRow[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the partner list (same props as PartnerList). */
export function PartnerTable({
  partners,
  isLoading,
  isRefreshing,
}: PartnerTableProps) {
  const columns = useMemo<DataTableColumn<PartnerListRow>[]>(
    () => [
      {
        header: "Nome",
        cell: (partner) => (
          <>
            <Text inline size={null} weight="semibold">
              {partner.name}
            </Text>
            {partner.tradeName && (
              <Text size="xs" tone="muted" truncate>
                {partner.tradeName}
              </Text>
            )}
          </>
        ),
        className: "max-w-60 truncate",
        skeleton: "w-40",
      },
      {
        header: "Documento",
        cell: (partner) => partnerDocument(partner),
        className: "whitespace-nowrap tabular-nums",
        skeleton: "w-36",
      },
      {
        header: "E-mail",
        cell: (partner) => partner.email,
        className: "max-w-56 truncate",
        skeleton: "w-44",
      },
      {
        header: "Motos ativas",
        cell: (partner) => partner.vehicleCount,
        className: "tabular-nums",
        align: "right",
        skeleton: "w-6",
      },
      {
        header: "Contratos",
        cell: (partner) => partner.contractCount,
        className: "tabular-nums",
        align: "right",
        skeleton: "w-6",
      },
      {
        header: "Acesso",
        cell: (partner) =>
          partner.hasAccess ? (
            <>
              <Badge variant="neutral">Tem acesso</Badge>
              <Text size="xs" tone="muted" className="mt-1 whitespace-nowrap">
                {partner.lastLoginAt
                  ? `Último: ${formatDateTime(partner.lastLoginAt)}`
                  : "Nunca entrou"}
              </Text>
            </>
          ) : (
            <Badge variant="outline">Sem acesso</Badge>
          ),
        skeletonShape: "pill",
      },
      {
        header: "Situação",
        cell: (partner) =>
          partner.active ? (
            <Badge variant="success">Ativo</Badge>
          ) : (
            <Badge variant="outline">Inativo</Badge>
          ),
        skeletonShape: "pill",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      items={partners}
      rowKey={(partner) => partner.id}
      rowHref={(partner) => routeTo.partner(partner.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando parceiros…"
      skeletonRows={4}
      empty={<PartnersEmpty />}
    />
  );
}
