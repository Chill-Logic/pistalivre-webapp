import { Check } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { FormField } from "@/components/molecules/form-field";
import { cn } from "@/utils/cn";

/** Common vehicle paints, as a starting point (any #rrggbb is accepted). */
const PRESETS = [
  { hex: "#f5f5f5", name: "Branco" },
  { hex: "#111111", name: "Preto" },
  { hex: "#9ca3af", name: "Prata" },
  { hex: "#4b5563", name: "Cinza" },
  { hex: "#d81e1e", name: "Vermelho" },
  { hex: "#1d4ed8", name: "Azul" },
  { hex: "#facc15", name: "Amarelo" },
  { hex: "#16a34a", name: "Verde" },
  { hex: "#ea580c", name: "Laranja" },
  { hex: "#78350f", name: "Marrom" },
];

type SwatchPickerProps = {
  label: string;
  /** #rrggbb or "". */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

/** The colour of a swatch: a palette to tap, or the hex code typed. */
export function SwatchPicker({ label, value, onChange, error, disabled }: SwatchPickerProps) {
  return (
    <Box className="space-y-2">
      <Label>{label}</Label>
      <Box className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {PRESETS.map((preset) => {
          const active = value.toLowerCase() === preset.hex;
          return (
            <Button
              key={preset.hex}
              type="button"
              size="icon"
              variant="outline"
              role="radio"
              aria-checked={active}
              aria-label={preset.name}
              title={preset.name}
              disabled={disabled}
              onClick={() => onChange(preset.hex)}
              style={{ backgroundColor: preset.hex }}
              className={cn(
                "size-8 rounded-full hover:opacity-90",
                active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              {active && (
                <Check
                  className={cn("size-4", ["#f5f5f5", "#facc15", "#9ca3af"].includes(preset.hex) ? "text-black" : "text-white")}
                />
              )}
            </Button>
          );
        })}
      </Box>
      <FormField
        label="Código da cor (opcional)"
        placeholder="#d81e1e"
        maxLength={7}
        value={value}
        onChange={(event) => onChange(event.target.value.trim())}
        error={error}
        disabled={disabled}
      />
    </Box>
  );
}
