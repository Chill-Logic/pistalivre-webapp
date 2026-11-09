import { Bot, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { toApiError } from "@/helpers/api-error";
import { useAiConsent } from "@/hooks/api/gestao/ai/useAi";
import { useSession } from "@/hooks/auth/useSession";
import { aiService } from "@/services/api/gestao/ai.service";

/**
 * OAuth consent of the MCP: an AI app asks to use the system IN THE NAME of
 * the signed-in person, with their tools. Approve → back to the app with a
 * one-time code; refuse → back with the refusal. Both are audited.
 */
export function AiConsentPage() {
  const { search } = useLocation();
  const query = search.replace(/^\?/, "");
  const consent = useAiConsent(query);
  const { user } = useSession();
  const [pending, setPending] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = async (decision: "approve" | "deny") => {
    setPending(decision);
    setError(null);
    try {
      const redirectTo = await aiService.decide(Object.fromEntries(new URLSearchParams(query)), decision);
      window.location.assign(redirectTo);
    } catch (failure) {
      setError(toApiError(failure).message);
      setPending(null);
    }
  };

  if (consent.isError) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Pedido de acesso inválido"
        description={toApiError(consent.error).message}
      />
    );
  }

  return (
    <Box className="mx-auto max-w-lg space-y-4 py-4">
      {!consent.data ? (
        <SkeletonRegion label="Carregando pedido de acesso…">
          <Card>
            <CardHeader>
              <Skeleton shape="text" className="w-2/3 text-xl" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton shape="text" className="w-full" />
              <Skeleton shape="text" className="w-3/4" />
              <Skeleton className="h-11" />
            </CardContent>
          </Card>
        </SkeletonRegion>
      ) : (
        <Card>
          <CardHeader className="space-y-3">
            <Bot className="size-8 text-primary" aria-hidden />
            <CardTitle className="text-lg">
              {consent.data.client.name} quer acessar o sistema em seu nome
            </CardTitle>
            <Text size="sm" tone="muted">
              Você está entrando como <Text inline size="sm" weight="semibold">{user?.name}</Text>. A resposta volta para{" "}
              <Text inline size="sm" weight="semibold">{consent.data.client.redirectHost}</Text>.
            </Text>
          </CardHeader>
          <CardContent className="space-y-4">
            <Box className="space-y-2">
              <Text size="sm" weight="medium">
                O que o aplicativo vai poder fazer (as suas permissões):
              </Text>
              {consent.data.tools.length === 0 ? (
                <Alert variant="warning">Você não tem ferramentas liberadas: o aplicativo não vai conseguir fazer nada.</Alert>
              ) : (
                <Box className="flex flex-wrap gap-2">
                  {consent.data.tools.map((tool) => (
                    <Badge key={tool.name} variant="neutral">
                      {tool.title}
                    </Badge>
                  ))}
                </Box>
              )}
            </Box>
            <Text size="xs" tone="muted">
              Só consultas: nada é alterado e nenhum dinheiro é movimentado. Tudo o que o aplicativo fizer fica
              registrado na auditoria. Você pode revogar quando quiser em Integrações.
            </Text>
            {error && <Alert>{error}</Alert>}
            <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" disabled={pending !== null} onClick={() => decide("deny")}>
                {pending === "deny" && <Spinner />}
                Recusar
              </Button>
              <Button type="button" disabled={pending !== null} onClick={() => decide("approve")}>
                {pending === "approve" && <Spinner className="text-primary-foreground" />}
                Autorizar
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
