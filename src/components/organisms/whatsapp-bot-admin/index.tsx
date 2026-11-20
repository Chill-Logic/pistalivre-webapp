import { useEffect, useState } from "react";
import { Link2, LogOut, MessageCircle, RefreshCw, Smartphone } from "lucide-react";
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
import { Col, Row } from "@/components/atoms/grid";
import { Image } from "@/components/atoms/image";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxGroupField } from "@/components/molecules/checkbox-group-field";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { EmptyState } from "@/components/molecules/empty-state";
import { SwitchField } from "@/components/molecules/switch-field";
import { TagListField } from "@/components/molecules/tag-list-field";
import { TextLink } from "@/components/molecules/text-link";
import { ROUTES } from "@/constants/routes";
import {
  useConnectWhatsApp,
  useLogoutWhatsApp,
  useNewWhatsAppNumber,
  useSaveWhatsAppSettings,
  useWhatsAppGroups,
  useWhatsAppQr,
} from "@/hooks/api/gestao/whatsapp/useWhatsApp";
import type { WhatsAppBot, WhatsAppStatus } from "@/types/whatsapp";
import { formatPhone } from "@/utils/document";

/** WhatsApp numbers come with the country code: show the Brazilian ones like the rest of the app. */
const showPhone = (phone: string) => (phone.startsWith("55") ? formatPhone(phone.slice(2)) : `+${phone}`);

/**
 * Integrações › WhatsApp: the Livrinho in a WhatsApp group. Link the bridge to
 * the system (the token goes server to server), pair the number by QR, choose
 * the groups and the trigger, swap a banned number.
 */
export function WhatsAppBotAdmin({ status }: { status: WhatsAppStatus }) {
  if (!status.configured || !status.bot) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="Falta configurar a ponte do WhatsApp"
        description="Em Configurações › Empresa › Integrações, preencha “WhatsApp — Livrinho no grupo” com o endereço da ponte e a chave do bot. Depois volte aqui para conectar."
        action={<TextLink to={ROUTES.company}>Ir para Empresa</TextLink>}
      />
    );
  }
  const bot = status.bot;
  return (
    <Row className="gap-y-4">
      <Col span={12} lg={5} className="space-y-4">
        <NumberCard bot={bot} />
      </Col>
      <Col span={12} lg={7} className="space-y-4">
        <LinkCard linked={status.linked} />
        <SettingsCard bot={bot} />
      </Col>
    </Row>
  );
}

