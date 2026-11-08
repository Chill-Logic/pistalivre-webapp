import { Sparkles } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { TextareaField } from "@/components/molecules/textarea-field";

type AiPersonalizeBoxProps = {
  label: string;
  placeholder: string;
  hint: string;
  instructions: string;
  onInstructionsChange: (value: string) => void;
  onRun: () => void;
  isPending: boolean;
  /** Another write is running (the button waits). */
  disabled?: boolean;
  error?: string;
};

/**
 * "Personalizar com IA": the agreements in free text; the AI rewrites the
 * text below it, which the operator reviews before saving. Show it only
 * when the server says the AI exists (`GET /contracts/options`).
 */
export function AiPersonalizeBox({
  label,
  placeholder,
  hint,
  instructions,
  onInstructionsChange,
  onRun,
  isPending,
  disabled = false,
  error,
}: AiPersonalizeBoxProps) {
  return (
    <Box className="space-y-3 rounded-md border border-primary/30 bg-primary/5 p-4">
      <Text weight="medium" className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden />
        Personalizar com IA
      </Text>
      <TextareaField
        label={label}
        placeholder={placeholder}
        value={instructions}
        onChange={(event) => onInstructionsChange(event.target.value)}
        error={error}
      />
      <Text size="xs" tone="muted">
        {hint}
      </Text>
      <Box className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRun}
          disabled={disabled || isPending || !instructions.trim()}
        >
          {isPending && <Spinner />}
          Personalizar com IA
        </Button>
      </Box>
    </Box>
  );
}
