import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ProposalStatusBadge } from "@/components/molecules/proposal-status-badge";
import { routeTo } from "@/constants/routes";
import type { ProposalListItem } from "@/types/proposal";
import { formatDateTime } from "@/utils/format";

type ProposalCardProps = {
  proposal: ProposalListItem;
  /** Buttons under the card, outside the link (e.g. "Copiar texto"). */
  footer?: ReactNode;
};

export function ProposalCard({ proposal, footer }: ProposalCardProps) {
  const location = useLocation();
  const details = [
    proposal.lead ? "Lead do CRM" : "Avulsa",
    proposal.vehicle?.label,
  ].filter(Boolean);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Link
        to={routeTo.proposal(proposal.id)}
        state={{ from: location.pathname + location.search }}
        className="flex flex-1 items-center gap-3 rounded-lg p-4 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:bg-accent"
      >
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
      </Link>
      {footer && (
        <Box className="flex flex-wrap items-center justify-end gap-2 border-t px-4 py-2">
          {footer}
        </Box>
      )}
    </Card>
  );
}

export function ProposalCardSkeleton({
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
          <Skeleton shape="text" className="w-32 text-xs" />
          <Skeleton shape="text" className="w-24 text-xs" />
        </Box>
        <Skeleton className="size-4 shrink-0" />
      </Box>
      {withFooter && (
        <Box className="flex justify-end border-t px-4 py-2">
          <Skeleton className="h-9 w-28 md:h-8" />
        </Box>
      )}
    </Card>
  );
}