function NumberCard({ bot }: { bot: WhatsAppBot }) {
  const connected = bot.state === "open";
  const qr = useWhatsAppQr(!connected && Boolean(bot.number));
  const logout = useLogoutWhatsApp();
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Smartphone className="size-4" aria-hidden />
          Número do bot
        </CardTitle>
        <Badge variant={connected ? "success" : "warning"}>{connected ? "Conectado" : "Desconectado"}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {connected ? (
          <Text size="lg" weight="semibold" className="tabular-nums">
            {bot.number?.phone ? showPhone(bot.number.phone) : "Conectado"}
          </Text>
        ) : (
          <Box className="space-y-3">
            <Text size="sm" tone="muted">
              No celular do bot: WhatsApp › Dispositivos conectados › Conectar dispositivo, e leia o QR abaixo. Ele
              se renova sozinho.
            </Text>
            <Box className="flex justify-center rounded-lg border bg-white p-3">
              {qr.data?.qr ? (
                <Image src={qr.data.qr} alt="QR code para conectar o número do bot" className="size-64" />
              ) : qr.isError ? (
                <Text size="sm" tone="destructive">
                  Não consegui gerar o QR agora. Tente de novo em instantes.
                </Text>
              ) : (
                <Box className="flex size-64 items-center justify-center">
                  <Spinner />
                </Box>
              )}
            </Box>
          </Box>
        )}
        <Box className="flex flex-wrap gap-2">
          <SwapNumberDialog />
          {connected && (
            <ConfirmDialog
              destructive
              trigger={
                <Button variant="ghost" size="sm">
                  <LogOut />
                  Desconectar
                </Button>
              }
              title="Desconectar o número do bot?"
              description="O bot para de responder até alguém ler um QR de novo."
              confirmLabel="Desconectar"
              onConfirm={() => logout.mutate()}
              isPending={logout.isPending}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

/** New number for the bot (ban or planned swap): everything else stays. */
function SwapNumberDialog() {
  const [open, setOpen] = useState(false);
  const [logoutPrevious, setLogoutPrevious] = useState(false);
  const swap = useNewWhatsAppNumber();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw />
          Trocar número
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogTitle>Trocar o número do bot?</DialogTitle>
        <DialogDescription>
          Gera um QR para outro celular. Grupos, gatilho e a ligação com o sistema continuam; só falta colocar o
          número novo nos grupos.
        </DialogDescription>
        <CheckboxField
          label="Desconectar também o número atual (troca planejada)"
          checked={logoutPrevious}
          onChange={setLogoutPrevious}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            disabled={swap.isPending}
            onClick={() => swap.mutate(logoutPrevious, { onSuccess: () => setOpen(false) })}
          >
            Trocar número
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinkCard({ linked }: { linked: boolean }) {
  const connect = useConnectWhatsApp();
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="size-4" aria-hidden />
          Ligação com o sistema
        </CardTitle>
        <Badge variant={linked ? "success" : "warning"}>{linked ? "Ligada" : "Não ligada"}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <Text size="sm" tone="muted">
          {linked
            ? "A ponte chama o Livrinho como quem escreve no grupo, com as permissões dessa pessoa (pelo telefone do usuário)."
            : "Conecte para a ponte poder chamar o Livrinho. O token vai direto para a ponte: ninguém vê nem cola."}
        </Text>
        {linked ? (
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm">
                <RefreshCw />
                Reconectar (novo token)
              </Button>
            }
            title="Gerar um novo token para a ponte?"
            description="Use se o token vazou. O anterior para na hora e a ponte já recebe o novo."
            confirmLabel="Reconectar"
            onConfirm={() => connect.mutate()}
            isPending={connect.isPending}
          />
        ) : (
          <Button size="sm" onClick={() => connect.mutate()} disabled={connect.isPending}>
            <Link2 />
            Conectar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function SettingsCard({ bot }: { bot: WhatsAppBot }) {
  const groups = useWhatsAppGroups(bot.state === "open");
  const save = useSaveWhatsAppSettings();
  const [allowed, setAllowed] = useState(bot.allowedGroupIds);
  const [triggers, setTriggers] = useState(bot.triggers);
  const [active, setActive] = useState(bot.active);
  const [direct, setDirect] = useState(bot.directMessages);
  useEffect(() => {
    setAllowed(bot.allowedGroupIds);
    setTriggers(bot.triggers);
    setActive(bot.active);
    setDirect(bot.directMessages);
  }, [bot.allowedGroupIds, bot.triggers, bot.active, bot.directMessages]);

  const options = (groups.data ?? []).map((g) => ({
    value: g.id,
    label: g.size ? `${g.subject} (${g.size} pessoas)` : g.subject,
  }));
  const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));
  const dirty =
    !sameList(triggers, bot.triggers) ||
    active !== bot.active ||
    direct !== bot.directMessages ||
    allowed.length !== bot.allowedGroupIds.length ||
    allowed.some((g) => !bot.allowedGroupIds.includes(g));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="size-4" aria-hidden />
          Onde e como ele responde
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {bot.state !== "open" ? (
          <Alert variant="info">Conecte o número para escolher os grupos.</Alert>
        ) : groups.isPending ? (
          <Box className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </Box>
        ) : options.length === 0 ? (
          <Alert variant="info">O número ainda não está em nenhum grupo. Adicione-o ao grupo pelo celular.</Alert>
        ) : (
          <CheckboxGroupField
            label="Grupos em que o bot responde"
            hint="Nos outros grupos ele fica calado."
            options={options}
            value={allowed}
            onChange={setAllowed}
          />
        )}
        <TagListField
          label="Gatilhos"
          value={triggers}
          onChange={setTriggers}
          placeholder="Novo gatilho (ex.: livro,)"
          hint="Mensagem que começa com um deles chama o bot (sem diferença de maiúscula e acento). Marcar o número dele ou responder a uma mensagem dele também chama."
        />
        <SwitchField
          label="Responder no privado"
          hint="Só quem é da equipe (telefone no cadastro do usuário). Cliente, parceiro ou desconhecido ouve uma vez que não tem permissão."
          checked={direct}
          onChange={setDirect}
        />
        <SwitchField
          label="Bot ligado"
          hint="Desligado, ele não responde em grupo nenhum."
          checked={active}
          onChange={setActive}
        />
        <Box className="flex justify-end">
          <Button
            onClick={() => save.mutate({ allowedGroupIds: allowed, triggers, active, directMessages: direct })}
            disabled={!dirty || save.isPending}
          >
            Salvar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export function WhatsAppBotAdminSkeleton() {
  return (
    <Row className="gap-y-4">
      <Col span={12} lg={5}>
        <Skeleton className="h-96 w-full" />
      </Col>
      <Col span={12} lg={7} className="space-y-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-64 w-full" />
      </Col>
    </Row>
  );
}
