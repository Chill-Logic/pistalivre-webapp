import { ExternalLink as ExternalIcon } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { ExternalLink } from "@/components/atoms/external-link";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { Alert } from "@/components/atoms/alert";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { TextLink } from "@/components/molecules/text-link";
import { AsaasChargeLinkDialog } from "@/components/organisms/asaas-charge-link-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { useAsaasCharges } from "@/hooks/api/gestao/charges/useAsaasCharges";
import { useLabels } from "@/hooks/ui/useLabels";
import type { AsaasCharge } from "@/types/asaas-charge";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

type CustomerAsaasChargesCardProps = {
  customerId: string;
  rentals: { id: string; code: string }[];
};

/**
 * Every charge the customer has at Asaas, including the ones made outside
 * the system: those without a rental can be tied to one here. Loads on its
 * own; with Asaas down it says so and the record carries on.
 */
export function CustomerAsaasChargesCard({
  customerId,
  rentals,
}: CustomerAsaasChargesCardProps) {
  const charges = useAsaasCharges(customerId);
  const items = charges.data?.items ?? [];
  const unlinked = items.filter((charge) => !charge.rentalId).length;

  return (
    <CollapsibleCard
      title="Cobranças no Asaas"
      count={charges.data ? items.length : undefined}
      storageKey="customer-asaas-charges"
      defaultOpen={false}
      contentClassName="space-y-3"
    >
      {charges.isPending && (
        <SkeletonRegion label="Carregando cobranças do Asaas…">
          <Box className="space-y-3">
            {[0, 1, 2].map((index) => (
              <Box key={index} className="space-y-2 py-1">
                <Skeleton shape="text" className="w-48 text-sm" />
                <Skeleton shape="text" className="w-32 text-xs" />
              </Box>
            ))}
          </Box>
        </SkeletonRegion>
      )}
      {charges.isError && (
        <QueryError error={charges.error} onRetry={() => charges.refetch()} />
      )}
      {charges.data?.error && (
        <Alert variant="warning">{charges.data.error}</Alert>
      )}
      {charges.data && !charges.data.error && items.length === 0 && (
        <Text tone="muted">Nenhuma cobrança no Asaas.</Text>
      )}
      {unlinked > 0 && (
        <Text size="xs" tone="muted">
          {unlinked === 1
            ? "1 cobrança feita fora do sistema ainda não tem locação."
            : `${unlinked} cobranças feitas fora do sistema ainda não têm locação.`}
        </Text>
      )}
      {items.length > 0 && (
        <List className="divide-y">
          {items.map((charge) => (
            <AsaasChargeRow key={charge.id} charge={charge} rentals={rentals} />
          ))}
        </List>
      )}
    </CollapsibleCard>
  );
}

function AsaasChargeRow({
  charge,
  rentals,
}: {
  charge: AsaasCharge;
  rentals: { id: string; code: string }[];
}) {
  const { label } = useLabels();
  const rental = rentals.find((item) => item.id === charge.rentalId);

  return (
    <ListItem className="space-y-2 py-3">
      <Box className="flex items-start justify-between gap-3">
        <Box className="min-w-0">
          <Text weight="medium" className="line-clamp-2 break-words">
            {(charge.description ?? "Cobrança").split("\n")[0]}
          </Text>
          <Text size="xs" tone="muted">
            {label(LABEL_MAPS.paymentMethod, charge.billingType)} · vence{" "}
            {formatCalendarDate(charge.dueDate)}
            {charge.paidDate &&
              ` · pago em ${formatCalendarDate(charge.paidDate)}`}
          </Text>
        </Box>
        <Box className="shrink-0 space-y-1 text-right">
          <Text weight="semibold" className="tabular-nums">
            {formatCurrency(charge.amounts.amount)}
          </Text>
          <Badge variant="neutral">
            {label(LABEL_MAPS.paymentStatus, charge.status)}
          </Badge>
        </Box>
      </Box>
      <Box className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {charge.rentalId ? (
          <Text size="xs" tone="muted">
            Locação{" "}
            {rental ? (
              <TextLink to={routeTo.rental(rental.id)}>{rental.code}</TextLink>
            ) : (
              "vinculada"
            )}
            {!charge.paymentId && " · chega na próxima sincronização"}
          </Text>
        ) : (
          <AsaasChargeLinkDialog charge={charge} rentals={rentals} />
        )}
        {charge.invoiceUrl && (
          <ExternalLink href={charge.invoiceUrl}>
            Abrir fatura
            <ExternalIcon className="size-3.5" aria-hidden />
          </ExternalLink>
        )}
      </Box>
    </ListItem>
  );
}
