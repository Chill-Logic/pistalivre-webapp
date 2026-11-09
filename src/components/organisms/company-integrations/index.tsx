import { Link } from "react-router-dom";
import { Button } from "@/components/atoms/button";
import { ROUTES } from "@/constants/routes";
import { ChartColumn, Lock } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { IntegrationFormDialog } from "@/components/organisms/integration-form-dialog";
import { IntegrationTest } from "@/components/organisms/integration-test";
import { InterWebhookPanel } from "@/components/organisms/inter-webhook-panel";
import { TESTABLE_INTEGRATIONS } from "@/constants/company";
import { integrationStatus } from "@/helpers/integration";
import type { IntegrationConfig } from "@/types/company";

type CompanyIntegrationsProps = {
  integrations: IntegrationConfig[];
  /** Admin: configure, test and register the webhook. Agent: read only. */
  canManage: boolean;
};

const isTestable = (provider: string) =>
  (TESTABLE_INTEGRATIONS as readonly string[]).includes(provider);

/** Providers' keys. Secrets never reach the app (only "is set"). */
export function CompanyIntegrations({
  integrations,
  canManage,
}: CompanyIntegrationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Integrações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!canManage && (
          <Alert variant="info" role="note" className="flex items-center gap-2">
            <Lock className="size-4 shrink-0" />
            Só administradores alteram integrações.
          </Alert>
        )}
        <List className="divide-y">
          {integrations.map((integration) => {
            const status = integrationStatus(integration);
            return (
              <ListItem
                key={integration.provider}
                className="space-y-3 py-4 first:pt-0 last:pb-0"
              >
                <Box className="flex items-start justify-between gap-3">
                  <Box className="min-w-0 space-y-1">
                    <Text weight="medium" className="break-words">
                      {integration.label}
                    </Text>
                    {integration.hint && (
                      <Text size="xs" tone="muted">
                        {integration.hint}
                      </Text>
                    )}
                  </Box>
                  <Badge variant={status.variant} className="shrink-0">
                    {status.label}
                  </Badge>
                </Box>
                {canManage && (
                  <Box className="space-y-3">
                    {isTestable(integration.provider) &&
                    integration.configured ? (
                      <IntegrationTest
                        provider={integration.provider}
                        leading={
                          <IntegrationFormDialog integration={integration} />
                        }
                      />
                    ) : (
                      <IntegrationFormDialog integration={integration} />
                    )}
                    {integration.provider === "inter" && (
                      <InterWebhookPanel configured={integration.configured} />
                    )}
                    {integration.provider === "ai" && (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={ROUTES.aiUsage}>
                          <ChartColumn />
                          Ver uso e custo
                        </Link>
                      </Button>
                    )}
                  </Box>
                )}
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}

export function CompanyIntegrationsSkeleton({
  canManage,
}: {
  canManage: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-28 text-base" />
      </CardHeader>
      <CardContent>
        <Box className="divide-y">
          {[0, 1, 2].map((index) => (
            <Box key={index} className="space-y-3 py-4 first:pt-0 last:pb-0">
              <Box className="flex items-start justify-between gap-3">
                <Box className="min-w-0 flex-1 space-y-2">
                  <Skeleton shape="text" className="w-48 text-sm" />
                  <Skeleton shape="text" className="w-full text-xs" />
                </Box>
                <Skeleton shape="pill" className="h-5 w-20" />
              </Box>
              {canManage && <Skeleton className="h-9 w-28" />}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
