import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CustomerStatusBadge } from "@/components/molecules/customer-status-badge";
import { routeTo } from "@/constants/routes";
import type { CustomerListItem } from "@/types/customer";
import { formatCpf } from "@/utils/document";

type CustomerCardProps = {
  customer: CustomerListItem;
  /** Bottom strip outside the link (e.g. the Asaas tag and "Vincular"). */
  footer?: ReactNode;
};

export function CustomerCard({ customer, footer }: CustomerCardProps) {
  const location = useLocation();
  const contact = [customer.phone, customer.email].filter(Boolean).join(" · ");

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Link
        to={routeTo.customer(customer.id)}
        state={{ from: location.pathname + location.search }}
        className="flex flex-1 items-center gap-3 p-4 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:bg-accent"
      >
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Text size="base" weight="semibold" truncate>
              {customer.name}
            </Text>
            <CustomerStatusBadge
              status={customer.status}
              isTest={customer.isTest}
            />
          </Box>
          <Text size="xs" tone="muted" mono>
            CPF {formatCpf(customer.document)}
          </Text>
          <Text size="xs" tone="muted" truncate>
            {contact}
          </Text>
        </Box>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Link>
      {footer && (
        <Box className="flex min-h-12 items-center gap-2 border-t px-4 py-2">
          {footer}
        </Box>
      )}
    </Card>
  );
}

export function CustomerCardSkeleton({ footer = false }: { footer?: boolean }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Box className="flex flex-1 items-center gap-3 p-4">
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Skeleton shape="text" className="w-2/3 text-base" />
            <Skeleton shape="pill" className="h-5 w-16" />
          </Box>
          <Skeleton shape="text" className="w-36 text-xs" />
          <Skeleton shape="text" className="w-3/4 text-xs" />
        </Box>
        <Skeleton className="size-4 shrink-0" />
      </Box>
      {footer && (
        <Box className="flex min-h-12 items-center gap-2 border-t px-4 py-2">
          <Skeleton shape="text" className="w-10 text-xs" />
          <Skeleton shape="pill" className="h-5 w-24" />
        </Box>
      )}
    </Card>
  );
}
