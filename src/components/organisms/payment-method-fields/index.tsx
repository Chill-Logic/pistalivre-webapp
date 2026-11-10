import { Box } from "@/components/atoms/box";
import { Col } from "@/components/atoms/grid";
import { Text } from "@/components/atoms/text";
import { SelectField } from "@/components/molecules/select-field";
import { TextLink } from "@/components/molecules/text-link";
import { LABEL_MAPS } from "@/constants/label-maps";
import { ROUTES } from "@/constants/routes";
import type { ColSpans } from "@/helpers/grid";
import { paymentCardOptions, usesCard } from "@/helpers/payment-card";
import { usePaymentCards } from "@/hooks/api/gestao/payment-cards/usePaymentCards";
import { useLabels } from "@/hooks/ui/useLabels";
import type { ExpensePaymentMethod } from "@/types/currency";

/** Radix select reserves "": the "not told" entry. */
const NONE = "__none__";

type PaymentMethodFieldsProps = {
  method: ExpensePaymentMethod | null;
  cardId: string | null;
  onMethodChange: (method: ExpensePaymentMethod | null) => void;
  onCardChange: (cardId: string | null) => void;
  errors?: { paymentMethod?: string; paymentCardId?: string };
  disabled?: boolean;
  /** Width of each field's column (grid of 12). */
  cols?: ColSpans;
};

/**
 * "Forma de pagamento" and, by card, which card — two columns of the parent
 * Row. The card's IOF/spread is what converts a foreign cost.
 */
export function PaymentMethodFields({
  method,
  cardId,
  onMethodChange,
  onCardChange,
  errors,
  disabled,
  cols = { md: 6 },
}: PaymentMethodFieldsProps) {
  const { options } = useLabels();
  const cards = usePaymentCards();
  const cardOptions = paymentCardOptions(cards.data ?? [], cardId);

  return (
    <>
      <Col {...cols}>
        <SelectField
          label="Forma de pagamento"
          value={method ?? NONE}
          options={[
            { value: NONE, label: "Não informada" },
            ...options(LABEL_MAPS.expensePaymentMethod),
          ]}
          onChange={(value) =>
            onMethodChange(value === NONE ? null : (value as ExpensePaymentMethod))
          }
          error={errors?.paymentMethod}
          disabled={disabled}
        />
      </Col>
      {usesCard(method) && (
        <Col {...cols}>
          <Box className="space-y-1">
            <SelectField
              label="Cartão"
              value={cardId ?? NONE}
              options={[{ value: NONE, label: "Não informado" }, ...cardOptions]}
              onChange={(value) => onCardChange(value === NONE ? null : value)}
              error={errors?.paymentCardId}
              disabled={disabled || cards.isLoading}
            />
            {cards.isSuccess && cardOptions.length === 0 && (
              <Text size="xs" tone="muted">
                Nenhum cartão ainda.{" "}
                <TextLink to={ROUTES.financeCards}>Cadastrar cartão</TextLink>
              </Text>
            )}
          </Box>
        </Col>
      )}
    </>
  );
}
