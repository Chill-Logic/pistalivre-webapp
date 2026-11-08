import { CheckCircle2, Plus } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { PIX_KEY_TYPES } from "@/constants/portal";
import { pixKeyError } from "@/helpers/wallet";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PixKeyPreview, WalletMutations } from "@/types/portal";
import { maskPixKey } from "@/utils/masks";

type WalletAddDialogProps = {
  /** Portal (the renter's own) or gestão (a customer's record). */
  mutations: WalletMutations;
  description?: string;
  keyFieldLabel?: string;
  /** Lets the team name the key; without it the bank's name is the label. */
  askLabel?: boolean;
  /** Known values of the customer by key type (CPF, EMAIL, PHONE). */
  prefill?: Partial<Record<string, string | null>>;
};

const INITIAL_TYPE = "CPF";

/**
 * Two steps, no jargon: type the key → "Verificar chave" → confirm the
 * owner the bank returned → add. The bank's name becomes the label.
 */
export function WalletAddDialog({
  mutations,
  description = "É para ela que vão os seus reembolsos. Conferimos no banco de quem é a chave antes de salvar.",
  keyFieldLabel = "Sua chave pix",
  askLabel = false,
  prefill,
}: WalletAddDialogProps) {
  const { label } = useLabels();
  const { preview, add } = mutations;
  const [open, setOpen] = useState(false);
  const [pixKeyType, setPixKeyType] = useState<string>(INITIAL_TYPE);
  const [pixKey, setPixKey] = useState("");
  const [nickname, setNickname] = useState("");
  const [owner, setOwner] = useState<PixKeyPreview | null>(null);
  const [error, setError] = useState<{ pixKey?: string; form?: string }>({});
  const busy = preview.isPending || add.isPending;

  const prefilled = (type: string) => maskPixKey(type, prefill?.[type] ?? "");

  const reset = () => {
    setPixKeyType(INITIAL_TYPE);
    setPixKey(prefilled(INITIAL_TYPE));
    setNickname("");
    setOwner(null);
    setError({});
    preview.reset();
    add.reset();
  };

  const onOpenChange = (next: boolean) => {
    if (busy) return;
    setOpen(next);
    if (next) reset();
  };

  const showError = (err: unknown) => setError(pixKeyError(err));

  const verify = () => {
    setError({});
    setOwner(null);
    if (!pixKey.trim()) {
      setError({ pixKey: "Digite a chave pix" });
      return;
    }
    preview.mutate(
      { pixKeyType, pixKey: pixKey.trim() },
      { onSuccess: setOwner, onError: showError },
    );
  };

  const confirm = () => {
    if (!owner) return;
    add.mutate(
      {
        pixKeyType,
        pixKey: pixKey.trim(),
        label: nickname.trim() || owner.bank || undefined,
      },
      { onSuccess: () => setOpen(false), onError: showError },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus />
          Adicionar chave
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Adicionar chave pix</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <Box className="space-y-4">
          <SelectField
            label="Tipo de chave"
            value={pixKeyType}
            options={PIX_KEY_TYPES.map((type) => ({
              value: type,
              label: label(LABEL_MAPS.pixKeyType, type),
            }))}
            onChange={(value) => {
              setPixKeyType(value);
              setPixKey((current) =>
                prefill?.[value]
                  ? prefilled(value)
                  : maskPixKey(value, current),
              );
              setOwner(null);
              setError({});
            }}
            disabled={busy}
          />
          <FormField
            label={keyFieldLabel}
            value={pixKey}
            inputMode={
              pixKeyType === "EMAIL"
                ? "email"
                : pixKeyType === "EVP"
                  ? "text"
                  : "numeric"
            }
            autoCapitalize="off"
            placeholder="Digite a chave"
            onChange={(event) => {
              setPixKey(maskPixKey(pixKeyType, event.target.value));
              setOwner(null);
              setError({});
            }}
            error={error.pixKey}
            disabled={busy}
          />
          {!owner && (
            <Button
              type="button"
              className="w-full"
              onClick={verify}
              disabled={preview.isPending}
            >
              {preview.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Verificar chave
            </Button>
          )}
          {owner && (
            <Box className="space-y-3">
              <Box className="rounded-md bg-success px-3 py-3">
                <Text
                  weight="medium"
                  className="flex items-center gap-2 text-success-foreground"
                >
                  <CheckCircle2 className="size-4" aria-hidden />
                  Encontramos essa conta:
                </Text>
                <Text size="base" weight="bold" className="break-words">
                  {owner.ownerName}
                </Text>
                <Text size="xs" tone="muted">
                  {[owner.bank ?? "Banco", owner.ownerDocument]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </Box>
              {askLabel && (
                <FormField
                  label="Apelido (opcional)"
                  value={nickname}
                  maxLength={60}
                  placeholder={owner.bank ?? "Ex.: Conta principal"}
                  onChange={(event) => setNickname(event.target.value)}
                  disabled={add.isPending}
                />
              )}
              <Button
                type="button"
                className="w-full"
                onClick={confirm}
                disabled={add.isPending}
              >
                {add.isPending && (
                  <Spinner className="text-primary-foreground" />
                )}
                Sim, adicionar essa chave
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setOwner(null)}
                disabled={add.isPending}
              >
                Não, corrigir
              </Button>
            </Box>
          )}
          {error.form && <Alert>{error.form}</Alert>}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
