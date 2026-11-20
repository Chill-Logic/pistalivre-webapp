import { useState, type FormEvent } from "react";
import { Ban, Bot, CircleCheck, KeyRound, Plus } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Form } from "@/components/atoms/form";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { CopyCode } from "@/components/molecules/copy-code";
import { EmptyState } from "@/components/molecules/empty-state";
import { FormField } from "@/components/molecules/form-field";
import {
  useBlockAiClient,
  useCreateServiceClient,
  useRevokeAiGrant,
  useRotateServiceSecret,
} from "@/hooks/api/gestao/ai/useAi";
import type { AiClient } from "@/types/ai";
import { formatDateTime } from "@/utils/format";

/**
 * Every app that uses the AI on someone's behalf: the AIs people connected by
 * the MCP (with who authorized them) and the service apps the admin created
 * (the WhatsApp bot, which answers as whoever writes to it). Block an app, revoke
 * one person's authorization or give a service app a new token — all cut at once.
 */
export function AiClientsAdmin({ clients }: { clients: AiClient[] }) {
  const [token, setToken] = useState<{ name: string; value: string } | null>(null);
  return (
    <Box className="space-y-4">
      <Box className="flex justify-end">
        <NewServiceClientDialog onCreated={(name, value) => setToken({ name, value })} />
      </Box>
      {clients.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="Nenhum aplicativo conectado"
          description="Quando alguém conectar uma IA pelo MCP, ela aparece aqui com quem autorizou. Apps de serviço, como o bot do WhatsApp, você cria no botão acima."
        />
      ) : (
        clients.map((client) => (
          <ClientCard key={client.id} client={client} onToken={(value) => setToken({ name: client.name, value })} />
        ))
      )}
      <ServiceTokenDialog token={token} onClose={() => setToken(null)} />
    </Box>
  );
}

function ClientCard({ client, onToken }: { client: AiClient; onToken: (token: string) => void }) {
  const block = useBlockAiClient();
  const revoke = useRevokeAiGrant();
  const rotate = useRotateServiceSecret();
  const service = client.kind === "service";
  const active = client.grants.filter((g) => !g.revokedAt);
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <Box className="min-w-0 space-y-1">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            {client.name}
            {service && <Badge variant="outline">App de serviço</Badge>}
            {client.blocked && <Badge variant="error">Bloqueado</Badge>}
          </CardTitle>
          <Text size="xs" tone="muted" className="break-all">
            {service ? "Criado" : "Registrado"} em {formatDateTime(client.createdAt)}
            {client.lastUsedAt && ` · último uso ${formatDateTime(client.lastUsedAt)}`}
            {!service && ` · ${client.redirectUris.map((u) => new URL(u).host).join(", ")}`}
          </Text>
        </Box>
        <Box className="flex flex-wrap gap-2">
          {service && (
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  <KeyRound />
                  Gerar novo token
                </Button>
              }
              title={`Gerar um novo token para ${client.name}?`}
              description="O token atual para de funcionar na hora. Atualize o bot com o novo em seguida."
              confirmLabel="Gerar novo token"
              onConfirm={() => rotate.mutate(client.id, { onSuccess: onToken })}
              isPending={rotate.isPending}
            />
          )}
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
                ? service
                  ? "O app volta a responder."
                  : "Quem já autorizou volta a ter acesso."
                : service
                  ? "O app para de responder, para todo mundo, até você desbloquear."
                  : "Ninguém mais acessa o sistema por este aplicativo, até você desbloquear."
            }
            confirmLabel={client.blocked ? "Desbloquear" : "Bloquear"}
            onConfirm={() => block.mutate({ id: client.id, blocked: !client.blocked })}
            isPending={block.isPending}
          />
        </Box>
      </CardHeader>
      <CardContent>
        {service ? (
          <Text size="sm" tone="muted">
            Responde como quem fala com ele, com as permissões dessa pessoa: o telefone do WhatsApp precisa estar no
            cadastro do usuário. Telefone sem usuário não recebe resposta.
          </Text>
        ) : active.length === 0 ? (
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
}

/** Names a new service app; the token goes to the caller to be shown once. */
function NewServiceClientDialog({ onCreated }: { onCreated: (name: string, token: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Bot do WhatsApp");
  const create = useCreateServiceClient();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate(name.trim(), {
      onSuccess: ({ client, token }) => {
        setOpen(false);
        onCreated(client.name, token);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Novo app de serviço
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <Form onSubmit={submit} className="space-y-4">
          <DialogTitle>Novo app de serviço</DialogTitle>
          <DialogDescription>
            Para o bot do WhatsApp: ele usa o chat do Livrinho em nome de quem escreve no grupo, identificado pelo
            telefone do usuário.
          </DialogDescription>
          <FormField label="Nome" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoFocus />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim() || create.isPending}>
              Criar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** The token, shown once: only its hash stays in the system. */
function ServiceTokenDialog({
  token,
  onClose,
}: {
  token: { name: string; value: string } | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(token)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md">
        <DialogTitle>Token de {token?.name}</DialogTitle>
        <DialogDescription>Cole este token no cadastro do bot, na ponte do WhatsApp.</DialogDescription>
        {token && <CopyCode code={token.value} copied="Token copiado" />}
        <Alert variant="warning">Copie agora: ele não aparece de novo. Se perder, gere um novo.</Alert>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Já copiei</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
