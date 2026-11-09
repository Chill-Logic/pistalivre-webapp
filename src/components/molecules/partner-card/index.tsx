import { ChevronRight, KeyRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { routeTo } from "@/constants/routes";
import { partnerDocument } from "@/helpers/partner";
import type { PartnerListRow } from "@/types/partner";
import { pluralize } from "@/utils/text";

export function PartnerCard({ partner }: { partner: PartnerListRow }) {
  const location = useLocation();

  return (
    <Link
      to={routeTo.partner(partner.id)}
      state={{ from: location.pathname + location.search }}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Box className="min-w-0">
              <Text size="base" weight="semibold" className="break-words">
                {partner.name}
              </Text>
              {partner.tradeName && (
                <Text size="xs" tone="muted" truncate>
                  {partner.tradeName}
                </Text>
              )}
            </Box>
            {!partner.active && <Badge variant="outline">Inativo</Badge>}
          </Box>
          <Text size="xs" tone="muted" className="tabular-nums">
            {partnerDocument(partner)}
          </Text>
          <Text size="xs" tone="muted" truncate>
            {partner.email}
          </Text>
          <Box className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Text weight="medium">
              {pluralize(partner.vehicleCount, "moto", "motos")}
              <Text inline size="xs" tone="muted" weight="normal">
                {" "}
                em contrato ativo ·{" "}
                {pluralize(partner.contractCount, "contrato", "contratos")}
              </Text>
            </Text>
            {partner.hasAccess && (
              <Text
                inline
                size="xs"
                tone="muted"
                className="inline-flex items-center gap-1"
              >
                <KeyRound className="size-3" aria-hidden />
                Com acesso
              </Text>
            )}
          </Box>
        </Box>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Card>
    </Link>
  );
}

export function PartnerCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Skeleton shape="text" className="w-1/2 text-base" />
        <Skeleton shape="text" className="w-36 text-xs" />
        <Skeleton shape="text" className="w-44 text-xs" />
        <Skeleton shape="text" className="w-48 text-sm" />
      </Box>
      <Skeleton className="size-4 shrink-0" />
    </Card>
  );
}
