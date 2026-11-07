import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import type { CompanyIntegration } from "@/types/company";

/** Providers and whether they are set up. Credentials never reach the app. */
export function CompanyIntegrations({
  integrations,
}: {
  integrations: CompanyIntegration[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Integrações</CardTitle>
      </CardHeader>
      <CardContent>
        <List className="divide-y">
          {integrations.map((integration) => (
            <ListItem
              key={integration.provider}
              className="flex items-center justify-between gap-3 py-3"
            >
              <Text className="min-w-0 break-words">{integration.label}</Text>
              <Box className="flex shrink-0 gap-1">
                {!integration.active && (
                  <Badge variant="outline">Desligada</Badge>
                )}
                <Badge variant={integration.configured ? "success" : "warning"}>
                  {integration.configured ? "Configurada" : "Não configurada"}
                </Badge>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
