import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { OrderedList, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { CopyCode } from "@/components/molecules/copy-code";
import { AI_PROVIDERS, type AiProviderKey } from "@/constants/integrations";

/**
 * "Conecte a sua IA": pick the provider, then a step-by-step for each way of
 * using it (terminal, desktop/web, API), with the address to paste.
 */
export function AiProviderGuide({ mcpUrl }: { mcpUrl: string }) {
  const [provider, setProvider] = useState<AiProviderKey>("claude");
  const current = AI_PROVIDERS.find((p) => p.key === provider) ?? AI_PROVIDERS[0];

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-base">Conecte a sua IA ao sistema</CardTitle>
        <Text size="sm" tone="muted">
          A sua IA passa a consultar o sistema em seu nome, só com as ferramentas que você tem. Ela roda na sua conta
          do provedor: não usa a chave de IA da empresa.
        </Text>
        <Box className="flex flex-wrap gap-2" role="group" aria-label="Provedor">
          {AI_PROVIDERS.map((p) => (
            <Button
              key={p.key}
              type="button"
              size="sm"
              variant={p.key === provider ? "default" : "outline"}
              aria-pressed={p.key === provider}
              onClick={() => setProvider(p.key)}
            >
              {p.name}
            </Button>
          ))}
        </Box>
      </CardHeader>
      <CardContent className="space-y-6">
        <Box className="space-y-2">
          <Text size="sm" weight="medium">
            Endereço do servidor MCP
          </Text>
          <CopyCode code={mcpUrl} copied="Endereço copiado" />
        </Box>
        {current.guides.map((guide) => (
          <Box key={guide.title} className="space-y-2 border-t pt-4">
            <Text weight="semibold">{guide.title}</Text>
            <OrderedList className="list-decimal space-y-1 pl-5">
              {guide.steps.map((step) => (
                <ListItem key={step}>
                  <Text size="sm">{step}</Text>
                </ListItem>
              ))}
            </OrderedList>
            {guide.code && <CopyCode code={guide.code.split("{url}").join(mcpUrl)} />}
          </Box>
        ))}
        <Text size="xs" tone="muted">
          Os menus de cada aplicativo podem mudar de nome; o essencial é o endereço acima. Na primeira conexão, a tela
          do sistema pede o seu login e mostra o que o aplicativo vai poder usar. Tudo o que a IA faz fica registrado.
        </Text>
      </CardContent>
    </Card>
  );
}
