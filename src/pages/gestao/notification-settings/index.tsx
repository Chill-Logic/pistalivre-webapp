import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { PageHeader } from "@/components/molecules/page-header";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { NotificationAdminCard } from "@/components/organisms/notification-admin-card";
import { NotificationDeviceCard } from "@/components/organisms/notification-device-card";
import {
  NotificationPreferencesCard,
  NotificationPreferencesCardSkeleton,
} from "@/components/organisms/notification-preferences-card";
import { QueryError } from "@/components/organisms/query-error";
import { useNotificationSettings } from "@/hooks/api/gestao/notifications/useNotifications";
import { useSession } from "@/hooks/auth/useSession";

/**
 * Configurações › Notificações: what I want to receive (each notice, push or
 * bell only), push on this device and, for the admin, what each group may
 * receive and the digest hour.
 */
export function NotificationSettingsPage() {
  const settings = useNotificationSettings();
  const { user } = useSession();
  const isAdmin = user?.kind === "user" && user.role === "ADMIN";

  return (
    <Box className="space-y-6">
      <PageHeader title="Notificações" />
      {settings.isPending && (
        <SkeletonRegion label="Carregando preferências…">
          <Row className="gap-y-6">
            <Col lg={7}>
              <NotificationPreferencesCardSkeleton />
            </Col>
          </Row>
        </SkeletonRegion>
      )}
      {settings.isError && <QueryError error={settings.error} onRetry={() => settings.refetch()} />}
      {settings.data && (
        <Row className="items-start gap-y-6">
          <Col lg={7}>
            <NotificationPreferencesCard settings={settings.data} />
          </Col>
          {/* Phone: turning push on comes first (it is the page's action). */}
          <Col lg={5} className="order-first space-y-6 lg:order-none">
            <NotificationDeviceCard
              pushPublicKey={settings.data.pushPublicKey}
              devices={settings.data.devices}
            />
            {isAdmin && <NotificationAdminCard />}
          </Col>
        </Row>
      )}
    </Box>
  );
}
