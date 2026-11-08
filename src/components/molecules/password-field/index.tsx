import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

type PasswordFieldProps = Omit<ComponentProps<typeof Input>, "type"> & {
  label: string;
  error?: string;
};

/**
 * Password input with a show/hide toggle (the eye). The toggle is a real
 * button: reachable by keyboard, it says what it does and whether the
 * password is showing.
 */
export function PasswordField({
  label,
  error,
  id,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [visible, setVisible] = useState(false);

  return (
    <Box className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Box className="relative">
        <Input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn("pr-12", className)}
          {...inputProps}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute inset-y-0 right-0 h-full w-11 rounded-l-none text-muted-foreground hover:bg-transparent hover:text-foreground md:h-full md:w-11"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          aria-controls={inputId}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </Box>
      {error && (
        <Text id={errorId} tone="destructive">
          {error}
        </Text>
      )}
    </Box>
  );
}
