import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ManualPaymentDialog } from "@/components/organisms/manual-payment-dialog";
import { StandaloneChargeDialog } from "@/components/organisms/standalone-charge-dialog";

/**
 * Charges for the customer outside a rental's own card: issue one at Asaas
 * (rental optional) or record a payment received outside it. They show on
 * the rental (when linked) and in the Financeiro.
 */
export function CustomerBillingCard({
  customer,
}: {
  customer: { id: string; name: string };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cobranças</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Text tone="muted">
          Emita uma cobrança no Asaas ou registre um pagamento que caiu direto
          na nossa conta. Com locação, ela aparece na ficha da locação.
        </Text>
        <Box className="flex flex-wrap gap-2">
          <StandaloneChargeDialog customer={customer} />
          <ManualPaymentDialog customer={customer} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function CustomerBillingCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton shape="text" className="w-full text-sm" />
        <Box className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-44" />
        </Box>
      </CardContent>
    </Card>
  );
}
