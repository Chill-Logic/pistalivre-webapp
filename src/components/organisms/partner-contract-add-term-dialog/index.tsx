import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Form } from "@/components/atoms/form";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { toApiError } from "@/helpers/api-error";
import { useAddPartnerInstrument } from "@/hooks/api/gestao/partners/usePartnerContractMutations";
import type {
  PartnerContractInstrument,
  PartnerContractInstruments,
  PartnerInstrumentKind,
} from "@/types/partner";

const TITLE_MAX = 120;

type Errors = { title?: string; form?: string };

type PartnerContractAddTermDialogProps = {
  contractId: string;
  /** The contract's documents now and what can still be added. */
  instruments: PartnerContractInstruments;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Included: the page closes the dialog and opens its tab. */
  onAdded: (instrument: PartnerContractInstrument) => void;
};

/**
 * "Incluir termo": a document that goes with the contract — the contribution
 * term (investment, once) or an "Outro termo" the staff names (an addendum, a
 * delivery term…). Each one gets its own tab with a living text.
 */
export function PartnerContractAddTermDialog({
  contractId,
  instruments,
  open,
  onOpenChange,
  onAdded,
}: PartnerContractAddTermDialogProps) {
  const add = useAddPartnerInstrument(contractId);
  const available = instruments.available;
  const contribution = available.find((a) => a.kind === "CONTRIBUTION_TERM");
  const [chosen, setChosen] = useState<PartnerInstrumentKind | null>(null);
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const kind: PartnerInstrumentKind =
    chosen && available.some((a) => a.kind === chosen)
      ? chosen
      : (available[0]?.kind ?? "CUSTOM");
  const needsTitle =
    available.find((a) => a.kind === kind)?.needsTitle ?? kind === "CUSTOM";

  const close = () => {
    onOpenChange(false);
    setChosen(null);
    setTitle("");
    setErrors({});
  };
  const changeOpen = (next: boolean) => {
    if (add.isPending) return;
    if (next) onOpenChange(true);
    else close();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const name = title.trim();
    if (needsTitle && !name) return setErrors({ title: "Dê um nome ao termo" });
    setErrors({});
    const before = new Set(instruments.items.map((item) => item.id));
    add.mutate(
      { kind, title: needsTitle ? name : undefined },
      {
        onSuccess: (list) => {
          const added =
            list.items.find((item) => !before.has(item.id)) ??
            list.items.find((item) => item.kind === kind && (!needsTitle || item.title === name));
          if (!added) return close();
          // The page closes the dialog and opens the tab in one go (one URL change).
          setChosen(null);
          setTitle("");
          setErrors({});
          onAdded(added);
        },
        onError: (error) => {
          const apiError = toApiError(error);
          const field = apiError.fields?.title;
          setErrors(field ? { title: field } : { form: apiError.message });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent size="sm">
        <DialogTitle>Incluir termo</DialogTitle>
        <DialogDescription>
          Um documento que vai junto com o contrato: ganha uma aba própria, com
          o texto vivo, e segue com ele na revisão do parceiro e no mesmo
          envelope de assinatura.
        </DialogDescription>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          {contribution && (
            <SegmentedField
              label="Documento"
              value={kind}
              options={[
                { value: "CONTRIBUTION_TERM", label: "Termo de aporte" },
                { value: "CUSTOM", label: "Outro termo" },
              ]}
              onChange={(value) => {
                setChosen(value as PartnerInstrumentKind);
                setErrors({});
              }}
              disabled={add.isPending}
            />
          )}
          {kind === "CONTRIBUTION_TERM" && contribution ? (
            <Text size="sm" tone="muted">
              <Text inline size={null} weight="medium" tone="foreground">
                {contribution.title}
              </Text>
              : para quando o parceiro pagou os veículos que estão no nome da
              empresa. Reconhece o aporte e diz que, no fim do contrato, ele
              recebe os próprios veículos, e não o dinheiro de volta.
            </Text>
          ) : (
            <FormField
              label="Nome do termo"
              placeholder="Ex.: Aditivo de reajuste"
              maxLength={TITLE_MAX}
              value={title}
              autoFocus
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors({});
              }}
              error={errors.title}
              disabled={add.isPending}
            />
          )}
          {errors.form && <Alert>{errors.form}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={add.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending && <Spinner className="text-primary-foreground" />}
              Incluir termo
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
