import { Users } from "lucide-react";
import { EmptyState } from "@/components/molecules/empty-state";
import { CustomerStatusBadge } from "@/components/molecules/customer-status-badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { routeTo } from "@/constants/routes";
import type { CustomerListItem } from "@/types/customer";
import { formatCpf } from "@/utils/document";
import { formatDateTime } from "@/utils/format";

const COLUMNS: DataTableColumn<CustomerListItem>[] = [
  {
    header: "Nome",
    cell: (customer) => customer.name,
    className: "max-w-64 truncate",
    skeleton: "w-44",
  },
  {
    header: "CPF",
    cell: (customer) => formatCpf(customer.document),
    className: "font-mono",
    skeleton: "w-28",
  },
  {
    header: "Telefone",
    cell: (customer) => customer.phone ?? "—",
    skeleton: "w-28",
  },
  {
    header: "E-mail",
    cell: (customer) => customer.email,
    className: "max-w-64 truncate",
    skeleton: "w-44",
  },
  {
    header: "Último acesso",
    cell: (customer) =>
      customer.lastLoginAt ? formatDateTime(customer.lastLoginAt) : "Nunca",
    skeleton: "w-28",
  },
  {
    header: "Situação",
    cell: (customer) => (
      <CustomerStatusBadge status={customer.status} isTest={customer.isTest} />
    ),
    skeletonShape: "pill",
  },
];

type CustomerTableProps = {
  customers: CustomerListItem[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the customer list (same props as CustomerList). */
export function CustomerTable({
  customers,
  isLoading,
  isRefreshing,
}: CustomerTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      items={customers}
      rowKey={(customer) => customer.id}
      rowHref={(customer) => routeTo.customer(customer.id)}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      loadingLabel="Carregando clientes…"
      empty={
        <EmptyState
          icon={Users}
          title="Nenhum cliente encontrado"
          description="Ajuste a busca ou os filtros."
        />
      }
    />
  );
}
