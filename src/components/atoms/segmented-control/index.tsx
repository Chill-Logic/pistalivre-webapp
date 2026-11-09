import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export type SegmentedControlOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  /** Shown but not choosable (aria-disabled, out of the Tab/arrow order). */
  disabled?: boolean;
};

type SegmentedControlProps<T extends string> = {
  value: T | "";
  onValueChange: (value: T) => void;
  /** Few, short options (2–3): all visible side by side, equal widths. */
  options: SegmentedControlOption<T>[];
  /** `default` = the height of an input; `sm` = toolbar size. */
  size?: "default" | "sm";
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
const PREV_KEYS = ["ArrowLeft", "ArrowUp"];

/**
 * Segmented control (CPF | CNPJ): a recessed track with a raised thumb that
 * slides to the chosen segment. Semantically a radio group: one Tab stop,
 * arrows/Home/End move and choose, like the platform's own control. Colours
 * come from the `--segment-*` tokens so it reads in light AND dark (the dark
 * track sits below the card, the thumb above it).
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  size = "default",
  disabled = false,
  invalid = false,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = options.findIndex((option) => option.value === value);
  const count = Math.max(options.length, 1);

  const enabled = options
    .map((option, at) => (option.disabled ? -1 : at))
    .filter((at) => at >= 0);
  // The Tab stop: the chosen segment, or the first one that can be chosen.
  const tabStop =
    index >= 0 && !options[index]?.disabled ? index : (enabled[0] ?? -1);

  const choose = (next: number) => {
    const option = options[next];
    if (!option || disabled || option.disabled) return;
    if (option.value !== value) onValueChange(option.value);
  };

  /** The next choosable segment from `at`, going `step` (wraps around). */
  const nextEnabled = (at: number, step: 1 | -1) => {
    const total = options.length;
    for (let offset = 1; offset <= total; offset += 1) {
      const candidate = (at + step * offset + total) % total;
      if (!options[candidate]?.disabled) return candidate;
    }
    return null;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, at: number) => {
    let next: number | null = null;
    if (NEXT_KEYS.includes(event.key)) next = nextEnabled(at, 1);
    else if (PREV_KEYS.includes(event.key)) next = nextEnabled(at, -1);
    else if (event.key === "Home") next = enabled[0] ?? null;
    else if (event.key === "End") next = enabled[enabled.length - 1] ?? null;
    if (next === null) return;
    event.preventDefault();
    // Keyboard: focus follows the choice (a click already focuses).
    refs.current[next]?.focus();
    choose(next);
  };

  return (
    <div
      role="radiogroup"
      aria-disabled={disabled || undefined}
      aria-invalid={invalid || undefined}
      {...aria}
      className={cn(
        "relative flex w-full select-none rounded-lg bg-[hsl(var(--segment-track))] p-1 shadow-[inset_0_1px_2px_hsl(var(--segment-inset))] transition-shadow",
        size === "default" ? "h-11 md:h-9" : "h-9 md:h-8",
        invalid && "ring-1 ring-destructive",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {index >= 0 && (
        <div
          aria-hidden
          className="absolute inset-y-1 left-1 rounded-md border border-[hsl(var(--segment-thumb-border))] bg-[hsl(var(--segment-thumb))] shadow-[0_1px_2px_rgb(0_0_0/0.08),0_1px_3px_rgb(0_0_0/0.06)] transition-transform duration-200 ease-out motion-reduce:transition-none"
          style={{
            width: `calc((100% - 0.5rem) / ${count})`,
            transform: `translateX(${index * 100}%)`,
          }}
        />
      )}
      {options.map((option, at) => {
        const checked = at === index;
        const off = disabled || Boolean(option.disabled);
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[at] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            // One Tab stop: the chosen segment (or the first, when none is).
            tabIndex={at === tabStop && !off ? 0 : -1}
            aria-disabled={option.disabled || undefined}
            disabled={off}
            onClick={() => choose(at)}
            onKeyDown={(event) => onKeyDown(event, at)}
            title={typeof option.label === "string" ? option.label : undefined}
            className={cn(
              "relative z-10 inline-flex min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 truncate rounded-md px-3 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed [&_svg]:size-4 [&_svg]:shrink-0",
              size === "default" ? "text-sm" : "text-xs",
              checked
                ? "text-foreground"
                : option.disabled
                  ? "text-muted-foreground/45"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            {/* A text label gets a block of its own for the ellipsis: on the
                centred flex button, a long one spilled out on both sides. */}
            {typeof option.label === "string" ? (
              <span className="block min-w-0 truncate">{option.label}</span>
            ) : (
              option.label
            )}
          </button>
        );
      })}
    </div>
  );
}
