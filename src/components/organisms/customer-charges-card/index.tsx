import { Receipt } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import {
  ChargeItem,
  ChargeItemSkeleton,
} from "@/components/molecules/charge-item";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { TextLink } from "@/components/molecules/text-link";
import { ChargeSettleDialog } from "@/components/organisms/charge-settle-dialog";
import { ChargeSettlementDialog } from "@/components/organisms/charge-settlement-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { RecordAttachments } from "@/components/organisms/record-attachments";
import { routeTo } from "@/constants/routes";
import {
  customerChargesKey,
  useCustomerCharges,
} from "@/hooks/api/gestao/customers/useCustomerCharges";
import type { Charge } from "@/types/rental";

const SKELETON_ROWS = 3;

type CustomerChargesCardProps = {
  customerId: string;
  rentals: { id: string; code: string }[];
};

/**
 * Our charges of the customer, both channels and with or without a rental:
 * the manual ones outside Asaas show up only here. Settle, correct the
 * receipt and attach proofs; editing the charge stays on the rental.
 */
export function CustomerChargesCard({
  customerId,
  rentals,
}: CustomerChargesCardProps) {
  const charges = useCustomerCharges(customerId);
  // Newest due date first, like the rental's list.
  const items = [...(charges.data ?? [])].sort((a, b) =>
    b.dueDate.localeCompare(a.dueDate),
  );

  return (
    <CollapsibleCard
      title="Histórico de cobranças"
      count={charges.data ? items.length : undefined}
      storageKey="customer-charges"
    >
      {charges.isPending && (
        <SkeletonRegion label="Carregando cobranças…">
          <CustomerChargesSkeletonRows />
        </SkeletonRegion>
      )}
      {charges.isError && (
        <QueryError error={charges.error} onRetry={() => charges.refetch()} />
      )}
      {charges.data && items.length === 0 && (
        <EmptyState icon={Receipt} title="Nenhuma cobrança registrada" />
      )}
      {items.length > 0 && (
        <Box className="divide-y">
          {items.map((charge) => {
            const rental = rentals.find((item) => item.id === charge.rentalId);
            return (
              <ChargeItem
                key={charge.id}
                charge={charge}
                meta={
                  <Text size="xs" tone="muted">
                    {rental ? (
                      <>
                        Locação{" "}
                        <TextLink to={routeTo.rental(rental.id)}>
                          {rental.code}
                        </TextLink>
                      </>
                    ) : charge.rentalId ? (
                      "Locação vinculada"
                    ) : (
                      "Sem locação"
                    )}
                  </Text>
                }
                actions={<CustomerChargeActions charge={charge} />}
                attachments={
                  <RecordAttachments
                    owner={{ type: "PAYMENT", id: charge.id }}
                    attachments={charge.attachments}
                    invalidate={customerChargesKey(customerId)}
                  />
                }
              />
            );
          })}
        </Box>
      )}
    </CollapsibleCard>
  );
}

/**
 * Same rule as the management's customer page: open → "Dar baixa"; manual
 * already paid (not by the received pix) → correct the receipt.
 */
function CustomerChargeActions({ charge }: { charge: Charge }) {
  if (!charge.amounts.isPaid) return <ChargeSettleDialog charge={charge} />;
  if (
    !charge.settledByReceipt &&
    charge.channel === "manual" &&
    charge.paidAt
  ) {
    return <ChargeSettlementDialog charge={charge} />;
  }
  return null;
}

function CustomerChargesSkeletonRows() {
  return (
    <Box className="divide-y">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <ChargeItemSkeleton key={index} />
      ))}
    </Box>
  );
}

export function CustomerChargesCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent>
        <CustomerChargesSkeletonRows />
      </CardContent>
    </Card>
  );
}
