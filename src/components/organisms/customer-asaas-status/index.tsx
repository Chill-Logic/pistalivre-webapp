import { Box } from "@/components/atoms/box";
import { AsaasPresenceBadge } from "@/components/molecules/asaas-presence-badge";
import { AsaasLinkButton } from "@/components/organisms/asaas-link-button";
import { customerAsaasPresence } from "@/helpers/customer";
import type { AsaasDirectory, CustomerListItem } from "@/types/customer";

type CustomerAsaasStatusProps = {
  customer: CustomerListItem;
  /** Undefined while loading or with Asaas down: just linked × not linked. */
  directory: AsaasDirectory | undefined;
  /** Icon-only "Vincular" (table cells). */
  compact?: boolean;
};

/** The Asaas tag of a list row/card, with "Vincular" when the CPF matches. */
export function CustomerAsaasStatus({
  customer,
  directory,
  compact = false,
}: CustomerAsaasStatusProps) {
  const presence = customerAsaasPresence(customer, directory);

  return (
    <Box className="flex items-center gap-2">
      <AsaasPresenceBadge state={presence.state} />
      {presence.linkTo && (
        <AsaasLinkButton
          customerId={customer.id}
          customerName={customer.name}
          document={customer.document}
          asaasCustomerId={presence.linkTo}
          compact={compact}
        />
      )}
    </Box>
  );
}
