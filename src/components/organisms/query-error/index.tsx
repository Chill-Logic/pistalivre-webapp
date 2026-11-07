import { RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { errorMessage } from "@/helpers/api-error";

type QueryErrorProps = {
  error: unknown;
  onRetry: () => void;
};

/** Error state for a failed query, with retry. */
export function QueryError({ error, onRetry }: QueryErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-md bg-error px-4 py-3 text-sm text-error-foreground sm:flex-row sm:items-center"
    >
      <p className="flex-1">{errorMessage(error)}</p>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw />
        Tentar de novo
      </Button>
    </div>
  );
}
