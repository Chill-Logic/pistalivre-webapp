import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useRevokeAiGrant } from "@/hooks/api/gestao/ai/useAi";
import type { AiMe } from "@/types/ai";
import { formatDateTime } from "@/utils/format";

/** What the person may use (by their role and adjustments) and the apps they authorized. */
export function AiMyAccess({ me }: { me: AiMe }) {
  const revoke = useRevokeAiGrant();
  const active = me.grants.filter((g) => !g.revokedAt);

  return (
    <Box className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seus aplicativos conectados</CardTitle>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <Text tone="muted">Nenhum ainda. Siga um dos passos desta página para conectar.</Text>
          ) : (
            <List className="divide-y">
              {active.map((grant) => (
                <ListItem key={grant.id} className="flex items-center justify-between gap-3 py-3">
                  <Box className="min-w-0">
                    <Text weight="medium" className="break-words">
                      {grant.clientName}
                    </Text>
                    <Text size="xs" tone="muted">
                      Autorizado em {formatDateTime(grant.createdAt)}
                      {grant.lastUsedAt && ` · último uso ${formatDateTime(grant.lastUsedAt)}`}
                    </Text>
                    {grant.clientBlocked && (
                      <Badge variant="outline" className="mt-1">
                        Bloqueado pelo administrador
                      </Badge>
                    )}
                  </Box>
                  <ConfirmDialog
                    destructive
                    trigger={
                      <Button variant="outline" size="sm">
                        Revogar
                      </Button>
                    }
                    title={`Revogar o acesso de ${grant.clientName}?`}
                    description="O aplicativo perde o acesso na hora. Para usar de novo, é preciso autorizar outra vez."
                    confirmLabel="Revogar"
                    onConfirm={() => revoke.mutate(grant.id)}
                    isPending={revoke.isPending}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">O que a sua IA pode fazer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {me.mcpTools.length === 0 ? (
            <Text tone="muted">Nenhuma ferramenta liberada para você. Fale com o administrador.</Text>
          ) : (
            <Box className="flex flex-wrap gap-2">
              {me.mcpTools.map((tool) => (
                <Badge key={tool.name} variant="neutral">
                  {tool.title}
                </Badge>
              ))}
            </Box>
          )}
          <Text size="xs" tone="muted">
            Só consultas: nenhuma ferramenta altera dados nem movimenta dinheiro. Quem libera é o administrador.
          </Text>
        </CardContent>
      </Card>
    </Box>
  );
}

export function AiMyAccessSkeleton() {
  return (
    <Box className="space-y-4">
      {[0, 1].map((index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton shape="text" className="w-48" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton shape="text" className="w-2/3" />
            <Skeleton shape="text" className="w-1/2" />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
