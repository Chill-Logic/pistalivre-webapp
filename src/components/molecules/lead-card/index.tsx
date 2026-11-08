import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LeadStatusBadge } from "@/components/molecules/lead-status-badge";
import { routeTo } from "@/constants/routes";
import { leadOriginLabel } from "@/helpers/crm";
import type { LeadListItem } from "@/types/crm";
import { formatPhone } from "@/utils/document";
import { formatDate } from "@/utils/format";

type LeadCardProps = {
  lead: LeadListItem;
  /** Controls under the card, outside the link (e.g. the stage select). */
  footer?: ReactNode;
};

export function LeadCard({ lead, footer }: LeadCardProps) {
  const location = useLocation();
  const contact = [lead.phone && formatPhone(lead.phone), lead.email]
    .filter(Boolean)
    .join(" · ");
  const origin = [leadOriginLabel(lead), formatDate(lead.createdAt)]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Link
        to={routeTo.lead(lead.id)}
        state={{ from: location.pathname + location.search }}
        className="flex flex-1 items-center gap-3 rounded-lg p-4 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:bg-accent"
      >
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Text size="base" weight="semibold" className="min-w-0 break-words">
              {lead.name}
            </Text>
            <LeadStatusBadge status={lead.status} isTest={lead.isTest} />
          </Box>
          {contact && (
            <Text size="xs" tone="muted" truncate>
              {contact}
            </Text>
          )}
          {lead.interest && <Text truncate>{lead.interest}</Text>}
          <Text size="xs" tone="muted" truncate>
            {origin}
          </Text>
          {lead.campaignLabel && (
            <Text size="xs" tone="muted" truncate>
              Link: {lead.campaignLabel}
            </Text>
          )}
        </Box>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Link>
      {footer && (
        <Box className="flex flex-wrap items-center justify-end gap-2 border-t px-4 py-2">
          {footer}
        </Box>
      )}
    </Card>
  );
}

export function LeadCardSkeleton({
  withFooter = false,
}: {
  withFooter?: boolean;
}) {
  return (
    <Card className="flex h-full flex-col">
      <Box className="flex flex-1 items-center gap-3 p-4">
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Skeleton shape="text" className="w-1/2 text-base" />
            <Skeleton shape="pill" className="h-5 w-16" />
          </Box>
          <Skeleton shape="text" className="w-40 text-xs" />
          <Skeleton shape="text" className="w-28 text-xs" />
        </Box>
        <Skeleton className="size-4 shrink-0" />
      </Box>
      {withFooter && (
        <Box className="flex justify-end border-t px-4 py-2">
          <Skeleton className="h-9 w-36 md:h-8" />
        </Box>
      )}
    </Card>
  );
}
