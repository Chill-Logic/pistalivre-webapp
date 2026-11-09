import { useId } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { Label } from "@/components/atoms/label";
import { SegmentedControl } from "@/components/atoms/segmented-control";
import { Text } from "@/components/atoms/text";
import type { SelectOption } from "@/helpers/select";

type SegmentedFieldProps = {
  label: string;
  value: string;
  /** Few, short options (2–3): all visible side by side; some may be off. */
  options: (SelectOption & { disabled?: boolean })[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  /**
   * `stacked` = label above (a form field); `inline` = label on the left and
   * the control on the right from `sm` up (a list of settings), stacked on
   * the phone.
   */
  layout?: "stacked" | "inline";
};

/**
 * Label + segmented control (CPF | CNPJ), the height of an input. For a
 * choice among few options that should stay in view.
 */
export function SegmentedField({
  label,
  value,
  options,
  onChange,
  error,
  disabled = false,
  layout = "stacked",
}: SegmentedFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  const control = (
    <SegmentedControl
      aria-labelledby={id}
      aria-describedby={error ? errorId : undefined}
      value={value}
      onValueChange={onChange}
      options={options}
      invalid={Boolean(error)}
      disabled={disabled}
    />
  );
  const message = error && (
    <Text id={errorId} tone="destructive">
      {error}
    </Text>
  );

  if (layout === "inline") {
    return (
      <Row className="items-start gap-y-2">
        {/* The label lines up with the control (not the error below it). */}
        <Col sm={5} className="sm:flex sm:h-11 sm:items-center md:h-9">
          <Label id={id}>{label}</Label>
        </Col>
        <Col sm={7} className="space-y-2">
          {control}
          {message}
        </Col>
      </Row>
    );
  }

  return (
    <Box className="space-y-2">
      <Label id={id}>{label}</Label>
      {control}
      {message}
    </Box>
  );
}
