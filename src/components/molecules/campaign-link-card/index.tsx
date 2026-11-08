import { Copy } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { useCopy } from "@/hooks/ui/useCopy";
import type { CampaignLink } from "@/types/crm";
import { formatDate } from "@/utils/format";

type CampaignLinkCardProps = {
  link: CampaignLink;
  /** Simulate / delete (they write, so the organism brings them). */
  actions?: ReactNode;
};

/** A campaign link: its UTMs and the public URL to copy and publish. */
export function CampaignLinkCard({ link, actions }: CampaignLinkCardProps) {
  const copy = useCopy();
  const utms = [
    link.utmSource,
    link.utmMedium,
    link.utmCampaign,
    link.utmTerm,
    link.utmContent,
  ].filter(Boolean);

  return (
    <Card className="space-y-3 p-4">
      <Box className="flex flex-wrap items-start justify-between gap-2">
        <Box className="flex min-w-0 flex-wrap items-center gap-2">
          <Text size="base" weight="semibold" className="min-w-0 break-words">
            {link.label}
          </Text>
          {link.isTest && <Badge variant="warning">Teste</Badge>}
        </Box>
        <Badge variant="neutral">{link.channelLabel}</Badge>
      </Box>
      <Text size="xs" tone="muted" className="break-words">
        {utms.join(" · ")} · criado em {formatDate(link.createdAt)}
      </Text>
      <Box className="flex items-center gap-2 rounded-md border bg-muted/40 py-1 pl-3 pr-1">
        <Text size="sm" mono className="min-w-0 flex-1 truncate">
          {link.url}
        </Text>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => copy(link.url, "Link copiado")}
        >
          <Copy />
          Copiar
        </Button>
      </Box>
      {actions && (
        <Box className="flex flex-wrap justify-end gap-2">{actions}</Box>
      )}
    </Card>
  );
}

export function CampaignLinkCardSkeleton() {
  return (
    <Card className="space-y-3 p-4">
      <Box className="flex items-start justify-between gap-2">
        <Skeleton shape="text" className="w-1/2 text-base" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </Box>
      <Skeleton shape="text" className="w-2/3 text-xs" />
      <Skeleton className="h-10" />
      <Box className="flex justify-end gap-2">
        <Skeleton className="h-9 w-28 md:h-8" />
        <Skeleton className="h-9 w-24 md:h-8" />
      </Box>
    </Card>
  );
}
