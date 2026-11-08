import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { formatCalendarDate } from "@/utils/format";

/** A waived day in the charges list, so it does not read as a missing charge. */
export function WaivedDayItem({
  date,
  reason,
}: {
  /** yyyy-mm-dd */
  date: string;
  reason: string | null;
}) {
  return (
    <Box className="flex items-center justify-between gap-3 py-4">
      <Box className="min-w-0">
        <Text weight="medium" tone="muted" truncate>
          Dia abonado · {formatCalendarDate(`${date}T00:00:00Z`)}
        </Text>
        <Text size="xs" tone="muted">
          {reason || "Sem cobrança neste dia"}
        </Text>
      </Box>
      <Badge variant="outline">Abonado</Badge>
    </Box>
  );
}
