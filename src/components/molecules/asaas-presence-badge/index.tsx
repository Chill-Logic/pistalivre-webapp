import { Badge } from "@/components/atoms/badge";
import type { CustomerAsaasPresence } from "@/types/customer";

const BADGES = {
  linked: { label: "Vinculado", variant: "success" },
  both: { label: "Em ambos", variant: "warning" },
  unlinked: { label: "Não vinculado", variant: "outline" },
} as const;

/**
 * Whether the customer can be billed in Asaas: linked, the same CPF on both
 * sides without the link yet ("Em ambos"), or not linked.
 */
export function AsaasPresenceBadge({
  state,
}: {
  state: CustomerAsaasPresence["state"];
}) {
  const badge = BADGES[state];
  return (
    <Badge variant={badge.variant} className="shrink-0 whitespace-nowrap">
      {badge.label}
    </Badge>
  );
}
