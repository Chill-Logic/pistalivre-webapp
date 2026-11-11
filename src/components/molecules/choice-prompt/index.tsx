import { Check } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

export type ChoiceOption = {
  label: string;
  /** A line under the label (what happens). */
  hint?: string;
  onSelect: () => void;
  /** The suggested answer: highlighted (only one). */
  primary?: boolean;
  pending?: boolean;
  disabled?: boolean;
};

type ChoicePromptProps = {
  icon: ReactNode;
  /** The question, in words the person answers ("Quer ver de onde tirei isso?"). */
  title: string;
  subtitle?: ReactNode;
  /** What it is about (details), above the question. */
  children?: ReactNode;
  question?: string;
  options: ChoiceOption[];
  /** Once answered: only this line stays ("Você preferiu preencher na tela"). */
  answered?: ReactNode;
  /** Take the keyboard when it appears (1, 2, 3… answer). */
  autoFocus?: boolean;
  error?: ReactNode;
};

/**
 * A decision the assistant asks the person to make, impossible to miss: a
 * card of its own with the question and numbered options (1, 2, 3 on the
 * keyboard), the suggested one highlighted — like a permission prompt. Once
 * answered it shrinks to the choice made.
 */
export function ChoicePrompt({
  icon,
  title,
  subtitle,
  children,
  question,
  options,
  answered,
  autoFocus,
  error,
}: ChoicePromptProps) {
  const ref = useRef<HTMLDivElement>(null);
  const busy = options.some((option) => option.pending);

  useEffect(() => {
    if (autoFocus && !answered) ref.current?.focus({ preventScroll: true });
  }, [autoFocus, answered]);

  if (answered) {
    return (
      <Box className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2">
        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
        <Box className="min-w-0 space-y-0.5">
          <Text size="sm" weight="medium">
            {title}
          </Text>
          <Text size="xs" tone="muted">
            {answered}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-label={title}
      onKeyDown={(event) => {
        const index = Number(event.key) - 1;
        const option = options[index];
        if (!option || busy || option.disabled) return;
        event.preventDefault();
        option.onSelect();
      }}
      className="space-y-3 rounded-xl border-2 border-primary/60 bg-primary/5 p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Box className="flex items-start gap-2">
        <Box className="mt-0.5 shrink-0 text-primary">{icon}</Box>
        <Box className="min-w-0 space-y-0.5">
          <Text weight="semibold">{title}</Text>
          {subtitle && (
            <Text size="sm" tone="muted">
              {subtitle}
            </Text>
          )}
        </Box>
      </Box>
      {children}
      {question && (
        <Text size="sm" weight="medium">
          {question}
        </Text>
      )}
      <Box className="space-y-2">
        {options.map((option, index) => (
          <Button
            key={option.label}
            type="button"
            variant={option.primary ? "default" : "outline"}
            onClick={option.onSelect}
            disabled={busy || option.disabled}
            className={cn(
              "h-auto min-h-11 w-full items-start justify-start gap-3 whitespace-normal py-2 text-left md:h-auto md:min-h-9",
            )}
          >
            <Box
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
                option.primary
                  ? "border-primary-foreground/50"
                  : "border-border",
              )}
              aria-hidden
            >
              {option.pending ? <Spinner className="size-3" /> : index + 1}
            </Box>
            <Box className="min-w-0">
              <Text inline size="sm" weight="medium" className="block">
                {option.label}
              </Text>
              {option.hint && (
                <Text
                  inline
                  size="xs"
                  className={cn(
                    "block",
                    option.primary
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {option.hint}
                </Text>
              )}
            </Box>
          </Button>
        ))}
      </Box>
      {error}
    </Box>
  );
}
