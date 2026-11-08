import { Col, Row } from "@/components/atoms/grid";
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useCustomer } from "@/hooks/api/gestao/customers/useCustomer";
import { useLabels } from "@/hooks/ui/useLabels";
import { useCustomerOptions } from "@/hooks/ui/useRemoteOptions";

/** Radix Select reserves "" — "no rental" travels as this sentinel. */
const NO_RENTAL = "__none__";

export type CustomerRentalValue = {
  customerId: string;
  customerName: string;
  /** "" = no rental. */
  rentalId: string;
};

type CustomerRentalPickerProps = {
  value: CustomerRentalValue;
  onChange: (value: CustomerRentalValue) => void;
  /** The customer is fixed (customer record): only the rental is chosen. */
  lockCustomer?: boolean;
  customerError?: string;
  rentalError?: string;
  disabled?: boolean;
};

/**
 * "Cliente" (searched on the server) + "Locação (opcional)" among that
 * customer's rentals, as the Financeiro dialogs of the management app do.
 */
export function CustomerRentalPicker({
  value,
  onChange,
  lockCustomer = false,
  customerError,
  rentalError,
  disabled = false,
}: CustomerRentalPickerProps) {
  const { label } = useLabels();
  const customers = useCustomerOptions();
  const customer = useCustomer(value.customerId);
  const rentals = customer.data?.rentals ?? [];

  return (
    <Row className="gap-y-4">
      {!lockCustomer && (
        <Col md={6}>
          <RemoteCombobox
            label="Cliente"
            value={value.customerId}
            selectedLabel={value.customerName}
            options={customers.options}
            isLoading={customers.isLoading}
            search={customers.search}
            onSearchChange={customers.setSearch}
            onChange={(option) =>
              onChange({
                customerId: option.value,
                customerName: option.label,
                rentalId: "",
              })
            }
            placeholder="Selecione o cliente"
            searchPlaceholder="Buscar por nome ou CPF…"
            error={customerError}
            disabled={disabled}
          />
        </Col>
      )}
      <Col md={lockCustomer ? 12 : 6}>
        <SelectField
          label="Locação (opcional)"
          value={value.rentalId || NO_RENTAL}
          options={[
            { value: NO_RENTAL, label: "Sem locação" },
            ...rentals.map((rental) => ({
              value: rental.id,
              label: `${rental.code} · ${label(LABEL_MAPS.rentalStatus, rental.status)}`,
            })),
          ]}
          onChange={(next) =>
            onChange({ ...value, rentalId: next === NO_RENTAL ? "" : next })
          }
          error={rentalError}
          disabled={disabled || !value.customerId}
        />
      </Col>
    </Row>
  );
}
