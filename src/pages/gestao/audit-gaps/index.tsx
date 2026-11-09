import { MessageCircleQuestion } from "lucide-react";
import { useMemo, useState } from "react";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { DateField } from "@/components/molecules/date-field";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import { AiAuditDetail } from "@/components/organisms/ai-audit-detail";
import { AiGapList } from "@/components/organisms/ai-gap-list";
import { AiGapTable } from "@/components/organisms/ai-gap-table";
import {
  BarListCard,
  BarListCardSkeleton,
} from "@/components/organisms/bar-list-card";
import { ListFooter } from "@/components/organisms/list-footer";
import { QueryError } from "@/components/organisms/query-error";
import { AI_GAP_REASON_LABELS, AI_GAP_TOOL } from "@/constants/integrations";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import {
  useAiAudit,
  useAiGaps,
  useAiPermissions,
} from "@/hooks/api/gestao/ai/useAi";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { useUrlFilters } from "@/hooks/ui/useUrlFilters";
import type { AiAuditFilters, AiGaps } from "@/types/ai";
import { pluralize } from "@/utils/text";

const KEYS = ["de", "ate"] as const;
const REASONS = [
  "sem_ferramenta",
  "sem_permissao",
  "dado_insuficiente",
] as const;

/**
 * Auditoria › Lacunas (admin only; the section checks): what people asked and
 * the server couldn't answer — the questions the AI reported, by reason, and
 * the tools refused for lack of permission — to know what to build or grant.
 */
export function AuditGapsPage() {
  const { values, page, pageSize, setFilter, setPage, setPageSize } =
    useUrlFilters(KEYS);
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const gaps = useAiGaps(values.de, values.ate);
  const filters = useMemo<AiAuditFilters>(
    () => ({
      page,
      pageSize,
      channel: "",
      userId: "",
      clientId: "",
      tool: AI_GAP_TOOL,
      ok: "",
      de: values.de,
      ate: values.ate,
    }),
    [page, pageSize, values.de, values.ate],
  );
  const questions = useAiAudit(filters, isDesktop);
  const [openId, setOpenId] = useState<string | null>(null);
  const permissions = useAiPermissions();
  const titles = new Map(
    (permissions.data?.tools ?? []).map((t) => [t.name, t.title]),
  );
  const toolTitle = (name: string) => titles.get(name) ?? name;

  return (
    <Box className="space-y-4 md:space-y-6">
      <Row className="gap-y-3">
        <Col span={6} md={4} lg={3}>
          <DateField
            label="De"
            value={values.de}
            onChange={(v) => setFilter("de", v)}
            clearable
          />
        </Col>
        <Col span={6} md={4} lg={3}>
          <DateField
            label="Até"
            value={values.ate}
            onChange={(v) => setFilter("ate", v)}
            clearable
          />
        </Col>
      </Row>

      {gaps.isError ? (
        <QueryError error={gaps.error} onRetry={() => gaps.refetch()} />
      ) : gaps.isPending ? (
        <GapsSummarySkeleton />
      ) : (
        <GapsSummary
          gaps={gaps.data}
          isRefreshing={gaps.isRefreshing}
          toolTitle={toolTitle}
        />
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Perguntas sem resposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.isError ? (
            <QueryError
              error={questions.error}
              onRetry={() => questions.refetch()}
            />
          ) : !questions.isPending && questions.total === 0 ? (
            <EmptyState
              icon={MessageCircleQuestion}
              title="Nenhuma pergunta sem resposta"
              description="Quando a IA não tiver ferramenta, permissão ou dado para responder, a pergunta aparece aqui."
            />
          ) : questions.mode === "pages" ? (
            <AiGapTable
              entries={questions.items}
              isLoading={questions.isPending}
              isRefreshing={questions.isRefreshing}
              onOpen={setOpenId}
            />
          ) : (
            <AiGapList
              entries={questions.items}
              isLoading={questions.isPending}
              isRefreshing={questions.isRefreshing}
              onOpen={setOpenId}
            />
          )}
          <ListFooter
            result={questions}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
      <AiAuditDetail
        id={openId}
        onClose={() => setOpenId(null)}
        toolTitle={toolTitle}
      />
    </Box>
  );
}

function GapsSummary({
  gaps,
  isRefreshing,
  toolTitle,
}: {
  gaps: AiGaps;
  isRefreshing: boolean;
  toolTitle: (name: string) => string;
}) {
  const byReason = new Map(
    gaps.questions.byReason.map((r) => [r.reason, r.count]),
  );
  return (
    <Box
      aria-busy={isRefreshing}
      className={
        isRefreshing
          ? "space-y-4 opacity-60 transition-opacity"
          : "space-y-4 transition-opacity"
      }
    >
      <Row className="gap-y-4">
        <Col span={6} lg={3}>
          <StatCard
            label="Perguntas sem resposta"
            value={gaps.questions.total}
            tone="primary"
          />
        </Col>
        {REASONS.map((reason) => (
          <Col key={reason} span={6} lg={3}>
            <StatCard
              label={AI_GAP_REASON_LABELS[reason]}
              value={byReason.get(reason) ?? 0}
            />
          </Col>
        ))}
      </Row>
      <BarListCard
        title="Ferramentas recusadas por falta de permissão"
        items={gaps.denied.map((d) => ({
          key: d.tool,
          label: toolTitle(d.tool),
          value: d.count,
          display: `${pluralize(d.count, "recusa", "recusas")}${d.people.length ? ` · ${d.people.join(", ")}` : ""}`,
        }))}
        empty="Nenhuma ferramenta recusada neste período."
      />
    </Box>
  );
}

function GapsSummarySkeleton() {
  return (
    <SkeletonRegion label="Carregando lacunas…">
      <Box className="space-y-4">
        <Row className="gap-y-4">
          {[0, 1, 2, 3].map((i) => (
            <Col key={i} span={6} lg={3}>
              <StatCardSkeleton />
            </Col>
          ))}
        </Row>
        <BarListCardSkeleton rows={3} />
      </Box>
    </SkeletonRegion>
  );
}
