import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { Text } from "@/components/atoms/text";
import { SelectField } from "@/components/molecules/select-field";
import {
  InspectionForm,
  InspectionFormSkeleton,
} from "@/components/organisms/inspection-form";
import { toApiError } from "@/helpers/api-error";
import { INSPECTION_AUTHOR_PREFIX } from "@/helpers/inspection";
import { useCreateInspection } from "@/hooks/api/gestao/inspections/useInspectionMutations";
import type { InspectionActor } from "@/types/inspection";
import type { InspectionRequirements } from "@/types/portal";
import { formatMileage } from "@/utils/format";

type StaffInspectionFormProps = {
  vehicle: { id: string; label: string; currentMileage: number | null };
  /** Set when it comes from a rental: then the renter can be the author. */
  rental?: { id: string; code: string; customerName: string };
  requirements: InspectionRequirements;
  onSaved: (id: string) => void;
};

type ContextErrors = { performedBy?: string; rentalId?: string };

/**
 * An inspection recorded by the staff, of a vehicle and maybe one of its
 * rentals. "Realizada por": the agent (recorded as the author) or, only on a
 * rental, the renter.
 */
export function StaffInspectionForm({
  vehicle,
  rental,
  requirements,
  onSaved,
}: StaffInspectionFormProps) {
  const create = useCreateInspection();
  const [performedBy, setPerformedBy] = useState<InspectionActor>("LESSOR");
  const [errors, setErrors] = useState<ContextErrors>({});
  const actors: InspectionActor[] = rental ? ["LESSOR", "LESSEE"] : ["LESSOR"];

  return (
    <InspectionForm
      requirements={requirements}
      isPending={create.isPending}
      submitLabel="Salvar vistoria"
      onSubmit={async (values) => {
        setErrors({});
        try {
          const saved = await create.mutateAsync({
            ...values,
            vehicleId: vehicle.id,
            rentalId: rental?.id,
            performedBy,
          });
          onSaved(saved.id);
        } catch (error) {
          const apiError = toApiError(error);
          const fields = apiError.fields ?? {};
          setErrors({
            performedBy: fields.performedBy,
            rentalId: fields.rentalId,
          });
          const placed =
            fields.mileage || fields.performedBy || fields.rentalId;
          return {
            mileage: fields.mileage,
            form: placed ? undefined : apiError.message,
          };
        }
      }}
    >
      <Row className="gap-y-4">
        <Col md={6}>
          <Box className="space-y-1">
            <Text size="sm" weight="medium">
              Veículo
            </Text>
            <Text>{vehicle.label}</Text>
            <Text size="xs" tone="muted">
              {rental ? `Locação ${rental.code} · ` : ""}
              {vehicle.currentMileage !== null
                ? `Última leitura: ${formatMileage(vehicle.currentMileage)}`
                : "Sem leitura de km"}
            </Text>
            {errors.rentalId && (
              <Text size="xs" tone="destructive">
                {errors.rentalId}
              </Text>
            )}
          </Box>
        </Col>
        <Col md={6} className="space-y-1">
          <SelectField
            label="Realizada por"
            value={performedBy}
            options={actors.map((actor) => ({
              value: actor,
              label:
                actor === "LESSEE" && rental
                  ? `${INSPECTION_AUTHOR_PREFIX.LESSEE} · ${rental.customerName}`
                  : INSPECTION_AUTHOR_PREFIX[actor],
            }))}
            onChange={(value) =>
              setPerformedBy(value === "LESSEE" ? "LESSEE" : "LESSOR")
            }
            error={errors.performedBy}
            disabled={create.isPending || !rental}
          />
          {!rental && (
            <Text size="xs" tone="muted">
              Locatário só numa vistoria com locação.
            </Text>
          )}
        </Col>
      </Row>
    </InspectionForm>
  );
}

export function StaffInspectionFormSkeleton() {
  return <InspectionFormSkeleton extraRows={1} />;
}
