import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { useLabels } from "@/hooks/ui/useLabels";
import type { StaffUser } from "@/types/user";
import { formatDateTime } from "@/utils/format";

export function UserCard({ user }: { user: StaffUser }) {
  const location = useLocation();
  const { label } = useLabels();

  return (
    <Link
      to={routeTo.user(user.id)}
      state={{ from: location.pathname + location.search }}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Text size="base" weight="semibold" className="min-w-0 break-words">
              {user.name}
            </Text>
            <Badge variant={user.role === "ADMIN" ? "neutral" : "outline"}>
              {label(LABEL_MAPS.userRole, user.role)}
            </Badge>
          </Box>
          <Text size="xs" tone="muted" truncate>
            {user.email}
          </Text>
          <Text size="xs" tone="muted">
            {user.lastLoginAt
              ? `Último acesso ${formatDateTime(user.lastLoginAt)}`
              : "Nunca acessou"}
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

export function UserCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-1/2 text-base" />
          <Skeleton shape="pill" className="h-5 w-20" />
        </Box>
        <Skeleton shape="text" className="w-40 text-xs" />
        <Skeleton shape="text" className="w-32 text-xs" />
      </Box>
      <Skeleton className="size-4 shrink-0" />
    </Card>
  );
}
