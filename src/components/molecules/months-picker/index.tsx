import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { FormField } from "@/components/molecules/form-field";

const QUICK = [3, 6, 12, 24, 36];

type MonthsPickerProps = {
  value: number;
  onChange: (months: number) => void;
};

/** Horizon in months: quick choices plus any number. */
export function MonthsPicker({ value, onChange }: MonthsPickerProps) {
  return (
    <Box className="flex flex-wrap items-end gap-3">
      <Box className="space-y-2">
        <Label>Período</Label>
        <Box className="flex flex-wrap gap-2">
          {QUICK.map((months) => (
            <Button
              key={months}
              type="button"
              size="sm"
              variant={value === months ? "default" : "outline"}
              aria-pressed={value === months}
              onClick={() => onChange(months)}
            >
              {months} meses
            </Button>
          ))}
        </Box>
      </Box>
      <Box className="w-36">
        <FormField
          label="Outro (meses)"
          inputMode="numeric"
          value={String(value)}
          onChange={(event) => {
            const months = Math.floor(Number(event.target.value));
            if (Number.isFinite(months) && months >= 1 && months <= 120) {
              onChange(months);
            }
          }}
        />
      </Box>
    </Box>
  );
}
