import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { AttachmentList } from "@/components/molecules/attachment-list";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PortalInspection } from "@/types/portal";
import { formatDateTime, formatMileage } from "@/utils/format";

export function PortalInspectionItem({
  inspection,
  actions,
}: {
  inspection: PortalInspection;
  /** E.g. delete, on one the renter made. */
  actions?: ReactNode;
}) {
  const { label } = useLabels();

  return (
    <Box className="space-y-2 py-4">
      <Box className="flex items-start justify-between gap-3">
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
          </Text>
        </Box>
        <Box className="flex shrink-0 flex-col items-end gap-1">
          <Text weight="semibold" className="tabular-nums">
            {inspection.mileage !== null
              ? formatMileage(inspection.mileage)
              : "Sem km"}
          </Text>
          {actions}
        </Box>
      </Box>
      <AttachmentList
        files={inspection.photos}
        collapsed={{ one: "foto", many: "fotos" }}
      />
    </Box>
  );
}
