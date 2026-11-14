import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { SelectField } from "@/components/molecules/select-field";
import {
  useNotificationAdmin,
  useSaveDigestHour,
  useSaveRoleNotifications,
} from "@/hooks/api/gestao/notifications/useNotifications";

const ROLES = [
  { role: "ADMIN", label: "Administradores" },
  { role: "AGENT", label: "Agentes" },
];

const HOURS = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour),
  label: `${String(hour).padStart(2, "0")}h`,
}));

/**
 * The admin's layer: which notices each group MAY receive (each person then
 * picks among them) and the hour of the daily digest. Saves on each click.
 */
export function NotificationAdminCard() {
  const overview = useNotificationAdmin(true);
  const saveRole = useSaveRoleNotifications();
  const saveHour = useSaveDigestHour();

  if (overview.isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton shape="text" className="w-40 text-base" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton shape="text" className="w-full text-sm" />
          <Skeleton shape="text" className="w-3/4 text-sm" />
        </CardContent>
      </Card>
    );
  }
  if (!overview.data) return null;
  const { types, roles, digestHour } = overview.data;

  const toggle = (role: string, type: string, on: boolean) => {
    const current = new Set(roles[role] ?? []);
    if (on) current.add(type);
    else current.delete(type);
    saveRole.mutate({ role, types: [...current] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Por grupo (administrador)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Text tone="muted">
          Escolha o que cada grupo pode receber. Dentro disso, cada pessoa decide o que quer nas próprias
          preferências.
        </Text>
        {ROLES.map(({ role, label }) => (
          <Box key={role} className="space-y-2">
            <Text size="xs" weight="semibold" tone="muted">
              {label}
            </Text>
            <Box className="space-y-2 rounded-lg border p-3">
              {types.map((t) => (
                <CheckboxField
                  key={t.type}
                  label={t.title}
                  checked={(roles[role] ?? []).includes(t.type)}
                  disabled={saveRole.isPending}
                  onChange={(on) => toggle(role, t.type, on)}
                />
              ))}
            </Box>
          </Box>
        ))}
        <Box className="max-w-48">
          <SelectField
            label="Horário do resumo do dia"
            value={String(digestHour)}
            options={HOURS}
            disabled={saveHour.isPending}
            onChange={(value) => saveHour.mutate(Number(value))}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
