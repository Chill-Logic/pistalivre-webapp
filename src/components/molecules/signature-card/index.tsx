import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { SignatureStatusBadge } from "@/components/molecules/signature-status-badge";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { signersProgress } from "@/helpers/signature";
import { useLabels } from "@/hooks/ui/useLabels";
import type { SignatureListItem } from "@/types/signature";
import { formatDate } from "@/utils/format";

export function SignatureCard({ signature }: { signature: SignatureListItem }) {
  const location = useLocation();
  const { label } = useLabels();
  const context = signature.document
    ? label(LABEL_MAPS.documentOwner, signature.document.ownerType)
    : "Documento removido";

  return (
    <Link
      to={routeTo.signature(signature.id)}
      state={{ from: location.pathname + location.search }}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:bg-accent/50 active:bg-accent">
        <Box className="min-w-0 flex-1 space-y-2">
          <Box className="flex items-start justify-between gap-2">
            <Text size="base" weight="semibold" className="min-w-0 break-words">
              {signature.name}
            </Text>
            <SignatureStatusBadge status={signature.status} />
          </Box>
          <Text size="xs" tone="muted">
            {context} · {signersProgress(signature)}
          </Text>
          <Text size="xs" tone="muted">
            Criado em {formatDate(signature.createdAt)}
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

export function SignatureCardSkeleton() {
  return (
    <Card className="flex h-full items-center gap-3 p-4">
      <Box className="min-w-0 flex-1 space-y-2">
        <Box className="flex items-start justify-between gap-2">
          <Skeleton shape="text" className="w-1/2 text-base" />
          <Skeleton shape="pill" className="h-5 w-20" />
        </Box>
        <Skeleton shape="text" className="w-40 text-xs" />
        <Skeleton shape="text" className="w-28 text-xs" />
      </Box>
      <Skeleton className="size-4 shrink-0" />
    </Card>
  );
}
