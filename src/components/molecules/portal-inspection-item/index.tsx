import { Camera } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PortalInspection } from "@/types/portal";
import { formatDateTime, formatMileage } from "@/utils/format";
import { pluralize } from "@/utils/text";

export function PortalInspectionItem({
  inspection,
}: {
  inspection: PortalInspection;
}) {
  const { label } = useLabels();

  return (
    <Box className="flex items-start justify-between gap-3 py-4">
      <Box className="min-w-0 space-y-1">
        <Box className="flex flex-wrap items-center gap-2">
          <Text weight="medium">
            {label(LABEL_MAPS.inspectionType, inspection.type)}
          </Text>
          <Badge variant="outline">
            {inspection.mine
              ? "Feita por você"
              : label(LABEL_MAPS.inspectionActor, inspection.performedBy)}
          </Badge>
        </Box>
        <Text size="xs" tone="muted">
          {formatDateTime(inspection.createdAt)}
          {inspection.photos.length > 0 && (
            <Text
              inline
              size="xs"
              tone="muted"
              className="ml-2 inline-flex items-center gap-1"
            >
              <Camera className="size-3.5" aria-hidden />
              {pluralize(inspection.photos.length, "foto", "fotos")}
            </Text>
          )}
        </Text>
      </Box>
      <Text weight="semibold" className="shrink-0 tabular-nums">
        {inspection.mileage !== null
          ? formatMileage(inspection.mileage)
          : "Sem km"}
      </Text>
    </Box>
  );
}
