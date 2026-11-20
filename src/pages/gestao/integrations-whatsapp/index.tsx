import { ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { QueryError } from "@/components/organisms/query-error";
import { WhatsAppBotAdmin, WhatsAppBotAdminSkeleton } from "@/components/organisms/whatsapp-bot-admin";
import { useWhatsAppStatus } from "@/hooks/api/gestao/whatsapp/useWhatsApp";
import { useUserPermissions } from "@/hooks/ui/useUserPermissions";

/** Integrações › WhatsApp (admin): the Livrinho's bot in the WhatsApp group. */
export function IntegrationsWhatsAppPage() {
  const { isAdmin } = useUserPermissions();
  const status = useWhatsAppStatus();
  if (!isAdmin) return <EmptyState icon={ShieldAlert} title="Só administradores" />;
  if (status.isError) return <QueryError error={status.error} onRetry={() => status.refetch()} />;
  if (!status.data) {
    return (
      <SkeletonRegion label="Carregando o WhatsApp…">
        <WhatsAppBotAdminSkeleton />
      </SkeletonRegion>
    );
  }
  return <WhatsAppBotAdmin status={status.data} />;
}
