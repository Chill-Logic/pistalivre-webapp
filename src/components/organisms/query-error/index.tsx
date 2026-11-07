import { RefreshCw } from "lucide-react";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { errorMessage } from "@/helpers/api-error";

type QueryErrorProps = {
  error: unknown;
  onRetry: () => void;
};

/** Error state for a failed query, with retry. */
export function QueryError({ error, onRetry }: QueryErrorProps) {
  return (
    <Alert className="flex flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <Text size={null} className="flex-1">
        {errorMessage(error)}
      </Text>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw />
        Tentar de novo
      </Button>
    </Alert>
  );
}
