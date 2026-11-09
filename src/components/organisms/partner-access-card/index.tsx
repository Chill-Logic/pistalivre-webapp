import { Copy, KeyRound, LockKeyhole, UserX } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
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
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { InfoItem } from "@/components/molecules/info-item";
import { PartnerAccessDialog } from "@/components/organisms/partner-access-dialog";
import { PARTNER_AREA_URL } from "@/constants/partner";
import { usePartnerAccess } from "@/hooks/api/gestao/partners/usePartnerMutations";
import { useCopy } from "@/hooks/ui/useCopy";
import type { Partner } from "@/types/partner";
import { formatDateTime } from "@/utils/format";

/** Access to app.parceiro: the address, the login, and the password. */
export function PartnerAccessCard({ partner }: { partner: Partner }) {
  const { revoke } = usePartnerAccess(partner.id);
  const copy = useCopy();

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Acesso à área do parceiro</CardTitle>
        <Badge variant={partner.hasAccess ? "success" : "outline"}>
          {partner.hasAccess ? "Liberado" : "Sem acesso"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <Box className="space-y-2">
          <Text size="xs" tone="muted">
            Endereço
          </Text>
          <Box className="flex items-center gap-1 rounded-md border bg-muted/40 py-1 pl-3 pr-1">
            {/* Without the scheme; a narrow card wraps it after "app.parceiro.". */}
            <Text mono size="xs" className="min-w-0 flex-1 break-words">
              {PARTNER_AREA_URL.replace("https://", "").replace(
                "app.parceiro.",
                "app.parceiro.\u200B",
              )}
            </Text>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Copiar endereço"
              className="shrink-0"
              onClick={() => copy(PARTNER_AREA_URL, "Endereço copiado")}
            >
              <Copy />
            </Button>
          </Box>
        </Box>
        <Row as="dl" className="gap-y-4">
          <InfoItem span={12} sm={6} lg={12} label="Login">
            <Text inline size={null} className="break-words">
              {partner.email}
            </Text>
          </InfoItem>
          <InfoItem span={12} sm={6} lg={12} label="Último acesso">
            {partner.lastLoginAt
              ? formatDateTime(partner.lastLoginAt)
              : partner.hasAccess
                ? "Ainda não entrou"
                : "—"}
          </InfoItem>
        </Row>
        {!partner.active && partner.hasAccess && (
          <Text size="xs" tone="muted">
            O parceiro está inativo: mesmo com senha, ele não consegue entrar.
          </Text>
        )}
        <Box className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <PartnerAccessDialog
            partnerId={partner.id}
            email={partner.email}
            hasAccess={partner.hasAccess}
            trigger={
              <Button
                variant={partner.hasAccess ? "outline" : "default"}
                size="sm"
              >
                {partner.hasAccess ? <KeyRound /> : <LockKeyhole />}
                {partner.hasAccess ? "Redefinir senha" : "Dar acesso"}
              </Button>
            }
          />
          {partner.hasAccess && (
            <ConfirmDialog
              destructive
              trigger={
                <Button variant="ghost" size="sm" className="text-destructive">
                  <UserX />
                  Remover acesso
                </Button>
              }
              title="Remover o acesso?"
              description={`${partner.name} deixa de entrar na área do parceiro e quem estiver conectado sai na hora. Dá para liberar de novo depois.`}
              confirmLabel="Remover acesso"
              isPending={revoke.isPending}
              onConfirm={() => revoke.mutate()}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export function PartnerAccessCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-48 text-base" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-11" />
        <Row className="gap-y-4">
          {[0, 1].map((index) => (
            <Col key={index} span={12} sm={6} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-32 text-sm" />
            </Col>
          ))}
        </Row>
        <Skeleton className="h-11 w-36 md:h-8" />
      </CardContent>
    </Card>
  );
}
