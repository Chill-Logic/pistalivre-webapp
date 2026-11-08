import { Box } from "@/components/atoms/box";
import { Card, CardHeader } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { AsaasImportButton } from "@/components/organisms/asaas-import-button";
import type { AsaasOnlyCustomer } from "@/types/customer";
import { formatCpf } from "@/utils/document";

/**
 * Customers that exist only in Asaas (no CPF match here). Importing creates
 * a linked stub to complete afterwards. Closed by default: it can be long.
 */
export function AsaasOnlyCustomers({
  customers,
}: {
  customers: AsaasOnlyCustomer[];
}) {
  if (customers.length === 0) return null;

  return (
    <CollapsibleCard
      title="Clientes só no Asaas"
      count={customers.length}
      storageKey="customers-asaas-only"
      defaultOpen={false}
      contentClassName="space-y-3 pt-0 md:pt-0"
    >
      <Text tone="muted">
        Existem no Asaas e ainda não estão no cadastro. Importe para criar o
        cliente aqui (você completa os dados em seguida).
      </Text>
      <List className="divide-y rounded-md border">
        {customers.map((customer) => (
          <ListItem
            key={customer.id}
            className="flex items-center justify-between gap-3 px-3 py-2.5"
          >
            <Box className="min-w-0">
              <Text weight="medium" truncate>
                {customer.name}
              </Text>
              <Text size="xs" tone="muted" truncate>
                {[
                  customer.document
                    ? `CPF ${formatCpf(customer.document)}`
                    : "Sem CPF",
                  customer.email,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </Box>
            <AsaasImportButton customer={customer} />
          </ListItem>
        ))}
      </List>
    </CollapsibleCard>
  );
}

/** The closed section while Asaas answers. */
export function AsaasOnlyCustomersSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-0">
        <Box className="flex h-9 items-center gap-2">
          <Skeleton shape="text" className="w-40 text-base" />
          <Skeleton shape="pill" className="h-5 w-8" />
          <Skeleton className="size-4" />
        </Box>
      </CardHeader>
    </Card>
  );
}
