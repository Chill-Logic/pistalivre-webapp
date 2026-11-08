import { useMemo } from "react";
import { PenLine } from "lucide-react";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { SignatureStatusBadge } from "@/components/molecules/signature-status-badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { routeTo } from "@/constants/routes";
import { documentOwnerName, signersProgress } from "@/helpers/signature";
import type { SignatureListItem } from "@/types/signature";
import { formatDate } from "@/utils/format";

type SignatureTableProps = {
  signatures: SignatureListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the signature requests (same props as SignatureList). */
export function SignatureTable({
  signatures,
  isLoading,
  isRefreshing,
}: SignatureTableProps) {
  const columns = useMemo<DataTableColumn<SignatureListItem>[]>(
    () => [
      {
        header: "Documento",
        cell: (signature) => (
          <Text inline size={null} weight="semibold">
            {signature.name}
          </Text>
        ),
        className: "max-w-72 truncate",
        skeleton: "w-48",
      },
      {
        header: "De",
        cell: (signature) =>
          signature.document
            ? documentOwnerName(signature.document.ownerType)
            : "Documento removido",
        skeleton: "w-20",
      },
      {
        header: "Signatários",
        cell: (signature) => signersProgress(signature),
        className: "whitespace-nowrap",
        skeleton: "w-28",
      },
      {
        header: "Prazo",
        cell: (signature) =>
          signature.deadlineAt ? formatDate(signature.deadlineAt) : "—",
        className: "whitespace-nowrap",
        skeleton: "w-20",
      },
      {
        header: "Criado em",
        cell: (signature) => formatDate(signature.createdAt),
        className: "whitespace-nowrap",
        skeleton: "w-20",
      },
      {
        header: "Situação",
        cell: (signature) => <SignatureStatusBadge status={signature.status} />,
        skeletonShape: "pill",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      items={signatures}
      rowKey={(signature) => signature.id}
      rowHref={(signature) => routeTo.signature(signature.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando assinaturas…"
      empty={
        <EmptyState
          icon={PenLine}
          title="Nenhum pedido de assinatura encontrado"
          description="Os documentos assináveis aparecem aqui."
        />
      }
    />
  );
}
