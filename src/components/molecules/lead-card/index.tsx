import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LeadStatusBadge } from "@/components/molecules/lead-status-badge";
import { routeTo } from "@/constants/routes";
import { sourceLabel } from "@/helpers/crm";
import type { LeadListItem } from "@/types/crm";
import { formatPhone } from "@/utils/document";
import { formatDate } from "@/utils/format";

export function LeadCard({ lead }: { lead: LeadListItem }) {
  const location = useLocation();
  const contact = [lead.phone && formatPhone(lead.phone), lead.email]
    .filter(Boolean)
    .join(" · ");
  const origin = [
    lead.campaignLabel ?? sourceLabel(lead.source),
    formatDate(lead.createdAt),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      to={routeTo.lead(lead.id)}
      state={{ from: location.pathname + location.search }}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
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
        </Box>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Card>
    </Link>
  );
}

export function LeadCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-1/2 text-base" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
        <Skeleton shape="text" className="w-40 text-xs" />
        <Skeleton shape="text" className="w-28 text-xs" />
      </Box>
      <Skeleton className="size-4 shrink-0" />
    </Card>
  );
}
