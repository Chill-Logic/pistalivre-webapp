import { Webhook } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { FormField } from "@/components/molecules/form-field";
import { INTER_WEBHOOK_SUGGESTED_URL } from "@/constants/company";
import { errorMessage, toApiError } from "@/helpers/api-error";
import {
  useInterWebhook,
  useRegisterInterWebhook,
} from "@/hooks/api/gestao/company/useInterWebhook";

/**
 * The Inter's callback: which URL is registered at the bank (asked live)
 * and "Registrar webhook", a REAL change at the bank, behind a strong
 * confirmation. Inbound notifications only: nothing moves money.
 */
export function InterWebhookPanel({ configured }: { configured: boolean }) {
  const registered = useInterWebhook(configured);
  const register = useRegisterInterWebhook();
  const [url, setUrl] = useState(INTER_WEBHOOK_SUGGESTED_URL);
  const [confirming, setConfirming] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const trimmed = url.trim();

  if (!configured) {
    return (
      <Text size="xs" tone="muted">
        Configure e salve as chaves do Inter para registrar o webhook.
      </Text>
    );
  }

  const openConfirm = () => {
    if (!/^https:\/\//i.test(trimmed)) {
      setUrlError("Informe uma URL https pública para o webhook.");
      return;
    }
    setUrlError(null);
    register.reset();
    setConfirming(true);
  };

  const onConfirm = () =>
    register.mutate(trimmed, {
      onSettled: () => setConfirming(false),
      onError: (error) => {
        const fields = toApiError(error).fields;
        if (fields?.url) setUrlError(fields.url);
      },
    });

  return (
    <Box className="space-y-3 rounded-md border p-3">
      <Box className="flex items-center gap-2">
        <Webhook className="size-4 text-muted-foreground" />
        <Text weight="medium">Webhook do Inter</Text>
      </Box>

      <Box className="space-y-1">
        <Text size="xs" tone="muted">
          Registrado no banco agora
        </Text>
        {registered.isPending && (
          <Skeleton shape="text" className="w-64 text-sm" />
        )}
        {registered.isError && (
          <Text size="sm" tone="destructive">
            {errorMessage(registered.error)}
          </Text>
        )}
        {registered.isSuccess && (
          <Text size="sm" mono={Boolean(registered.data)} className="break-all">
            {registered.data ?? "Nenhum webhook registrado"}
          </Text>
        )}
      </Box>

      <FormField
        label="URL do webhook"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        className="font-mono text-xs"
        error={urlError ?? undefined}
        disabled={register.isPending}
      />
      <Text size="xs" tone="muted">
        Precisa ser pública (a do servidor de produção). Se vier só o domínio, o
        servidor acrescenta o caminho.
      </Text>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        trigger={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.preventDefault();
              openConfirm();
            }}
          >
            <Webhook />
            Registrar webhook
          </Button>
        }
        title="Registrar o webhook no Inter?"
        description={
          <>
            Isto troca, no banco de verdade, o endereço que o Inter chama para
            avisar dos pagamentos e dos pix recebidos. O endereço atual deixa de
            receber os avisos. Nada aqui move dinheiro.
            <Text inline mono className="mt-2 block break-all text-foreground">
              {trimmed}
            </Text>
          </>
        }
        confirmLabel="Registrar no Inter"
        onConfirm={onConfirm}
        isPending={register.isPending}
        destructive
      />

      {register.isSuccess && (
        <Alert variant="success" role="status" className="space-y-1">
          <Text size="sm" weight="medium">
            Webhook registrado no Inter.
          </Text>
          <Text size="sm">
            Pagamentos:{" "}
            <Text inline mono className="break-all">
              {register.data.transferUrl}
            </Text>
          </Text>
          <Text size="sm">
            Pix recebido:{" "}
            {register.data.pixInUrl ? (
              <Text inline mono className="break-all">
                {register.data.pixInUrl}
              </Text>
            ) : (
              "pulado (falta a chave pix de recebimento ou o escopo webhook.write)"
            )}
          </Text>
        </Alert>
      )}
      {register.isError && !urlError && (
        <Alert>{errorMessage(register.error)}</Alert>
      )}
    </Box>
  );
}
