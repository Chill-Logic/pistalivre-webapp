import { Eye, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { AiChatDock } from "@/components/organisms/ai-chat-dock";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import { MoneyField } from "@/components/molecules/money-field";
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { CopyProposalButton } from "@/components/organisms/copy-proposal-button";
import { ProposalHtmlEditor } from "@/components/organisms/proposal-html-editor";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { moneyErrorMessage } from "@/helpers/money-errors";
import { useContractOptions } from "@/hooks/api/gestao/contracts/useContractOptions";
import { useAiChatAvailable } from "@/hooks/api/gestao/ai/useAi";
import {
  useIssueProposal,
  useProposalDraft,
  useProposalPreview,
} from "@/hooks/api/gestao/proposals/useProposalMutations";
import { useIdempotencyKey } from "@/hooks/ui/useIdempotencyKey";
import { useLabels } from "@/hooks/ui/useLabels";
import { useVehicleOptions } from "@/hooks/ui/useRemoteOptions";
import type {
  ProposalDetail,
  ProposalDraftInput,
  ProposalTemplateOption,
} from "@/types/proposal";
import { maskPhone, onlyDigits } from "@/utils/masks";

type ProposalComposerProps = {
  template: ProposalTemplateOption;
  /** From a CRM lead (the contact comes from it); null = standalone. */
  lead: { id: string; name: string } | null;
  cancelTo: string;
  onIssued: (proposal: ProposalDetail) => void;
};

type Errors = Partial<Record<"recipient" | "draft" | "issue", string>>;

/** Starting points offered by the assistant (it asks for what's missing). */
const PROPOSAL_SUGGESTIONS = [
  "Destacar o plano de interesse do lead",
  "Deixar a proposta mais curta e direta",
  "Mostrar o valor semanal e o mensal",
  "Revisar o texto e corrigir erros",
];

/**
 * "Proposta de locação", as in the management app: the terms + the optional
 * clauses → "Gerar prévia" (the template merged by the server) → review the
 * text (with the AI assistant beside it from the start) → "Visualizar PDF" → "Emitir". Only
 * "Emitir" saves anything. Standalone: the recipient typed here freezes on
 * the proposal (it feeds the template's {{lead.*}}).
 */
export function ProposalComposer({
  template,
  lead,
  cancelTo,
  onIssued,
}: ProposalComposerProps) {
  const { options } = useLabels();
  const vehicles = useVehicleOptions();
  const draft = useProposalDraft();
  const preview = useProposalPreview();
  const issue = useIssueProposal();
  const idempotency = useIdempotencyKey();
  const { aiEnabled } = useContractOptions();
  const chatAvailable = useAiChatAvailable() && aiEnabled;

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [ratePeriod, setRatePeriod] = useState("WEEKLY");
  const [rate, setRate] = useState<number | null>(null);
  const [cautionTotal, setCautionTotal] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [clauses, setClauses] = useState(template.clauses.map((c) => c.key));
  const [html, setHtml] = useState("");
  const [version, setVersion] = useState(0);
  const [errors, setErrors] = useState<Errors>({});

  const standalone = !lead;
  const missingRecipient = standalone && !recipientName.trim();

  const target = (): ProposalDraftInput => ({
    ...(lead
      ? { leadId: lead.id }
      : {
          recipient: {
            name: recipientName.trim(),
            ...(onlyDigits(recipientPhone)
              ? { phone: onlyDigits(recipientPhone) }
              : {}),
            ...(recipientEmail.trim() ? { email: recipientEmail.trim() } : {}),
          },
        }),
    templateId: template.id,
    inputs: {
      ...(vehicleId ? { vehicleId } : {}),
      ...(rate ? { rate } : {}),
      ratePeriod,
      ...(cautionTotal ? { cautionTotal } : {}),
      ...(startDate ? { startDate } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    },
    clauses,
  });

  /** Loads a new text into the editor (remounts it). */
  const load = (next: string) => {
    setHtml(next);
    setVersion((v) => v + 1);
  };

  const buildDraft = () => {
    setErrors({});
    draft.mutate(target(), {
      onSuccess: load,
      onError: (error) => {
        const apiError = toApiError(error);
        const field = apiError.fields?.["recipient.name"];
        setErrors(field ? { recipient: field } : { draft: apiError.message });
      },
    });
  };

  const doIssue = () => {
    setErrors({});
    issue.mutate(
      { key: idempotency.key, input: { ...target(), html } },
      {
        onSuccess: (proposal) => {
          idempotency.renew();
          onIssued(proposal);
        },
        onError: (error) => setErrors({ issue: moneyErrorMessage(error) }),
      },
    );
  };

  const busy = draft.isPending || issue.isPending;

  const composer = (
    <Card>
      <CardContent className="space-y-6 pt-4 md:pt-6">
        {standalone ? (
          <Box className="space-y-3 rounded-md border p-4">
            <Text weight="medium">Para quem é a proposta</Text>
            <Text size="xs" tone="muted">
              Esta proposta não está ligada a nenhum lead. O contato fica
              guardado nela mesma.
            </Text>
            <Row className="gap-y-4">
              <Col md={4}>
                <FormField
                  label="Nome"
                  placeholder="Nome de quem vai receber"
                  value={recipientName}
                  onChange={(event) => {
                    setRecipientName(event.target.value);
                    setErrors({});
                  }}
                  error={errors.recipient}
                />
              </Col>
              <Col md={4}>
                <MaskedField
                  label="Telefone (opcional)"
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  value={recipientPhone}
                  onChange={setRecipientPhone}
                  mask={maskPhone}
                />
              </Col>
              <Col md={4}>
                <FormField
                  label="E-mail (opcional)"
                  type="email"
                  inputMode="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                />
              </Col>
            </Row>
          </Box>
        ) : (
          <Text>
            Para{" "}
            <Text inline weight="medium">
              {lead.name}
            </Text>{" "}
            (lead do CRM): o contato vem do lead.
          </Text>
        )}

        <Row className="gap-y-4">
          <Col md={6}>
            <RemoteCombobox
              label="Veículo"
              value={vehicleId}
              selectedLabel={vehicleLabel}
              options={vehicles.options}
              isLoading={vehicles.isLoading}
              search={vehicles.search}
              onSearchChange={vehicles.setSearch}
              onChange={(option) => {
                setVehicleId(option.value);
                setVehicleLabel(option.label);
              }}
              placeholder="Selecione o veículo"
              searchPlaceholder="Buscar por placa ou modelo"
            />
          </Col>
          <Col md={6}>
            <SelectField
              label="Periodicidade do aluguel"
              value={ratePeriod}
              options={options(LABEL_MAPS.ratePeriod)}
              onChange={setRatePeriod}
            />
          </Col>
          <Col md={6}>
            <MoneyField
              label="Valor do aluguel"
              value={rate}
              onChange={setRate}
            />
          </Col>
          <Col md={6}>
            <MoneyField
              label="Caução (opcional)"
              value={cautionTotal}
              onChange={setCautionTotal}
            />
          </Col>
          <Col md={6}>
            <DateField
              label="Início previsto (opcional)"
              value={startDate}
              onChange={setStartDate}
              clearable
            />
          </Col>
          <Col>
            <TextareaField
              label="Observação (opcional)"
              placeholder="Ex.: condições especiais desta proposta"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Col>
        </Row>

        {template.clauses.length > 0 && (
          <Box
            role="group"
            aria-label="Cláusulas da proposta"
            className="space-y-3"
          >
            <Text weight="medium">Cláusulas da proposta</Text>
            {template.clauses.map((clause) => (
              <CheckboxField
                key={clause.key}
                label={clause.label}
                checked={clauses.includes(clause.key)}
                onChange={(checked) =>
                  setClauses((current) =>
                    checked
                      ? [...current, clause.key]
                      : current.filter((k) => k !== clause.key),
                  )
                }
              />
            ))}
          </Box>
        )}

        {errors.draft && <Alert>{errors.draft}</Alert>}
        <Box className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={buildDraft}
            disabled={busy || missingRecipient}
          >
            {draft.isPending && <Spinner />}
            <FileText />
            {html ? "Regerar prévia" : "Gerar prévia"}
          </Button>
        </Box>

        {html && (
          <Box className="space-y-4 border-t pt-6">
            <ProposalHtmlEditor
              key={version}
              label="Texto da proposta (o que estiver aqui vai para o PDF)"
              value={html}
              onChange={setHtml}
            />

            {errors.issue && <Alert>{errors.issue}</Alert>}
            <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button asChild variant="ghost">
                <Link to={cancelTo}>Cancelar</Link>
              </Button>
              <CopyProposalButton source={{ html }} />
              <Button
                type="button"
                variant="outline"
                onClick={() => preview.mutate(html)}
                disabled={preview.isPending || busy}
              >
                {preview.isPending ? <Spinner /> : <Eye />}
                Visualizar PDF
              </Button>
              <Button
                type="button"
                onClick={doIssue}
                disabled={busy || !html.trim()}
              >
                {issue.isPending && (
                  <Spinner className="text-primary-foreground" />
                )}
                Emitir (gerar PDF)
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (!chatAvailable) return composer;
  return (
    <Row className="gap-y-4">
      <Col lg={8} className="order-2 lg:order-1">
        {composer}
      </Col>
      <Col lg={4} className="order-1 lg:order-2">
        <AiChatDock
          mode="proposal"
          html={html}
          onApply={load}
          suggestions={PROPOSAL_SUGGESTIONS}
          leadId={lead?.id}
          disabledReason={html ? undefined : "Gere a prévia para eu poder ajustar o texto da proposta com você."}
        />
      </Col>
    </Row>
  );
}
