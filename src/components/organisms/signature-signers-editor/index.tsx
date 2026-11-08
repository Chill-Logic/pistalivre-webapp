import { ArrowDown, ArrowUp, Plus, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { candidateRole } from "@/helpers/signature";
import { useSetSigners } from "@/hooks/api/gestao/signatures/useSignatureMutations";
import { useLabels } from "@/hooks/ui/useLabels";
import {
  useSignerCandidates,
  type SignerCandidate,
} from "@/hooks/ui/useSignerCandidates";
import type { Signer, SignerChannel, SignerRole } from "@/types/signature";
import { maskCpf, maskPhone, onlyDigits } from "@/utils/masks";

type SignerRow = {
  key: string;
  name: string;
  email: string;
  phone: string;
  documentation: string;
  role: SignerRole;
  notify: SignerChannel;
  customerId: string;
  userId: string;
};

type RowErrors = Partial<
  Record<"name" | "email" | "phone" | "documentation", string>
>;

function toRow(signer: Signer): SignerRow {
  return {
    key: signer.id,
    name: signer.name,
    email: signer.email,
    phone: maskPhone(signer.phone ?? ""),
    documentation: maskCpf(signer.documentation ?? ""),
    role: signer.role as SignerRole,
    notify: signer.notify as SignerChannel,
    customerId: signer.customerId ?? "",
    userId: signer.userId ?? "",
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The draft's signers. The ORDER is the signing order: 1 is invited first
 * and the next only after they sign; moving a row renumbers it (people think
 * "who comes before", not "fill a number"). Saving REPLACES the list.
 */
export function SignatureSignersEditor({
  signatureId,
  signers,
}: {
  signatureId: string;
  signers: Signer[];
}) {
  const { options } = useLabels();
  const save = useSetSigners(signatureId);
  const candidates = useSignerCandidates();
  const [rows, setRows] = useState<SignerRow[]>(() =>
    [...signers].sort((a, b) => a.order - b.order).map(toRow),
  );
  const [errors, setErrors] = useState<Record<number, RowErrors>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [seq, setSeq] = useState(0);
  const { offerContact } = candidates;

  // A draft that already has a customer offers their emergency contact too.
  useEffect(() => {
    for (const signer of signers) {
      if (signer.customerId) {
        offerContact(signer.customerId).catch(() => undefined);
      }
    }
  }, [signers, offerContact]);

  const update = (key: string, patch: Partial<SignerRow>) =>
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );

  const move = (index: number, delta: number) =>
    setRows((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const addRow = (candidate?: SignerCandidate) => {
    setSeq((n) => n + 1);
    setRows((current) => [
      ...current,
      {
        key: `new-${seq}`,
        name: candidate?.name ?? "",
        email: candidate?.email ?? "",
        phone: maskPhone(candidate?.phone ?? ""),
        documentation: maskCpf(candidate?.documentation ?? ""),
        role: candidateRole(candidate),
        notify: "EMAIL",
        // A contact is another person: no link to the customer's record.
        customerId: candidate?.kind === "customer" ? candidate.id : "",
        userId: candidate?.kind === "user" ? candidate.id : "",
      },
    ]);
  };

  const add = async (value: string) => {
    const candidate = await candidates.pick(value);
    if (candidate) addRow(candidate);
  };

  // Emergency contacts not on the list yet (offered once their customer is).
  const suggestedContacts = candidates.contacts.filter(
    (contact) =>
      !rows.some(
        (row) => row.email.trim().toLowerCase() === contact.email.toLowerCase(),
      ),
  );

  const onSave = () => {
    const next: Record<number, RowErrors> = {};
    rows.forEach((row, index) => {
      const rowErrors: RowErrors = {};
      if (!row.name.trim()) rowErrors.name = "Informe o nome";
      if (!EMAIL.test(row.email.trim())) rowErrors.email = "E-mail inválido";
      if (
        (row.notify === "WHATSAPP" || row.notify === "SMS") &&
        onlyDigits(row.phone).length < 10
      ) {
        rowErrors.phone = "Informe o telefone para esse canal";
      }
      if (row.documentation && onlyDigits(row.documentation).length !== 11) {
        rowErrors.documentation = "CPF incompleto";
      }
      if (Object.keys(rowErrors).length > 0) next[index] = rowErrors;
    });
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;
    save.mutate(
      rows.map((row, index) => ({
        name: row.name.trim(),
        email: row.email.trim(),
        ...(onlyDigits(row.phone) ? { phone: onlyDigits(row.phone) } : {}),
        ...(onlyDigits(row.documentation)
          ? { documentation: onlyDigits(row.documentation) }
          : {}),
        order: index + 1,
        role: row.role,
        notify: row.notify,
        ...(row.customerId ? { customerId: row.customerId } : {}),
        ...(row.userId ? { userId: row.userId } : {}),
      })),
      {
        onError: (error) => {
          const apiError = toApiError(error);
          const perRow: Record<number, RowErrors> = {};
          for (const [key, message] of Object.entries(apiError.fields ?? {})) {
            const match = /^signers\.(\d+)\.(\w+)$/.exec(key);
            if (match) {
              const index = Number(match[1]);
              perRow[index] = { ...perRow[index], [match[2]]: message };
            }
          }
          setErrors(perRow);
          setFormError(
            Object.keys(perRow).length > 0
              ? "Corrija os signatários marcados."
              : apiError.message,
          );
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Signatários</CardTitle>
        <Text size="xs" tone="muted">
          A ordem define quem é convidado primeiro.
        </Text>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 && (
          <Text tone="muted">Nenhum signatário adicionado.</Text>
        )}
        {rows.map((row, index) => (
          <Box key={row.key} className="space-y-3 rounded-md border p-3">
            <Box className="flex items-center gap-2">
              <Text
                size="xs"
                weight="semibold"
                className="rounded-md bg-secondary px-2 py-1"
              >
                {index + 1}º a assinar
              </Text>
              <Box className="ml-auto flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Mover ${row.name || `signatário ${index + 1}`} para cima`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Mover ${row.name || `signatário ${index + 1}`} para baixo`}
                  disabled={index === rows.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  aria-label={`Remover ${row.name || `signatário ${index + 1}`}`}
                  onClick={() =>
                    setRows((current) =>
                      current.filter((r) => r.key !== row.key),
                    )
                  }
                >
                  <Trash2 />
                </Button>
              </Box>
            </Box>
            <Row className="gap-y-3">
              <Col md={6}>
                <FormField
                  label="Nome completo"
                  placeholder="Nome e sobrenome"
                  value={row.name}
                  onChange={(event) =>
                    update(row.key, { name: event.target.value })
                  }
                  error={errors[index]?.name}
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="E-mail"
                  type="email"
                  inputMode="email"
                  value={row.email}
                  onChange={(event) =>
                    update(row.key, { email: event.target.value })
                  }
                  error={errors[index]?.email}
                />
              </Col>
              <Col md={6}>
                <MaskedField
                  label="CPF"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={row.documentation}
                  onChange={(value) =>
                    update(row.key, { documentation: value })
                  }
                  mask={maskCpf}
                  error={errors[index]?.documentation}
                />
              </Col>
              <Col md={6}>
                <MaskedField
                  label={
                    row.notify === "WHATSAPP" || row.notify === "SMS"
                      ? "Telefone"
                      : "Telefone (opcional)"
                  }
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  value={row.phone}
                  onChange={(value) => update(row.key, { phone: value })}
                  mask={maskPhone}
                  error={errors[index]?.phone}
                />
              </Col>
              <Col md={6}>
                <SelectField
                  label="Papel"
                  value={row.role}
                  options={options(LABEL_MAPS.signerRole)}
                  onChange={(value) =>
                    update(row.key, { role: value as SignerRole })
                  }
                />
              </Col>
              <Col md={6}>
                <SelectField
                  label="Canal do convite"
                  value={row.notify}
                  options={options(LABEL_MAPS.signerChannel)}
                  onChange={(value) =>
                    update(row.key, { notify: value as SignerChannel })
                  }
                />
              </Col>
            </Row>
          </Box>
        ))}

        <Row className="items-end gap-y-3">
          <Col md={8}>
            <RemoteCombobox
              label="Adicionar quem já está cadastrado"
              value=""
              options={candidates.options}
              isLoading={candidates.isLoading || candidates.isResolving}
              search={candidates.search}
              onSearchChange={candidates.setSearch}
              onChange={(option) => add(option.value)}
              placeholder="Buscar cliente ou alguém da equipe"
              searchPlaceholder="Nome ou e-mail"
            />
          </Col>
          <Col md={4}>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => addRow()}
            >
              <Plus />
              Adicionar em branco
            </Button>
          </Col>
        </Row>
        {suggestedContacts.length > 0 && (
          <Box className="flex flex-wrap gap-2">
            {suggestedContacts.map((contact) => (
              <Button
                key={contact.id}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addRow(contact)}
              >
                <UserPlus />
                {contact.name} (contato de emergência de {contact.of})
              </Button>
            ))}
          </Box>
        )}

        {formError && <Alert>{formError}</Alert>}
        <Box className="flex justify-end">
          <Button type="button" onClick={onSave} disabled={save.isPending}>
            {save.isPending && <Spinner className="text-primary-foreground" />}
            Salvar signatários
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
