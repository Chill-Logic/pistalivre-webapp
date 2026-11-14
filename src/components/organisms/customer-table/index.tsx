import { Users } from "lucide-react";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { CustomerStatusBadge } from "@/components/molecules/customer-status-badge";
import { CustomerAsaasStatus } from "@/components/organisms/customer-asaas-status";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/organisms/data-table";
import { routeTo } from "@/constants/routes";
import type { AsaasDirectory, CustomerListItem } from "@/types/customer";
import { formatCpf } from "@/utils/document";
import { formatDateTime } from "@/utils/format";

function columns(
  directory: AsaasDirectory | undefined,
): DataTableColumn<CustomerListItem>[] {
  return [
    {
      header: "Nome",
      cell: (customer) => customer.name,
      className: "max-w-56 truncate",
      skeleton: "w-44",
    },
    {
      header: "CPF",
      cell: (customer) => formatCpf(customer.document),
      className: "whitespace-nowrap",
      skeleton: "w-28",
    },
    {
      header: "Contato",
      cell: (customer) => (
        <>
          <Text truncate>{customer.email}</Text>
          <Text size="xs" tone="muted">
            {customer.phone ?? "Sem telefone"}
          </Text>
        </>
      ),
      className: "max-w-56",
      skeleton: "w-40",
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
        <CustomerStatusBadge
          status={customer.status}
          isTest={customer.isTest}
        />
      ),
      skeletonShape: "pill",
    },
    {
      header: "Asaas",
      cell: (customer) => (
        <CustomerAsaasStatus
          customer={customer}
          directory={directory}
          compact
        />
      ),
      skeletonShape: "pill",
      skeleton: "w-24",
    },
  ];
}

type CustomerTableProps = {
  customers: CustomerListItem[] | undefined;
  /** For the "Em ambos" tag and the "Vincular" button. */
  asaasDirectory?: AsaasDirectory;
  isLoading: boolean;
  isRefreshing?: boolean;
};

/** Table view of the customer list (same props as CustomerList). */
export function CustomerTable({
  customers,
  asaasDirectory,
  isLoading,
  isRefreshing,
}: CustomerTableProps) {
  return (
    <DataTable
      columns={columns(asaasDirectory)}
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
