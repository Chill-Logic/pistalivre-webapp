import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { useSaveNotificationSettings } from "@/hooks/api/gestao/notifications/useNotifications";
import type { MyNotificationSettings, NotificationGroup } from "@/types/notification";

const GROUPS: NotificationGroup[] = ["Dinheiro", "Operação", "Comercial", "Resumo"];

/**
 * What the person WANTS: each notice on/off and, if on, also by push. Only
 * among what the admin allowed for their group (the rest shows, locked).
 * Saves on each click.
 */
export function NotificationPreferencesCard({ settings }: { settings: MyNotificationSettings }) {
  const save = useSaveNotificationSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">O que você quer receber</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {GROUPS.map((group) => {
          const types = settings.types.filter((t) => t.group === group);
          if (types.length === 0) return null;
          return (
            <Box key={group} className="space-y-3">
              <Text size="xs" weight="semibold" tone="muted">
                {group}
              </Text>
              <Box className="divide-y rounded-lg border">
                {types.map((t) => (
                  <Box key={t.type} className="space-y-2 p-3">
                    <CheckboxField
                      label={t.title}
                      hint={
                        t.allowed
                          ? t.type === "daily.digest"
                            ? `${t.description} Hoje sai às ${settings.digestHour}h.`
                            : t.description
                          : "O administrador não liberou este aviso para o seu grupo."
                      }
                      checked={t.allowed && t.enabled}
                      disabled={!t.allowed || save.isPending}
                      onChange={(enabled) => save.mutate({ [t.type]: { enabled } })}
                    />
                    {t.allowed && t.enabled && (
                      <Box className="pl-7">
                        <CheckboxField
                          label="Também por push"
                          checked={t.push}
                          disabled={save.isPending}
                          onChange={(push) => save.mutate({ [t.type]: { push } })}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function NotificationPreferencesCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-48 text-base" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <Box key={index} className="space-y-1.5 rounded-lg border p-3">
            <Skeleton shape="text" className="w-40 text-sm" />
            <Skeleton shape="text" className="w-64 text-xs" />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
