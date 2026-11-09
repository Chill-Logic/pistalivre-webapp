import { Col, Row } from "@/components/atoms/grid";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { AiMyAccess, AiMyAccessSkeleton } from "@/components/organisms/ai-my-access";
import { AiProviderGuide } from "@/components/organisms/ai-provider-guide";
import { QueryError } from "@/components/organisms/query-error";
import { useAiMe } from "@/hooks/api/gestao/ai/useAi";

/** Integrações › Conectar: connect your own AI (MCP), see your access and apps. */
export function IntegrationsPage() {
  const me = useAiMe();
  if (me.isError) return <QueryError error={me.error} onRetry={() => me.refetch()} />;
  return (
    <Row className="items-start gap-y-4">
      <Col lg={7}>
        {me.data ? (
          <AiProviderGuide mcpUrl={me.data.mcpUrl} />
        ) : (
          <SkeletonRegion label="Carregando…">
            <AiMyAccessSkeleton />
          </SkeletonRegion>
        )}
      </Col>
      <Col lg={5}>
        {me.data ? (
          <AiMyAccess me={me.data} />
        ) : (
          <SkeletonRegion label="Carregando…">
            <AiMyAccessSkeleton />
          </SkeletonRegion>
        )}
      </Col>
    </Row>
  );
}
