import { Check } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

/**
 * Vehicle paints, name and swatch together: tapping one sets both, so the
 * name is always written the same way (and matches the fleet's colour).
 */
export const PAINTS = [
  { hex: "#f5f5f5", name: "Branca" },
  { hex: "#111111", name: "Preta" },
  { hex: "#9ca3af", name: "Prata" },
  { hex: "#4b5563", name: "Cinza" },
  { hex: "#d81e1e", name: "Vermelha" },
  { hex: "#1d4ed8", name: "Azul" },
  { hex: "#facc15", name: "Amarela" },
  { hex: "#16a34a", name: "Verde" },
  { hex: "#ea580c", name: "Laranja" },
  { hex: "#78350f", name: "Marrom" },
] as const;

export type Paint = (typeof PAINTS)[number];

const LIGHT = new Set(["#f5f5f5", "#facc15", "#9ca3af"]);

type SwatchPickerProps = {
  label: string;
  /** The chosen paint's name, or "". */
  value: string;
  onChange: (paint: Paint) => void;
  /** Names already taken (shown, not choosable). */
  taken?: string[];
  error?: string;
  disabled?: boolean;
};

/** Pick a paint by its swatch (no typing: no misspelt colour). */
export function SwatchPicker({ label, value, onChange, taken = [], error, disabled }: SwatchPickerProps) {
  const isTaken = (name: string) => taken.some((t) => t.toLowerCase() === name.toLowerCase());
  return (
    <Box className="space-y-2">
      <Label>{label}</Label>
      <Box className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {PAINTS.map((paint) => {
          const active = value === paint.name;
          const used = isTaken(paint.name);
          return (
            <Button
              key={paint.name}
              type="button"
              size="icon"
              variant="outline"
              role="radio"
              aria-checked={active}
              aria-label={used ? `${paint.name} (já cadastrada)` : paint.name}
              title={used ? `${paint.name} (já cadastrada)` : paint.name}
              disabled={disabled || used}
              onClick={() => onChange(paint)}
              style={{ backgroundColor: paint.hex }}
              className={cn(
                "size-8 rounded-full hover:opacity-90 disabled:opacity-30",
                active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              {active && (
                <Check className={cn("size-4", LIGHT.has(paint.hex) ? "text-black" : "text-white")} />
              )}
            </Button>
          );
        })}
      </Box>
      <Text size="xs" tone={error ? "destructive" : "muted"}>
        {error ?? (value || "Toque na cor")}
      </Text>
    </Box>
  );
}
