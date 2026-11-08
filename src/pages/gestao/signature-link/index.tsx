import { Inbox } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { BackLink } from "@/components/molecules/back-link";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SelectField } from "@/components/molecules/select-field";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { EnvelopeLinkDialog } from "@/components/organisms/envelope-link-dialog";
import { QueryError } from "@/components/organisms/query-error";
import { ROUTES } from "@/constants/routes";
import { fromSelectValue, toSelectValue } from "@/helpers/select";
import { useProviderEnvelopes } from "@/hooks/api/gestao/signatures/useSignatureMutations";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";

const STATUS_FILTERS = [
  { value: "closed", label: "Assinados" },
  { value: "running", label: "Em assinatura" },
  { value: "canceled", label: "Cancelados" },
  { value: toSelectValue(""), label: "Todos" },
];

/**
 * Envelopes that already exist at the provider (signed outside the system),
 * not yet linked here, to tie to one of our PDFs. Read-through: nothing of
 * the provider is mirrored besides the link and the signers.
 */
export function SignatureLinkPage() {
  const [status, setStatus] = useState("closed");
  const [page, setPage] = useState(1);
  const envelopes = useProviderEnvelopes(status, page);
  const items = envelopes.data?.items ?? [];

  return (
    <Box className="space-y-4">
      <BackLink to={ROUTES.signatures} label="Assinaturas" />
      <PageHeader title="Vincular envelope existente" />
      <Box className="max-w-xs">
        <SelectField
          label="Situação no Clicksign"
          value={toSelectValue(status)}
          options={STATUS_FILTERS}
          onChange={(value) => {
            setStatus(fromSelectValue(value));
            setPage(1);
          }}
        />
      </Box>
      {envelopes.isPending && (
        <SkeletonRegion label="Consultando o Clicksign…">
          <EnvelopeListSkeleton />
        </SkeletonRegion>
      )}
      {envelopes.isError && (
        <QueryError
          error={envelopes.error}
          onRetry={() => envelopes.refetch()}
        />
      )}
      {envelopes.data && items.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="Nenhum envelope sem vínculo nesta página"
        />
      )}
      {items.length > 0 && (
        <Card
          aria-busy={envelopes.isFetching}
          className={cn(
            "transition-opacity",
            envelopes.isFetching && "opacity-60",
          )}
        >
          <CardContent className="pt-1 md:pt-1">
            <List className="divide-y">
              {items.map((envelope) => (
                <ListItem
                  key={envelope.externalId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <Box className="min-w-0">
                    <Text weight="medium" truncate>
                      {envelope.name}
                    </Text>
                    <Text size="xs" tone="muted" truncate>
                      {envelope.status}
                      {envelope.createdAt &&
                        ` · criado em ${formatDateTime(envelope.createdAt)}`}
                    </Text>
                  </Box>
                  <EnvelopeLinkDialog envelope={envelope} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
      {(page > 1 || envelopes.data?.hasMore) && (
        <Box className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || envelopes.isFetching}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!envelopes.data?.hasMore || envelopes.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </Box>
      )}
    </Box>
  );
}

function EnvelopeListSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Box key={index} className="flex items-center justify-between gap-3">
            <Box className="flex-1 space-y-2">
              <Skeleton shape="text" className="w-1/2 text-sm" />
              <Skeleton shape="text" className="w-1/3 text-xs" />
            </Box>
            <Skeleton className="h-9 w-24" />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
