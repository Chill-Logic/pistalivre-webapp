import { CheckCheck } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { AiActionHistory } from "@/components/organisms/ai-action-history";
import { AiActionReviewCard, AiActionReviewCardSkeleton } from "@/components/organisms/ai-action-review-card";
import { QueryError } from "@/components/organisms/query-error";
import { useAiActions } from "@/hooks/api/gestao/ai/useAiActions";

function AiActionsSkeleton() {
  return (
    <SkeletonRegion className="space-y-4">
      <AiActionReviewCardSkeleton />
      <AiActionReviewCardSkeleton />
    </SkeletonRegion>
  );
}

/**
 * "Ações da IA": what the assistant proposed for this person — in the
 * system's chat or through an outside AI (MCP) — waiting for their "sim",
 * readable and with the files, to confirm or cancel here (also on the
 * phone). Below, what was decided in the last 7 days.
 */
export function AiActionsPage() {
  const { list, confirm, cancel } = useAiActions();

  return (
    <Box className="space-y-4">
      <PageHeader title="Ações da IA" />
      {list.isError ? (
        <QueryError error={list.error} onRetry={() => list.refetch()} />
      ) : !list.data ? (
        <AiActionsSkeleton />
      ) : (
        <>
          <Box className="space-y-3">
            <Heading level={2} variant="section">
              Aguardando você ({list.data.pending.length})
            </Heading>
            {list.data.pending.length === 0 ? (
              <EmptyState
                icon={CheckCheck}
                title="Nada esperando confirmação"
                description="Quando a IA preparar algo para gravar (manutenção, débito, cadastro…), aparece aqui para você conferir. Cada prévia vale 10 minutos."
              />
            ) : (
              list.data.pending.map((action) => (
                <AiActionReviewCard
                  key={action.id}
                  action={action}
                  onConfirm={() => confirm.mutate(action.id)}
                  onCancel={() => cancel.mutate(action.id)}
                  confirming={confirm.isPending && confirm.variables === action.id}
                  cancelling={cancel.isPending && cancel.variables === action.id}
                />
              ))
            )}
          </Box>

          {list.data.recent.length > 0 && (
            <Box className="space-y-3">
              <Heading level={2} variant="section">
                Decididas nos últimos 7 dias
              </Heading>
              <AiActionHistory actions={list.data.recent} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
