import { Box } from "@/components/atoms/box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { NOTIFICATION_SLOT_GROUPS } from "@/constants/asaas-notifications";
import type {
  NotificationSlot,
  NotificationSlots,
  SlotConfig,
} from "@/types/asaas-notification-template";

type AsaasNotificationMatrixProps = {
  value: Partial<NotificationSlots>;
  onChange: (next: Partial<NotificationSlots>) => void;
  /** Days Asaas offers per block. */
  offsets: Partial<Record<NotificationSlot, number[]>>;
  disabled?: boolean;
};

const DEFAULT_OFFSETS: Partial<Record<NotificationSlot, number[]>> = {
  DUE_BEFORE: [5, 10, 15, 30],
  OVERDUE_REPEAT: [1, 3, 7, 15, 30],
};

const dayLabel = (n: number) => (n === 1 ? "1 dia" : `${n} dias`);

/**
 * The Asaas notification screen as the operation reads it (same blocks and
 * order as Asaas): before the due date, overdue, paid — each with "Para mim"
 * (the company) and "Para o cliente". Used by the templates (Configurações ›
 * Avisos do Asaas) and by the customer's own setting. A block Asaas does not
 * have for this customer is left out.
 */
export function AsaasNotificationMatrix({
  value,
  onChange,
  offsets,
  disabled = false,
}: AsaasNotificationMatrixProps) {
  const patch = (slot: NotificationSlot, changes: Partial<SlotConfig>) => {
    const current = value[slot];
    if (!current) return;
    onChange({ ...value, [slot]: { ...current, ...changes } });
  };

  return (
    <Box className="space-y-6">
      {NOTIFICATION_SLOT_GROUPS.map((group) => {
        const rows = group.slots.filter((row) => value[row.slot]);
        if (!rows.length) return null;
        return (
          <Box key={group.title} className="space-y-2">
            <Text
              size="xs"
              weight="semibold"
              tone="muted"
              className="uppercase tracking-wide"
            >
              {group.title}
            </Text>
            <Box className="divide-y rounded-lg border">
              {rows.map((row) => {
                const config = value[row.slot] as SlotConfig;
                const choices =
                  offsets[row.slot] ?? DEFAULT_OFFSETS[row.slot] ?? [];
                const phone =
                  row.slot === "OVERDUE" || row.slot === "OVERDUE_REPEAT";
                const whatsapp = row.slot !== "LINHA";
                return (
                  <Box
                    key={row.slot}
                    className="flex flex-col gap-3 px-3 py-3 md:flex-row md:items-start md:gap-6"
                  >
                    <Box className="min-w-0 flex-1 space-y-1">
                      {row.offset ? (
                        <Box className="flex flex-wrap items-center gap-2">
                          <Text weight="medium">{row.offset.before}</Text>
                          <Select
                            value={String(config.offset)}
                            onValueChange={(v) =>
                              patch(row.slot, { offset: Number(v) })
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger
                              className="h-8 w-24"
                              aria-label="Dias"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {choices.map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {dayLabel(n)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {row.offset.after && (
                            <Text weight="medium">{row.offset.after}</Text>
                          )}
                        </Box>
                      ) : (
                        <Text weight="medium">{row.title}</Text>
                      )}
                      <Text size="xs" tone="muted">
                        {row.hint}
                      </Text>
                    </Box>
                    <Box className="flex gap-8 md:gap-6">
                      <Box className="w-24 space-y-1.5">
                        <Text size="xs" tone="muted">
                          Para mim
                        </Text>
                        <CheckboxField
                          label="E-mail"
                          checked={config.providerEmail}
                          onChange={(v) =>
                            patch(row.slot, { providerEmail: v })
                          }
                          disabled={disabled}
                        />
                        <CheckboxField
                          label="SMS"
                          checked={config.providerSms}
                          onChange={(v) => patch(row.slot, { providerSms: v })}
                          disabled={disabled}
                        />
                      </Box>
                      <Box className="w-32 space-y-1.5">
                        <Text size="xs" tone="muted">
                          Para o cliente
                        </Text>
                        {whatsapp && (
                          <CheckboxField
                            label="WhatsApp"
                            checked={config.customerWhatsapp}
                            onChange={(v) =>
                              patch(row.slot, { customerWhatsapp: v })
                            }
                            disabled={disabled}
                          />
                        )}
                        <CheckboxField
                          label="E-mail"
                          checked={config.customerEmail}
                          onChange={(v) =>
                            patch(row.slot, { customerEmail: v })
                          }
                          disabled={disabled}
                        />
                        <CheckboxField
                          label="SMS"
                          checked={config.customerSms}
                          onChange={(v) => patch(row.slot, { customerSms: v })}
                          disabled={disabled}
                        />
                        {phone && (
                          <CheckboxField
                            label="Ligação"
                            checked={config.customerPhoneCall}
                            onChange={(v) =>
                              patch(row.slot, { customerPhoneCall: v })
                            }
                            disabled={disabled}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export function AsaasNotificationMatrixSkeleton() {
  return (
    <Box className="space-y-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </Box>
  );
}
