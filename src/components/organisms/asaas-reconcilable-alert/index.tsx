import { AlertTriangle } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { AsaasLinkButton } from "@/components/organisms/asaas-link-button";
import type { AsaasReconcilable } from "@/types/customer";
import { formatCpf } from "@/utils/document";

/**
 * Heads-up: these customers have the same CPF in Asaas but no link yet, so
 * their payments don't match them. One click (and a confirmation) per item.
 */
export function AsaasReconcilableAlert({
  matches,
}: {
  matches: AsaasReconcilable[];
}) {
  if (matches.length === 0) return null;

  return (
    <Alert variant="warning" role="status" className="space-y-3 p-4">
      <Box className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        <Box className="space-y-0.5">
          <Text inline size={null} weight="medium">
            {matches.length === 1
              ? "1 cliente pode ser conciliado com o Asaas"
              : `${matches.length} clientes podem ser conciliados com o Asaas`}
          </Text>
          <Text size="xs" className="text-warning-foreground/80">
            Mesmo CPF nos dois lados, ainda sem vínculo. Vincule para casar os
            pagamentos com o cliente.
          </Text>
        </Box>
      </Box>
      <List className="space-y-2">
        {matches.map((match) => (
          <ListItem
            key={match.customerId}
            className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-card-foreground"
          >
            <Box className="min-w-0">
              <Text weight="medium" truncate>
                {match.customerName}
              </Text>
              <Text size="xs" tone="muted" mono>
                CPF {formatCpf(match.document)}
              </Text>
            </Box>
            <AsaasLinkButton
              customerId={match.customerId}
              customerName={match.customerName}
              document={match.document}
              asaasCustomerId={match.asaasCustomerId}
            />
          </ListItem>
        ))}
      </List>
    </Alert>
  );
}
