import {
  InspectionForm,
  InspectionFormSkeleton,
} from "@/components/organisms/inspection-form";
import { toApiError } from "@/helpers/api-error";
import { useInspectionMutations } from "@/hooks/api/cliente/rentals/useInspectionMutations";
import type { InspectionRequirements } from "@/types/portal";

type PortalInspectionFormProps = {
  rentalId: string;
  requirements: InspectionRequirements;
  onSent: () => void;
};

/** The renter's inspection of their rental (the form is shared with the staff). */
export function PortalInspectionForm({
  rentalId,
  requirements,
  onSent,
}: PortalInspectionFormProps) {
  const { send } = useInspectionMutations(rentalId);

  return (
    <InspectionForm
      requirements={requirements}
      isPending={send.isPending}
      submitLabel="Enviar vistoria"
      onSubmit={async (values) => {
        try {
          await send.mutateAsync(values);
          onSent();
        } catch (error) {
          const apiError = toApiError(error);
          return apiError.fields?.mileage
            ? { mileage: apiError.fields.mileage }
            : { form: apiError.message };
        }
      }}
    />
  );
}

export function PortalInspectionFormSkeleton() {
  return <InspectionFormSkeleton />;
}
