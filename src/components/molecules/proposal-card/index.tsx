import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ProposalStatusBadge } from "@/components/molecules/proposal-status-badge";
import { routeTo } from "@/constants/routes";
import type { ProposalListItem } from "@/types/proposal";
import { formatDateTime } from "@/utils/format";

export function ProposalCard({ proposal }: { proposal: ProposalListItem }) {
  const location = useLocation();
  const details = [
    proposal.lead ? "Lead do CRM" : "Avulsa",
    proposal.vehicle?.label,
  ].filter(Boolean);

  return (
    <Link
      to={routeTo.proposal(proposal.id)}
      state={{ from: location.pathname + location.search }}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Text size="base" weight="semibold" className="min-w-0 break-words">
              {proposal.recipient.name}
            </Text>
            <ProposalStatusBadge status={proposal.status} />
          </Box>
          <Text size="xs" tone="muted">
            {details.join(" · ")}
          </Text>
          <Text size="xs" tone="muted">
            {formatDateTime(proposal.createdAt)}
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

export function ProposalCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-1/2 text-base" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
        <Skeleton shape="text" className="w-32 text-xs" />
        <Skeleton shape="text" className="w-24 text-xs" />
      </Box>
      <Skeleton className="size-4 shrink-0" />
    </Card>
  );
}
