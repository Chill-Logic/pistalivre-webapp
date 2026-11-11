import { Check, SendHorizontal, Sparkles, Undo2, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { Textarea } from "@/components/atoms/textarea";
import { AiActionCard } from "@/components/organisms/ai-action-card";
import { toApiError } from "@/helpers/api-error";
import { useAiChat } from "@/hooks/api/gestao/ai/useAi";
import type { AiChatAction, AiChatMode, AiChatStep } from "@/types/ai";
import type { ContractDraftState } from "@/types/contract";
import { cn } from "@/utils/cn";

type ChatEntry = {
  role: "user" | "assistant";
  content: string;
  steps?: AiChatStep[];
  /** Writes the agent proposed: the person confirms each one. */
  actions?: AiChatAction[];
  /** The document before this answer changed it (Desfazer). */
  before?: string;
};

const GREETING: Record<AiChatMode, string> = {
  contract:
    "Olá! Posso ajustar este contrato com você: trocar valores e prazos, incluir acordos, revisar o texto. Consulto a locação, o cliente e os planos quando precisar.",
  proposal:
    "Olá! Posso ajustar esta proposta com você: destacar o plano certo, mudar valores, deixar o texto mais direto. Consulto o lead e os planos quando precisar.",
  partner_contract:
    "Olá! Posso montar este contrato de parceria com você: incluir cláusulas, ajustar prazos e a rescisão, explicar a participação e revisar a linguagem. Consulto o contrato, o parceiro e os veículos quando precisar.",
};

export type AiChatPanelProps = {
  mode: AiChatMode;
  html: string;
  /** The agent changed the document (or Desfazer): load it in the editor. */
  onApply: (html: string) => void;
  suggestions: string[];
  rentalId?: string;
  leadId?: string;
  partnerContractId?: string;
  /** Why the assistant can't work yet (e.g. no preview to edit). */
  disabledReason?: string;
  /** A draft saved on the server: the chat edits it there (and saves). */
  draftId?: string;
  /** Saves what the editor has before asking; resolves with the saved text and version. */
  prepare?: () => Promise<{ html: string; version: number }>;
  /** The draft after the answer (new version): load it in the editor. */
  onDraft?: (draft: ContractDraftState) => void;
  className?: string;
};

/**
 * The editor's AI assistant: a conversation with an agent that reads the
 * system's data and edits the open draft with the person's tools. A rental
 * contract is a draft saved on the server (`draftId`): the chat's changes are
 * saved there too; other documents are never saved — the person reviews and
 * saves. Each answer lists what the agent
 * did; a change to the document can be undone; a write it proposed waits for
 * "Confirmar".
 */
export function AiChatPanel({
  mode,
  html,
  onApply,
  suggestions,
  rentalId,
  leadId,
  partnerContractId,
  disabledReason,
  draftId,
  prepare,
  onDraft,
  className,
}: AiChatPanelProps) {
  const chat = useAiChat();
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length, chat.isPending]);

  const send = (text: string) => {
    const message = text.trim();
    if (!message || chat.isPending || disabledReason) return;
    setError(null);
    setDraft("");
    const history = entries.map(({ role, content }) => ({ role, content }));
    setEntries((current) => [...current, { role: "user", content: message }]);
    const before = html;
    const ready = prepare ? prepare() : Promise.resolve({ html, version: 0 });
    ready
      .then((saved) =>
        chat.mutateAsync({
          mode,
          html: saved.html,
          history,
          message,
          ...(rentalId ? { rentalId } : {}),
          ...(leadId ? { leadId } : {}),
          ...(partnerContractId ? { partnerContractId } : {}),
          ...(draftId ? { draftId, version: saved.version } : {}),
        }),
      )
      .then(
        (answer) => {
          setEntries((current) => [
            ...current,
            {
              role: "assistant",
              content: answer.reply,
              steps: answer.steps,
              actions: answer.actions,
              before: answer.changed ? before : undefined,
            },
          ]);
          if (answer.draft && onDraft) onDraft(answer.draft);
          else if (answer.changed) onApply(answer.html);
        },
        (failure) => setError(toApiError(failure).message),
      );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(draft);
    }
  };

  return (
    <Box className={cn("flex min-h-0 flex-col", className)}>
      <Box className="flex items-center gap-2 border-b px-4 py-3">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <Text weight="semibold">Assistente de IA</Text>
      </Box>

      <Box
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        <Box className="space-y-3">
          <Sparkles className="size-5 text-primary" aria-hidden />
          <Text size="sm">{GREETING[mode]}</Text>
          {disabledReason && (
            <Alert variant="info" role="note">
              {disabledReason}
            </Alert>
          )}
          {entries.length === 0 && !disabledReason && (
            <>
              <Text size="sm" tone="muted">
                Não sabe por onde começar? Escolha uma opção:
              </Text>
              <Box className="flex flex-col items-end gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal rounded-full py-2 text-right"
                    onClick={() => send(suggestion)}
                    disabled={chat.isPending}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </Box>

        <List className="space-y-3">
          {entries.map((entry, index) => (
            <ListItem
              key={index}
              className={cn(
                "flex",
                entry.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {entry.role === "user" ? (
                <Box className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary/10 px-3 py-2">
                  <Text size="sm" className="whitespace-pre-wrap break-words">
                    {entry.content}
                  </Text>
                </Box>
              ) : (
                <Box className="max-w-[92%] space-y-2 rounded-2xl rounded-bl-sm border bg-card px-3 py-2">
                  <Text size="sm" className="whitespace-pre-wrap break-words">
                    {entry.content}
                  </Text>
                  {entry.steps && entry.steps.length > 0 && (
                    <List className="space-y-0.5">
                      {entry.steps.map((step, i) => (
                        <ListItem key={i} className="flex items-center gap-1.5">
                          {step.ok ? (
                            <Check
                              className="size-3 text-success"
                              aria-hidden
                            />
                          ) : (
                            <X
                              className="size-3 text-destructive"
                              aria-hidden
                            />
                          )}
                          <Text inline size="xs" tone="muted">
                            {step.title}
                          </Text>
                        </ListItem>
                      ))}
                    </List>
                  )}
                  {entry.actions?.map((action) => (
                    <AiActionCard key={action.id} action={action} />
                  ))}
                  {entry.before !== undefined && (
                    <Box className="flex items-center justify-between gap-2 border-t pt-2">
                      <Text size="xs" tone="muted">
                        Documento atualizado
                      </Text>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onApply(entry.before as string);
                          setEntries((current) =>
                            current.map((e, i) =>
                              i === index ? { ...e, before: undefined } : e,
                            ),
                          );
                        }}
                      >
                        <Undo2 />
                        Desfazer
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </ListItem>
          ))}
        </List>

        {chat.isPending && (
          <Box className="flex items-center gap-2">
            <Spinner />
            <Text size="sm" tone="muted">
              Pensando…
            </Text>
          </Box>
        )}
        {error && <Alert>{error}</Alert>}
        <Box ref={bottom} />
      </Box>

      <Box className="space-y-2 border-t px-4 py-3">
        <Box className="flex items-end gap-2">
          <Textarea
            aria-label="Mensagem para a IA"
            placeholder="Peça um ajuste…"
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            className="min-h-11 resize-none"
            disabled={chat.isPending || Boolean(disabledReason)}
          />
          <Button
            type="button"
            size="icon"
            aria-label="Enviar"
            onClick={() => send(draft)}
            disabled={
              chat.isPending || !draft.trim() || Boolean(disabledReason)
            }
          >
            <SendHorizontal />
          </Button>
        </Box>
        <Text size="xs" tone="muted" className="text-center">
          A IA pode errar: revise o documento antes de salvar.
        </Text>
      </Box>
    </Box>
  );
}
