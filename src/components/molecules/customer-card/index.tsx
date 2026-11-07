import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CustomerStatusBadge } from "@/components/molecules/customer-status-badge";
import { routeTo } from "@/constants/routes";
import type { CustomerListItem } from "@/types/customer";
import { formatCpf } from "@/utils/document";

export function CustomerCard({ customer }: { customer: CustomerListItem }) {
  const location = useLocation();
  const contact = [customer.phone, customer.email].filter(Boolean).join(" · ");

  return (
    <Link
      to={routeTo.customer(customer.id)}
      state={{ from: location.pathname + location.search }}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
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
      </Card>
    </Link>
  );
}

export function CustomerCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-2/3 text-base" />
          <Skeleton shape="pill" className="h-5 w-16" />
        </Box>
        <Skeleton shape="text" className="w-36 text-xs" />
        <Skeleton shape="text" className="w-3/4 text-xs" />
      </Box>
      <Skeleton className="size-4 shrink-0" />
    </Card>
  );
}
