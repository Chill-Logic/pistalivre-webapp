import { useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { SegmentedControl } from "@/components/atoms/segmented-control";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  AsaasNotificationMatrix,
  AsaasNotificationMatrixSkeleton,
} from "@/components/organisms/asaas-notification-matrix";
import { QueryError } from "@/components/organisms/query-error";
import { TEMPLATE_PERIOD_LABEL } from "@/constants/asaas-notifications";
import { errorMessage } from "@/helpers/api-error";
import {
  useNotificationTemplates,
  useSaveNotificationTemplate,
} from "@/hooks/api/gestao/asaas-notifications/useAsaasNotifications";
import { useSession } from "@/hooks/auth/useSession";
import type {
  NotificationSlots,
  NotificationTemplateItem,
  TemplatePeriod,
} from "@/types/asaas-notification-template";

const PERIODS: TemplatePeriod[] = ["WEEKLY", "MONTHLY", "DAILY"];

const PERIOD_HINT: Record<TemplatePeriod, string> = {
  WEEKLY: "Vale para quem tem locação semanal.",
  MONTHLY: "Vale para quem tem locação mensal (e anual).",
  DAILY: "Diária paga por pix direto no banco: deixe tudo desligado para o Asaas não avisar.",
};

/**
 * Configurações › Avisos do Asaas: one notification template per rental
 * periodicity. The customer gets the one of their live rental by itself
 * (rental created/activated, periodicity changed, linked to Asaas) or by
 * "Aplicar modelo" on their screen. Saving here does not rewrite customers
 * already set — it applies on the next of those moments. Editing: admin.
 */
export function AsaasNotificationTemplatesPage() {
  const templates = useNotificationTemplates();
  const { user } = useSession();
  const isAdmin = user?.kind === "user" && user.role === "ADMIN";
  const [period, setPeriod] = useState<TemplatePeriod>("WEEKLY");
  const item = templates.data?.items.find((t) => t.period === period);

  return (
    <Box className="space-y-6">
      <PageHeader title="Notificações do Asaas" />
      <Card>
        <CardContent className="space-y-4 pt-4 md:pt-6">
          <SegmentedControl
            aria-label="Modelo"
            value={period}
            onValueChange={setPeriod}
            options={PERIODS.map((p) => ({ value: p, label: TEMPLATE_PERIOD_LABEL[p] }))}
            className="max-w-md"
          />
          <Text size="sm" tone="muted">
            {PERIOD_HINT[period]} O cliente recebe o modelo da locação dele sozinho, ao criar ou
            ativar a locação e quando a periodicidade muda.
          </Text>
          {templates.isPending && (
            <SkeletonRegion label="Carregando modelos…">
              <AsaasNotificationMatrixSkeleton />
            </SkeletonRegion>
          )}
          {templates.isError && (
            <QueryError error={templates.error} onRetry={() => templates.refetch()} />
          )}
          {item && templates.data && (
            <TemplateForm
              key={`${item.period}-${item.updatedAt ?? "default"}`}
              item={item}
              offsets={templates.data.offsets}
              canEdit={isAdmin}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

function TemplateForm({
  item,
  offsets,
  canEdit,
}: {
  item: NotificationTemplateItem;
  offsets: NonNullable<ReturnType<typeof useNotificationTemplates>["data"]>["offsets"];
  canEdit: boolean;
}) {
  const save = useSaveNotificationTemplate();
  const [slots, setSlots] = useState<NotificationSlots>(item.slots);
  const dirty = JSON.stringify(slots) !== JSON.stringify(item.slots);

  return (
    <Box className="space-y-4">
      {!canEdit && (
        <Alert variant="warning" role="note">
          Só o administrador muda os modelos.
        </Alert>
      )}
      <AsaasNotificationMatrix
        value={slots}
        onChange={(next) => setSlots(next as NotificationSlots)}
        offsets={offsets}
        disabled={!canEdit || save.isPending}
      />
      {save.isError && <Alert>{errorMessage(save.error)}</Alert>}
      {canEdit && (
        <Box className="flex flex-wrap items-center justify-end gap-3">
          {dirty && (
            <Text size="xs" tone="muted">
              Alterações não salvas.
            </Text>
          )}
          {dirty && (
            <Button variant="ghost" onClick={() => setSlots(item.slots)} disabled={save.isPending}>
              Descartar
            </Button>
          )}
          <Button
            onClick={() => save.mutate({ period: item.period, slots })}
            disabled={!dirty || save.isPending}
          >
            {save.isPending && <Spinner className="text-primary-foreground" />}
            Salvar modelo
          </Button>
        </Box>
      )}
    </Box>
  );
}
