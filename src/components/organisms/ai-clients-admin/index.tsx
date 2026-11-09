import { Ban, Bot, CircleCheck } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { EmptyState } from "@/components/molecules/empty-state";
import { useBlockAiClient, useRevokeAiGrant } from "@/hooks/api/gestao/ai/useAi";
import type { AiClient } from "@/types/ai";
import { formatDateTime } from "@/utils/format";

/**
 * Every app connected to the MCP and who authorized it. Block an app (all its
 * people at once) or revoke one person's authorization — both cut at once.
 */
export function AiClientsAdmin({ clients }: { clients: AiClient[] }) {
  const block = useBlockAiClient();
  const revoke = useRevokeAiGrant();
  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Bot}
        title="Nenhum aplicativo conectado"
        description="Quando alguém conectar uma IA pelo MCP, ela aparece aqui com quem autorizou."
      />
    );
  }
  return (
    <Box className="space-y-4">
      {clients.map((client) => {
        const active = client.grants.filter((g) => !g.revokedAt);
        return (
          <Card key={client.id}>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
              <Box className="min-w-0 space-y-1">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  {client.name}
                  {client.blocked && <Badge variant="error">Bloqueado</Badge>}
                </CardTitle>
                <Text size="xs" tone="muted" className="break-all">
                  Registrado em {formatDateTime(client.createdAt)}
                  {client.lastUsedAt && ` · último uso ${formatDateTime(client.lastUsedAt)}`} ·{" "}
                  {client.redirectUris.map((u) => new URL(u).host).join(", ")}
                </Text>
              </Box>
              <ConfirmDialog
                destructive={!client.blocked}
                trigger={
                  <Button variant="outline" size="sm">
                    {client.blocked ? <CircleCheck /> : <Ban />}
                    {client.blocked ? "Desbloquear" : "Bloquear"}
                  </Button>
                }
                title={client.blocked ? `Desbloquear ${client.name}?` : `Bloquear ${client.name}?`}
                description={
                  client.blocked
                    ? "Quem já autorizou volta a ter acesso."
                    : "Ninguém mais acessa o sistema por este aplicativo, até você desbloquear."
                }
                confirmLabel={client.blocked ? "Desbloquear" : "Bloquear"}
                onConfirm={() => block.mutate({ id: client.id, blocked: !client.blocked })}
                isPending={block.isPending}
              />
            </CardHeader>
            <CardContent>
              {active.length === 0 ? (
                <Text size="sm" tone="muted">
                  Nenhuma autorização ativa.
                </Text>
              ) : (
                <List className="divide-y">
                  {active.map((grant) => (
                    <ListItem key={grant.id} className="flex items-center justify-between gap-3 py-2">
                      <Box className="min-w-0">
                        <Text weight="medium">{grant.userName ?? "Usuário removido"}</Text>
                        <Text size="xs" tone="muted">
                          Autorizou em {formatDateTime(grant.createdAt)}
                          {grant.lastUsedAt && ` · último uso ${formatDateTime(grant.lastUsedAt)}`}
                        </Text>
                      </Box>
                      <ConfirmDialog
                        destructive
                        trigger={
                          <Button variant="ghost" size="sm">
                            Revogar
                          </Button>
                        }
                        title={`Revogar o acesso de ${grant.userName ?? "esta pessoa"}?`}
                        description={`${client.name} perde o acesso em nome dessa pessoa na hora.`}
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
        );
      })}
    </Box>
  );
}
