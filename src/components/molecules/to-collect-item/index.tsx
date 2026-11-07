import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { TextLink } from "@/components/molecules/text-link";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { useLabels } from "@/hooks/ui/useLabels";
import type { ToCollectItem as Item } from "@/types/finance";
import { formatCurrency } from "@/utils/format";

/** One charge in the collection queue (read-only: no "dar baixa" yet). */
export function ToCollectItem({ item }: { item: Item }) {
  const { label } = useLabels();
  const title = item.label ?? label(LABEL_MAPS.paymentPurpose, item.purpose);
  const meta = [
    label(LABEL_MAPS.paymentMethod, item.method),
    item.channel === "manual" && "fora do Asaas",
  ].filter(Boolean);

  return (
    <Box className="flex items-start justify-between gap-3 py-3">
      <Box className="min-w-0 space-y-0.5">
        <Text weight="medium" truncate>
          {item.customer ? (
            <TextLink to={routeTo.customer(item.customer.id)}>
              {item.customer.name}
            </TextLink>
          ) : (
            "Sem cliente"
          )}
        </Text>
        <Text size="xs" tone="muted">
          {title}
          {item.rental && (
            <>
              {" · "}
              <TextLink
                to={routeTo.rental(item.rental.id)}
                className="font-normal"
              >
                {item.rental.code}
              </TextLink>
            </>
          )}
          {meta.length > 0 && ` · ${meta.join(" · ")}`}
        </Text>
      </Box>
      <Box className="shrink-0 text-right">
        <Text weight="semibold" className="tabular-nums">
          {formatCurrency(item.amounts.amount)}
        </Text>
        {item.amounts.surcharge > 0 && (
          <Text size="xs" tone="muted" className="tabular-nums">
            {formatCurrency(item.amounts.principal)} + multa/juros
          </Text>
        )}
      </Box>
    </Box>
  );
}

export function ToCollectItemSkeleton() {
  return (
    <Box className="flex items-start justify-between gap-3 py-3">
      <Box className="min-w-0 flex-1 space-y-2">
        <Skeleton shape="text" className="w-40 text-sm" />
        <Skeleton shape="text" className="w-56 text-xs" />
      </Box>
      <Skeleton shape="text" className="w-20 text-sm" />
    </Box>
  );
}
