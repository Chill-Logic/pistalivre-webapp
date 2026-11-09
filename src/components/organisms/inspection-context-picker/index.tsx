import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Text } from "@/components/atoms/text";
import {
  RemoteCombobox,
  type RemoteOption,
} from "@/components/molecules/remote-combobox";
import {
  useRentalOptions,
  useVehicleOptions,
} from "@/hooks/ui/useRemoteOptions";

/** The "no rental" choice (cmdk items need a non-empty value). */
const STANDALONE = "__avulsa__";
const STANDALONE_OPTION: RemoteOption = {
  value: STANDALONE,
  label: "Avulsa (sem locação)",
  detail: "Vistoria só do veículo",
};

type InspectionContextPickerProps = {
  vehicle: { id: string; label: string; plate: string } | null;
  rental: { id: string; label: string } | null;
  onVehicleChange: (vehicleId: string) => void;
  /** `null` = standalone; a rental brings its vehicle along. */
  onRentalChange: (rental: { id: string; vehicleId: string } | null) => void;
};

/**
 * What a new inspection (opened from the list) is about: a vehicle and,
 * optionally, one of its rentals. Picking a rental picks its vehicle; without
 * a typed term the rental search lists the chosen vehicle's rentals.
 */
export function InspectionContextPicker({
  vehicle,
  rental,
  onVehicleChange,
  onRentalChange,
}: InspectionContextPickerProps) {
  const vehicles = useVehicleOptions();
  const rentals = useRentalOptions({ fallback: vehicle?.plate ?? "" });
  const rentalOptions = rentals.search.trim()
    ? rentals.options
    : [STANDALONE_OPTION, ...rentals.options];

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Row className="gap-y-4">
          <Col md={6}>
            <RemoteCombobox
              label="Veículo"
              value={vehicle?.id ?? ""}
              selectedLabel={vehicle?.label}
              options={vehicles.options}
              isLoading={vehicles.isLoading}
              search={vehicles.search}
              onSearchChange={vehicles.setSearch}
              onChange={(option) => onVehicleChange(option.value)}
              placeholder="Selecione o veículo"
              searchPlaceholder="Buscar por placa, marca ou modelo…"
            />
          </Col>
          <Col md={6} className="space-y-1">
            <RemoteCombobox
              label="Locação"
              value={rental?.id ?? STANDALONE}
              selectedLabel={rental?.label ?? STANDALONE_OPTION.label}
              options={rentalOptions}
              isLoading={rentals.isLoading}
              search={rentals.search}
              onSearchChange={rentals.setSearch}
              onChange={(option) => {
                const picked = rentals.items.find(
                  (item) => item.id === option.value,
                );
                onRentalChange(
                  picked
                    ? { id: picked.id, vehicleId: picked.vehicle.id }
                    : null,
                );
              }}
              searchPlaceholder="Buscar por código, cliente ou placa…"
            />
            <Text size="xs" tone="muted">
              Opcional. Sem locação, a vistoria fica avulsa.
            </Text>
          </Col>
        </Row>
      </CardContent>
    </Card>
  );
}
