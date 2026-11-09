import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { PARTNER_COST_KEYS } from "@/constants/partner";
import { costPayerRows } from "@/helpers/partner";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerContractCosts } from "@/types/partner";

/**
 * Who pays each expense of a partner contract, compact: "Manutenção
 * Empresa · Seguro Parceiro …", wrapping on the phone.
 */
export function CostPayerList({
  costs,
}: {
  costs: PartnerContractCosts | null | undefined;
}) {
  const { label } = useLabels();
  return (
    <List className="flex flex-wrap gap-x-5 gap-y-1.5">
      {costPayerRows(costs, label).map((row) => (
        <ListItem key={row.key} className="flex items-baseline gap-1.5">
          <Text inline size="sm" tone="muted">
            {row.label}:
          </Text>
          <Text inline size="sm" weight="medium">
            {row.payer}
          </Text>
        </ListItem>
      ))}
    </List>
  );
}

export function CostPayerListSkeleton() {
  return (
    <List className="flex flex-wrap gap-x-5 gap-y-1.5">
      {PARTNER_COST_KEYS.map((key) => (
        <ListItem key={key}>
          <Skeleton shape="text" className="w-32 text-sm" />
        </ListItem>
      ))}
    </List>
  );
}
