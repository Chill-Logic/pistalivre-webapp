import { RefreshCw } from "lucide-react";
import { useId, useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { CollapsibleCard } from "@/components/molecules/collapsible-card";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import {
  ASAAS_NOTIFICATION_CHANNELS,
  ASAAS_SCHEDULE_MAX_DAYS,
  ASAAS_SCHEDULED_EVENTS,
} from "@/constants/asaas-notifications";
import { LABEL_MAPS } from "@/constants/label-maps";
import { moneyErrorMessage } from "@/helpers/money-errors";
import {
  useCustomerNotifications,
  useSaveCustomerNotifications,
} from "@/hooks/api/gestao/customers/useCustomerNotifications";
import { useLabels } from "@/hooks/ui/useLabels";
import type { CustomerDetail } from "@/types/customer";
import type { AsaasNotification } from "@/types/customer-settings";

/**
 * What Asaas warns this customer about, and through which channels. It is
 * read-through: the setting lives at Asaas, here it is read and rewritten.
 * Ticking a box does not save; only "Salvar" sends (a wrong click on a
 * billing screen must not become a change at the provider).
 */
export function CustomerNotificationsCard({
  customer,
}: {
  customer: Pick<CustomerDetail, "id" | "emergencyContact">;
}) {
  const notifications = useCustomerNotifications(customer.id);
  const view = notifications.data;
  const contactEmail = customer.emergencyContact.email;

  return (
    <CollapsibleCard
      title="Notificações do Asaas"
      storageKey="customer-notifications"
      contentClassName="space-y-4"
    >
      <Text size="xs" tone="muted">
        SMS, WhatsApp e ligação vão sempre para o telefone do próprio cliente.
        {contactEmail
          ? ` Só o e-mail tem cópia, para ${contactEmail} (contato de emergência).`
          : " Só o e-mail tem cópia: preencha o e-mail do contato de emergência no cadastro para que ele receba."}
      </Text>
      {notifications.isPending && (
        <SkeletonRegion label="Carregando notificações…">
          <NotificationRows />
        </SkeletonRegion>
      )}
      {notifications.isError && (
        <QueryError
          error={notifications.error}
          onRetry={() => notifications.refetch()}
        />
      )}
      {view && !view.linked && (
        <Text tone="muted">
          Cliente ainda não vinculado ao Asaas: as notificações aparecem aqui
          depois do vínculo.
        </Text>
      )}
      {view?.linked && view.error && (
        <Alert
          variant="warning"
          className="flex flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center"
        >
          <Text size={null} className="flex-1">
            O Asaas não respondeu agora: {view.error}
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => notifications.refetch()}
            disabled={notifications.isFetching}
          >
            <RefreshCw />
            Tentar de novo
          </Button>
        </Alert>
      )}
      {view?.linked && !view.error && view.items.length === 0 && (
        <Text tone="muted">
          O Asaas não tem notificações para este cliente.
        </Text>
      )}
      {view?.linked && !view.error && view.items.length > 0 && (
        // Remounts with the answer of a save, which becomes the new "clean".
        <NotificationsForm
          key={JSON.stringify(view.items)}
          customerId={customer.id}
          notifications={view.items}
        />
      )}
    </CollapsibleCard>
  );
}

function NotificationsForm({
  customerId,
  notifications,
}: {
  customerId: string;
  notifications: AsaasNotification[];
}) {
  const save = useSaveCustomerNotifications(customerId);
  const [rows, setRows] = useState(notifications);
  const dirty = JSON.stringify(rows) !== JSON.stringify(notifications);

  const patch = (id: string, changes: Partial<AsaasNotification>) => {
    save.reset();
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    );
  };

  return (
    <Box className="space-y-4">
      <List className="divide-y rounded-lg border">
        {rows.map((row) => (
          <NotificationRow key={row.id} row={row} onChange={patch} />
        ))}
      </List>
      {save.isError && <Alert>{moneyErrorMessage(save.error)}</Alert>}
      <Box className="flex flex-wrap items-center justify-end gap-3">
        {dirty && (
          <Text size="xs" tone="muted">
            Alterações não salvas.
          </Text>
        )}
        {dirty && (
          <Button
            variant="ghost"
            onClick={() => setRows(notifications)}
            disabled={save.isPending}
          >
            Descartar
          </Button>
        )}
        <Button
          onClick={() => save.mutate(rows)}
          disabled={!dirty || save.isPending}
        >
          {save.isPending && <Spinner className="text-primary-foreground" />}
          Salvar
        </Button>
      </Box>
    </Box>
  );
}

function NotificationRow({
  row,
  onChange,
}: {
  row: AsaasNotification;
  onChange: (id: string, changes: Partial<AsaasNotification>) => void;
}) {
  const { label } = useLabels();
  const offsetId = useId();
  const scheduleUnit = ASAAS_SCHEDULED_EVENTS[row.event];
  const eventLabel = label(LABEL_MAPS.asaasNotificationEvent, row.event);
  const schedule = scheduleUnit
    ? row.scheduleOffset === 0
      ? " · no dia"
      : ` · ${row.scheduleOffset} ${scheduleUnit}`
    : "";

  return (
    <ListItem className="space-y-3 p-3">
      <Box className="flex flex-wrap items-center justify-between gap-3">
        <CheckboxField
          label={`${eventLabel}${schedule}`}
          checked={row.enabled}
          onChange={(enabled) => onChange(row.id, { enabled })}
        />
        {scheduleUnit && (
          <Box className="flex items-center gap-2">
            <Input
              id={offsetId}
              type="number"
              inputMode="numeric"
              min={0}
              max={ASAAS_SCHEDULE_MAX_DAYS}
              value={String(row.scheduleOffset)}
              onChange={(event) =>
                onChange(row.id, {
                  scheduleOffset: Math.min(
                    ASAAS_SCHEDULE_MAX_DAYS,
                    Math.max(0, Math.trunc(Number(event.target.value)) || 0),
                  ),
                })
              }
              disabled={!row.enabled}
              className="w-20"
            />
            <Label htmlFor={offsetId} className="text-xs text-muted-foreground">
              {scheduleUnit}
            </Label>
          </Box>
        )}
      </Box>
      <Box className="flex flex-wrap gap-x-5 gap-y-3 pl-7">
        {ASAAS_NOTIFICATION_CHANNELS.map((channel) => (
          <CheckboxField
            key={channel.key}
            label={channel.label}
            checked={row[channel.key]}
            onChange={(checked) => onChange(row.id, { [channel.key]: checked })}
            disabled={!row.enabled}
          />
        ))}
      </Box>
    </ListItem>
  );
}

function NotificationRows() {
  return (
    <Box className="divide-y rounded-lg border">
      {[0, 1, 2].map((index) => (
        <Box key={index} className="space-y-3 p-3">
          <Box className="flex items-center gap-3">
            <Skeleton className="size-4 shrink-0" />
            <Skeleton shape="text" className="w-44 text-sm" />
          </Box>
          <Box className="flex flex-wrap gap-5 pl-7">
            {[0, 1, 2, 3].map((channel) => (
              <Skeleton key={channel} shape="text" className="w-16 text-sm" />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function CustomerNotificationsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-44 text-base" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton shape="text" className="w-full text-xs" />
        <NotificationRows />
      </CardContent>
    </Card>
  );
}
