import type { KeyboardEvent, MouseEvent } from "react";
import { cn } from "@/utils/cn";

type SeekBarProps = {
  /** Played share, 0 to 1. */
  value: number;
  /** A click or an arrow key: the share to jump to. */
  onSeek: (ratio: number) => void;
  label: string;
  /** Read aloud, e.g. "0:12 de 1:03". */
  valueText: string;
  disabled?: boolean;
  className?: string;
};

/** Progress of a playback that can be clicked or arrowed to jump (a slider). */
export function SeekBar({
  value,
  onSeek,
  label,
  valueText,
  disabled = false,
  className,
}: SeekBarProps) {
  const ratio = Math.min(Math.max(value, 0), 1);
  const click = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    onSeek((event.clientX - rect.left) / rect.width);
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const step =
      event.key === "ArrowRight" ? 0.05 : event.key === "ArrowLeft" ? -0.05 : 0;
    if (!step) return;
    event.preventDefault();
    onSeek(Math.min(Math.max(ratio + step, 0), 1));
  };
  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuetext={valueText}
      aria-disabled={disabled}
      onClick={click}
      onKeyDown={key}
      className={cn(
        "group relative flex h-6 cursor-pointer items-center focus-visible:outline-none",
        disabled && "cursor-default opacity-60",
        className,
      )}
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div
          className="h-full rounded-full bg-foreground/70"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
