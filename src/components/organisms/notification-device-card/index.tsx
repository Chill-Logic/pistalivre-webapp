import { BellRing, Send } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Text } from "@/components/atoms/text";
import { useSendTestNotification } from "@/hooks/api/gestao/notifications/useNotifications";
import { usePushDevice } from "@/hooks/ui/usePushDevice";

type NotificationDeviceCardProps = {
  /** null = the server has no push keys (bell only). */
  pushPublicKey: string | null;
  /** How many of the person's devices have push on. */
  devices: number;
};

const BLOCKER_TEXT = {
  unsupported: "Este navegador não recebe notificações push. O sininho continua mostrando tudo.",
  "ios-not-installed":
    "No iPhone, o push só funciona com o app instalado na tela inicial (Compartilhar › Adicionar à Tela de Início) e aberto por lá.",
  denied:
    "As notificações deste site estão bloqueadas no navegador. Libere nas configurações do site (o cadeado ao lado do endereço) e volte aqui.",
} as const;

/**
 * Push on THIS device: turn on/off and send a test. Whatever happens here,
 * the bell keeps every notice — push is only the extra nudge.
 */
export function NotificationDeviceCard({ pushPublicKey, devices }: NotificationDeviceCardProps) {
  const push = usePushDevice(pushPublicKey);
  const test = useSendTestNotification();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Neste aparelho</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Text tone="muted">
          Com o push ligado, os avisos chegam no celular ou no computador mesmo com o sistema fechado. O sininho
          sempre guarda tudo, com ou sem push.
        </Text>
        {!pushPublicKey ? (
          <Alert variant="info" role="note">
            O push ainda não foi configurado no servidor. Por enquanto os avisos ficam só no sininho.
          </Alert>
        ) : push.blocker ? (
          <Alert variant="info" role="note">
            {BLOCKER_TEXT[push.blocker]}
          </Alert>
        ) : (
          <Box className="flex flex-wrap items-center gap-3">
            {push.subscribed ? (
              <>
                <Text weight="medium" className="flex items-center gap-2 text-success-foreground">
                  <BellRing className="size-4" aria-hidden />
                  Push ativo neste aparelho
                </Text>
                <Button variant="ghost" size="sm" disabled={push.busy} onClick={push.disable}>
                  Desativar
                </Button>
              </>
            ) : (
              <Button disabled={push.busy} onClick={push.enable}>
                <BellRing />
                Ativar push neste aparelho
              </Button>
            )}
          </Box>
        )}
        <Box className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <Text size="xs" tone="muted">
            {devices === 0
              ? "Nenhum aparelho com push."
              : devices === 1
                ? "1 aparelho seu recebe push."
                : `${devices} aparelhos seus recebem push.`}
          </Text>
          <Button variant="outline" size="sm" disabled={test.isPending} onClick={() => test.mutate()}>
            <Send />
            Enviar teste
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
