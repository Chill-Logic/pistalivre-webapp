import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { useCustomerFlags } from "@/hooks/api/gestao/customers/useCustomerFlags";
import type { CustomerDetail } from "@/types/customer";

/**
 * "Cliente de teste" (visibility: hidden from the list unless filtered) and
 * "Fora das métricas" (its charges leave the delinquency numbers). Each one
 * saves on change, as in the old gestão.
 */
export function CustomerFlagsCard({
  customer,
}: {
  customer: Pick<CustomerDetail, "id" | "isTest" | "excludeFromMetrics">;
}) {
  const flags = useCustomerFlags(customer.id);
  const pending = flags.isPending ? flags.variables : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Visibilidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CheckboxField
          label="Cliente de teste"
          hint="Fica escondido da lista de clientes (aparece no filtro de teste)."
          checked={pending?.isTest ?? customer.isTest}
          onChange={(isTest) => flags.mutate({ isTest })}
          disabled={flags.isPending}
        />
        <CheckboxField
          label="Fora das métricas"
          hint="As cobranças dele não contam na inadimplência."
          checked={pending?.excludeFromMetrics ?? customer.excludeFromMetrics}
          onChange={(excludeFromMetrics) =>
            flags.mutate({ excludeFromMetrics })
          }
          disabled={flags.isPending}
        />
      </CardContent>
    </Card>
  );
}

export function CustomerFlagsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-24 text-base" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[0, 1].map((index) => (
          <Box key={index} className="flex items-start gap-3">
            <Skeleton className="mt-0.5 size-4 shrink-0" />
            <Box className="flex-1 space-y-2">
              <Skeleton shape="text" className="w-32 text-sm" />
              <Skeleton shape="text" className="w-56 text-xs" />
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
