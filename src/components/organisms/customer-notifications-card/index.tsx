import { RefreshCw, Wand2 } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import {
  AsaasNotificationMatrix,
  AsaasNotificationMatrixSkeleton,
} from "@/components/organisms/asaas-notification-matrix";
import { QueryError } from "@/components/organisms/query-error";
import { TEMPLATE_PERIOD_LABEL } from "@/constants/asaas-notifications";
import { errorMessage } from "@/helpers/api-error";
import {
  useApplyNotificationTemplate,
  useCustomerNotificationSlots,
  useNotificationTemplates,
  useSaveCustomerNotificationSlots,
} from "@/hooks/api/gestao/asaas-notifications/useAsaasNotifications";
import type {
  NotificationSlot,
  NotificationSlots,
  TemplatePeriod,
} from "@/types/asaas-notification-template";
import type { CustomerDetail } from "@/types/customer";

/**
 * How Asaas warns this customer (read live from Asaas), in the same blocks as
 * the templates. The setting follows their rental's template by itself;
 * "Aplicar modelo" redoes it now, and a hand edit here lasts until the next
 * automatic moment (rental created/activated, periodicity changed). Ticking a
 * box does not save — only "Salvar".
 */
export function CustomerNotificationsCard({
  customer,
}: {
  customer: Pick<CustomerDetail, "id" | "emergencyContact">;
}) {
  const view = useCustomerNotificationSlots(customer.id);
  const templates = useNotificationTemplates();
  const data = view.data;
  const contactEmail = customer.emergencyContact.email;

  return (
    <CollapsibleCard
      title="Notificações do Asaas"
      storageKey="customer-notifications"
      contentClassName="space-y-4"
    >
      <Text size="xs" tone="muted">
        SMS, WhatsApp e ligação vão para o telefone do próprio cliente.
        {contactEmail
          ? ` O e-mail tem cópia para ${contactEmail} (contato de emergência).`
          : " Só o e-mail tem cópia: preencha o e-mail do contato de emergência no cadastro para ele receber."}
      </Text>
      {view.isPending && (
        <SkeletonRegion label="Carregando notificações…">
          <AsaasNotificationMatrixSkeleton />
        </SkeletonRegion>
      )}
      {view.isError && <QueryError error={view.error} onRetry={() => view.refetch()} />}
      {data && !data.linked && (
        <Text tone="muted">
          Cliente ainda não vinculado ao Asaas: as notificações aparecem aqui depois do vínculo.
        </Text>
      )}
      {data?.linked && data.error && (
        <Alert
          variant="warning"
          className="flex flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center"
        >
          <Text size={null} className="flex-1">
            O Asaas não respondeu agora: {data.error}
          </Text>
          <Button size="sm" variant="outline" onClick={() => view.refetch()} disabled={view.isFetching}>
            <RefreshCw />
            Tentar de novo
          </Button>
        </Alert>
      )}
      {data?.linked && !data.error && (
        <>
          {/* Already on the rental template: nothing to offer. */}
          {!data.matchesSuggested && (
            <ApplyTemplate customerId={customer.id} suggested={data.suggestedPeriod} />
          )}
          {data.slots && Object.keys(data.slots).length > 0 ? (
            <SlotsForm
              key={JSON.stringify(data.slots)}
              customerId={customer.id}
              slots={data.slots}
              offsets={templates.data?.offsets ?? {}}
            />
          ) : (
            <Text tone="muted">O Asaas não tem notificações para este cliente.</Text>
          )}
        </>
      )}
    </CollapsibleCard>
  );
}

function ApplyTemplate({
  customerId,
  suggested,
}: {
  customerId: string;
  suggested: TemplatePeriod | null;
}) {
  const apply = useApplyNotificationTemplate(customerId);
  const [open, setOpen] = useState(false);
  if (!suggested) {
    return (
      <Text size="sm" tone="muted">
        Sem locação em andamento: o modelo é escolhido quando houver uma.
      </Text>
    );
  }
  const name = TEMPLATE_PERIOD_LABEL[suggested].toLowerCase();
  return (
    <Box className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
      <Text size="sm">
        Modelo da locação: <Text inline weight="medium">{TEMPLATE_PERIOD_LABEL[suggested]}</Text>
      </Text>
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => !apply.isPending && setOpen(next)}
        trigger={
          <Button size="sm" variant="outline">
            <Wand2 />
            Aplicar modelo {name}
          </Button>
        }
        title={`Aplicar o modelo ${name}?`}
        description="As notificações deste cliente no Asaas passam a ser as do modelo. O que foi mudado à mão aqui é substituído."
        confirmLabel="Aplicar"
        isPending={apply.isPending}
        onConfirm={() =>
          apply.mutate(suggested, {
            onSuccess: () => setOpen(false),
          })
        }
      />
      {apply.isError && <Alert className="w-full">{errorMessage(apply.error)}</Alert>}
    </Box>
  );
}

function SlotsForm({
  customerId,
  slots,
  offsets,
}: {
  customerId: string;
  slots: Partial<NotificationSlots>;
  offsets: Partial<Record<NotificationSlot, number[]>>;
}) {
  const save = useSaveCustomerNotificationSlots(customerId);
  const [value, setValue] = useState(slots);
  const dirty = JSON.stringify(value) !== JSON.stringify(slots);

  return (
    <Box className="space-y-4">
      <AsaasNotificationMatrix
        value={value}
        onChange={(next) => {
          save.reset();
          setValue(next);
        }}
        offsets={offsets}
        disabled={save.isPending}
      />
      {save.isError && <Alert>{errorMessage(save.error)}</Alert>}
      <Box className="flex flex-wrap items-center justify-end gap-3">
        {dirty && (
          <Text size="xs" tone="muted">
            Alterações não salvas.
          </Text>
        )}
        {dirty && (
          <Button variant="ghost" onClick={() => setValue(slots)} disabled={save.isPending}>
            Descartar
          </Button>
        )}
        <Button onClick={() => save.mutate(value)} disabled={!dirty || save.isPending}>
          {save.isPending && <Spinner className="text-primary-foreground" />}
          Salvar no Asaas
        </Button>
      </Box>
    </Box>
  );
}

export function CustomerNotificationsCardSkeleton() {
  return <AsaasNotificationMatrixSkeleton />;
}
