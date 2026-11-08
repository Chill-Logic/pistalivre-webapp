import { Plug } from "lucide-react";
import type { ReactNode } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { INTEGRATION_TEST_HINTS } from "@/constants/company";
import { errorMessage } from "@/helpers/api-error";
import { useTestIntegration } from "@/hooks/api/gestao/company/useIntegrationMutations";

type IntegrationTestProps = {
  provider: string;
  /** Actions placed before the button, on the same row (e.g. "Editar"). */
  leading?: ReactNode;
};

/** "Testar conexão": a live round-trip with the stored keys, result in place. */
export function IntegrationTest({ provider, leading }: IntegrationTestProps) {
  const test = useTestIntegration(provider);
  const hint = INTEGRATION_TEST_HINTS[provider];

  return (
    <Box className="space-y-2">
      <Box className="flex flex-wrap items-center gap-2">
        {leading}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={test.isPending}
          onClick={() => test.mutate()}
        >
          {test.isPending ? <Spinner /> : <Plug />}
          {test.isPending ? "Testando…" : "Testar conexão"}
        </Button>
      </Box>
      {hint && (
        <Text size="xs" tone="muted">
          {hint}
        </Text>
      )}
      {test.isSuccess && (
        <Alert
          variant={test.data.ok ? "success" : "error"}
          role="status"
          className="break-words"
        >
          {test.data.message}
        </Alert>
      )}
      {test.isError && (
        <Alert className="break-words">{errorMessage(test.error)}</Alert>
      )}
    </Box>
  );
}
