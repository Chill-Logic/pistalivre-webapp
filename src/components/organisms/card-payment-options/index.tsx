import { Box } from "@/components/atoms/box";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { SwitchField } from "@/components/molecules/switch-field";
import type { CardPaymentOptionsValue } from "@/types/card-payment-options";

/**
 * The card settings of a charge (owner, 2026-11-16): "Aceitar parcelamento"
 * and "Repassar taxas" as switches; with the fees passed on, two boxes pick
 * which extra parts go too — the installment surcharge and the anticipation.
 * The money is computed on the server.
 */
export function CardPaymentOptions({
  value,
  onChange,
  disabled,
  hints = true,
}: {
  value: CardPaymentOptionsValue;
  onChange: (patch: Partial<CardPaymentOptionsValue>) => void;
  disabled?: boolean;
  /** Explanations under the switches (off in tight forms). */
  hints?: boolean;
}) {
  return (
    <Box className="space-y-3">
      <SwitchField
        label="Aceitar parcelamento"
        hint={hints ? "Desligado, o cartão é só à vista." : undefined}
        checked={value.installments}
        onChange={(installments) => onChange({ installments })}
        disabled={disabled}
      />
      <SwitchField
        label="Repassar taxas"
        hint={
          hints
            ? "A taxa do cartão vai para o cliente. Desligado, ele paga só o valor."
            : undefined
        }
        checked={value.passFees}
        onChange={(passFees) => onChange({ passFees })}
        disabled={disabled}
      />
      {value.passFees && (
        <Box className="flex flex-wrap gap-x-6 gap-y-2 pl-1">
          {value.installments && (
            <CheckboxField
              label="Parcelamento"
              checked={value.passInstallmentFee}
              onChange={(passInstallmentFee) =>
                onChange({ passInstallmentFee })
              }
              disabled={disabled}
            />
          )}
          <CheckboxField
            label="Antecipação"
            checked={value.passAnticipation}
            onChange={(passAnticipation) => onChange({ passAnticipation })}
            disabled={disabled}
          />
        </Box>
      )}
    </Box>
  );
}
