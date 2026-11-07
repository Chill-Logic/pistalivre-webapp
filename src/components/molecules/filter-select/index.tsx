import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import {
  ALL_SELECT_VALUE,
  fromSelectValue,
  toSelectValue,
  type SelectOption,
} from "@/helpers/select";

type FilterSelectProps = {
  label: string;
  value: string;
  allLabel: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

/** List filter: "all" + options; "" means no filter. */
export function FilterSelect({
  label,
  value,
  allLabel,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <Select
      value={toSelectValue(value)}
      onValueChange={(next) => onChange(fromSelectValue(next))}
    >
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_SELECT_VALUE}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
