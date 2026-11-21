import { useEffect, useMemo, useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { SelectField } from "@/components/molecules/select-field";
import { SwitchField } from "@/components/molecules/switch-field";
import { QueryError } from "@/components/organisms/query-error";
import { useWhatsAppGroups } from "@/hooks/api/gestao/whatsapp/useWhatsApp";
import {
  useGroupNotices,
  useSaveGroupNotices,
  useTestGroupNotice,
} from "@/hooks/api/gestao/notifications/useGroupNotices";
import type {
  GroupNoticeSettings,
  NotificationTypeInfo,
} from "@/types/notification";

const NO_GROUP = "__none__";
const DUE_SOON = "payment.due_soon";

const same = (a: GroupNoticeSettings, b: GroupNoticeSettings) =>
  a.groupId === b.groupId &&
  a.dueSoonMonthlyDays === b.dueSoonMonthlyDays &&
  a.dueSoonWeeklyDays === b.dueSoonWeeklyDays &&
  a.dueSoonMonthlyEvery === b.dueSoonMonthlyEvery &&
  a.dueSoonWeeklyEvery === b.dueSoonWeeklyEvery &&
  a.types.length === b.types.length &&
  a.types.every((t) => b.types.includes(t));

const toDays = (value: string) => Math.max(1, Math.min(30, Number(value) || 1));
const toEvery = (value: string) =>
  value.trim() === "" || Number(value) <= 0
    ? null
    : Math.min(30, Number(value));

/** "Vence em breve": from X days before, every Z days (empty = once), for monthly and weekly rent. */
function DueSoonFields({
  draft,
  onChange,
}: {
  draft: GroupNoticeSettings;
  onChange: (d: GroupNoticeSettings) => void;
}) {
  const preview = (start: number, every: number | null) => {
    const days = every
      ? Array.from({ length: start }, (_, i) => start - i).filter(
          (d) => (start - d) % every === 0,
        )
      : [start];
    const unit = days.length === 1 && days[0] === 1 ? "dia" : "dias";
    return `Avisa com ${days.join(", ")} ${unit} de antecedência.`;
  };
  return (
    <Box className="space-y-3 rounded-lg border bg-muted/40 p-3">
      <Row className="gap-y-3">
        <Col span={12} md={6}>
          <FormField
            label="Mensal: começar a avisar (dias antes)"
            type="number"
            min={1}
            max={30}
            value={String(draft.dueSoonMonthlyDays)}
            onChange={(e) =>
              onChange({ ...draft, dueSoonMonthlyDays: toDays(e.target.value) })
            }
          />
        </Col>
        <Col span={12} md={6}>
          <FormField
            label="Mensal: repetir a cada (dias, vazio = uma vez)"
            type="number"
            min={1}
            max={30}
            value={
              draft.dueSoonMonthlyEvery ? String(draft.dueSoonMonthlyEvery) : ""
            }
            onChange={(e) =>
              onChange({
                ...draft,
                dueSoonMonthlyEvery: toEvery(e.target.value),
              })
            }
          />
        </Col>
      </Row>
      <Text size="xs" tone="muted">
        {preview(draft.dueSoonMonthlyDays, draft.dueSoonMonthlyEvery)}
      </Text>
      <Row className="gap-y-3">
        <Col span={12} md={6}>
          <FormField
            label="Semanal: começar a avisar (dias antes)"
            type="number"
            min={1}
            max={30}
            value={String(draft.dueSoonWeeklyDays)}
            onChange={(e) =>
              onChange({ ...draft, dueSoonWeeklyDays: toDays(e.target.value) })
            }
          />
        </Col>
        <Col span={12} md={6}>
          <FormField
            label="Semanal: repetir a cada (dias, vazio = uma vez)"
            type="number"
            min={1}
            max={30}
            value={
              draft.dueSoonWeeklyEvery ? String(draft.dueSoonWeeklyEvery) : ""
            }
            onChange={(e) =>
              onChange({
                ...draft,
                dueSoonWeeklyEvery: toEvery(e.target.value),
              })
            }
          />
        </Col>
      </Row>
      <Text size="xs" tone="muted">
        {preview(draft.dueSoonWeeklyDays, draft.dueSoonWeeklyEvery)}
      </Text>
    </Box>
  );
}

export function WhatsAppGroupNoticesSkeleton() {
  return <Skeleton className="h-96 w-full" />;
}

/**
 * Integrações › WhatsApp › "Avisos no grupo": the system's notices (the same
 * as the bell and push) that ALSO go to a WhatsApp group, each type switched on
 * or off here, plus the lead time of "vence em breve" for monthly and weekly
 * rent. Each event goes once, with the link to the screen.
 */
export function WhatsAppGroupNotices({ connected }: { connected: boolean }) {
  const notices = useGroupNotices();
  const groups = useWhatsAppGroups(connected);
  const save = useSaveGroupNotices();
  const test = useTestGroupNotice();
  const [draft, setDraft] = useState<GroupNoticeSettings | null>(null);

  useEffect(() => {
    if (notices.data) setDraft(notices.data.settings);
  }, [notices.data]);

  const byGroup = useMemo(() => {
    const out = new Map<string, NotificationTypeInfo[]>();
    for (const t of notices.data?.types ?? [])
      out.set(t.group, [...(out.get(t.group) ?? []), t]);
    return [...out];
  }, [notices.data]);

  if (notices.isError)
    return (
      <QueryError error={notices.error} onRetry={() => notices.refetch()} />
    );
  if (!notices.data || !draft) return <WhatsAppGroupNoticesSkeleton />;

  const saved = notices.data.settings;
  const dirty = !same(draft, saved);
  const toggle = (type: string, on: boolean) =>
    setDraft({
      ...draft,
      types: on
        ? [...draft.types, type]
        : draft.types.filter((t) => t !== type),
    });
  const options = [
    { value: NO_GROUP, label: "Nenhum (não mandar avisos)" },
    ...(groups.data ?? []).map((g) => ({ value: g.id, label: g.subject })),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Avisos no grupo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Text size="sm" tone="muted">
          Os avisos do sistema (os mesmos do sininho) que você ligar aqui também
          vão para o grupo, uma vez cada, com o link da tela.
        </Text>
        <SelectField
          label="Grupo dos avisos"
          value={draft.groupId ?? NO_GROUP}
          options={options}
          disabled={!connected}
          onChange={(value) =>
            setDraft({ ...draft, groupId: value === NO_GROUP ? null : value })
          }
        />
        {byGroup.map(([group, types]) => (
          <Box key={group} className="space-y-3">
            <Text size="sm" weight="semibold">
              {group}
            </Text>
            {types.map((t) => (
              <Box key={t.type} className="space-y-3">
                <SwitchField
                  label={t.title}
                  hint={t.description}
                  checked={draft.types.includes(t.type)}
                  onChange={(on) => toggle(t.type, on)}
                />
                {t.type === DUE_SOON && draft.types.includes(DUE_SOON) && (
                  <DueSoonFields draft={draft} onChange={setDraft} />
                )}
              </Box>
            ))}
          </Box>
        ))}
        <Box className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            disabled={dirty || !saved.groupId || test.isPending}
            onClick={() => test.mutate()}
          >
            Enviar teste
          </Button>
          <Button
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate(draft)}
          >
            Salvar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
