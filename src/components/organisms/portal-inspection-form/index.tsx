import { useState, type FormEvent } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { FormField } from "@/components/molecules/form-field";
import { PhotoSlot } from "@/components/molecules/photo-slot";
import { SelectField } from "@/components/molecules/select-field";
import { TextareaField } from "@/components/molecules/textarea-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { toApiError } from "@/helpers/api-error";
import { useInspectionMutations } from "@/hooks/api/cliente/rentals/useInspectionMutations";
import { useLabels } from "@/hooks/ui/useLabels";
import type { InspectionRequirements } from "@/types/portal";
import { onlyDigits } from "@/utils/masks";

type Errors = { mileage?: string; form?: string };

type PortalInspectionFormProps = {
  rentalId: string;
  requirements: InspectionRequirements;
  onSent: () => void;
};

/**
 * The renter's inspection: full (photos + checks, what the vehicle type
 * asks for) or just the km reading. Everything goes in one request.
 */
export function PortalInspectionForm({
  rentalId,
  requirements,
  onSent,
}: PortalInspectionFormProps) {
  const { label } = useLabels();
  const { send } = useInspectionMutations(rentalId);
  const [type, setType] = useState<"FULL" | "KM">("FULL");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<Record<string, File>>({});
  const [checksOk, setChecksOk] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [triedSubmit, setTriedSubmit] = useState(false);
  const full = type === "FULL";

  const missing = full
    ? requirements.photos.filter(
        (photo) => photo.required && !photos[photo.key],
      )
    : [];

  const setPhoto = (key: string, file: File | null) =>
    setPhotos((current) => {
      const next = { ...current };
      if (file) next[key] = file;
      else delete next[key];
      return next;
    });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTriedSubmit(true);
    const next: Errors = {};
    if (!mileage) next.mileage = "Informe a quilometragem do painel";
    setErrors(next);
    if (Object.keys(next).length || missing.length > 0) return;

    send.mutate(
      {
        type,
        mileage: Number(mileage),
        notes: notes.trim() || undefined,
        photos,
        checksOk,
      },
      {
        onSuccess: onSent,
        onError: (error) => {
          const apiError = toApiError(error);
          setErrors(
            apiError.fields?.mileage
              ? { mileage: apiError.fields.mileage }
              : { form: apiError.message },
          );
        },
      },
    );
  };

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-6">
          <Row className="gap-y-4">
            <Col md={6}>
              <SelectField
                label="Tipo de vistoria"
                value={type}
                options={(["FULL", "KM"] as const).map((value) => ({
                  value,
                  label: label(LABEL_MAPS.inspectionType, value),
                }))}
                onChange={(value) => setType(value === "KM" ? "KM" : "FULL")}
                disabled={send.isPending}
              />
            </Col>
            <Col md={6}>
              <FormField
                label="Quilometragem (km)"
                inputMode="numeric"
                placeholder="Odômetro atual"
                value={mileage}
                onChange={(event) => {
                  setMileage(onlyDigits(event.target.value).slice(0, 7));
                  setErrors((current) => ({ ...current, mileage: undefined }));
                }}
                error={errors.mileage}
                disabled={send.isPending}
              />
            </Col>
          </Row>

          {full && requirements.photos.length > 0 && (
            <Box className="space-y-3">
              <Heading level={2} variant="section">
                Fotos
              </Heading>
              <Row className="gap-y-4">
                {requirements.photos.map((photo) => (
                  <Col key={photo.key} span={6} md={4}>
                    <PhotoSlot
                      label={photo.label}
                      required={photo.required}
                      file={photos[photo.key] ?? null}
                      onChange={(file) => setPhoto(photo.key, file)}
                      error={
                        triedSubmit && photo.required && !photos[photo.key]
                      }
                      disabled={send.isPending}
                    />
                  </Col>
                ))}
              </Row>
              {triedSubmit && missing.length > 0 && (
                <Text tone="destructive">
                  Faltam fotos: {missing.map((photo) => photo.label).join(", ")}
                </Text>
              )}
            </Box>
          )}

          {full && requirements.checks.length > 0 && (
            <Box
              role="group"
              aria-label="Itens verificados"
              className="space-y-3"
            >
              <Heading level={2} variant="section">
                Itens verificados
              </Heading>
              <Text size="xs" tone="muted">
                Marque o que está OK.
              </Text>
              {requirements.checks.map((check) => (
                <CheckboxField
                  key={check.key}
                  label={check.label}
                  checked={checksOk.includes(check.key)}
                  onChange={(checked) =>
                    setChecksOk((current) =>
                      checked
                        ? [...current, check.key]
                        : current.filter((key) => key !== check.key),
                    )
                  }
                  disabled={send.isPending}
                />
              ))}
            </Box>
          )}

          <TextareaField
            label="Observações (opcional)"
            placeholder="Algo a avisar sobre o veículo"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={send.isPending}
          />

          {errors.form && <Alert>{errors.form}</Alert>}

          <Box className="flex justify-end">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={send.isPending}
            >
              {send.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Enviar vistoria
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function PortalInspectionFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 pt-4 md:pt-6">
        <Row className="gap-y-4">
          {[0, 1].map((index) => (
            <Col key={index} md={6} className="space-y-2">
              <Skeleton shape="text" className="w-28 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
        </Row>
        <Box className="space-y-3">
          <Skeleton shape="text" className="w-16 text-base" />
          <Row className="gap-y-4">
            {[0, 1, 2].map((index) => (
              <Col key={index} span={6} md={4}>
                <Skeleton className="aspect-[4/3] w-full" />
              </Col>
            ))}
          </Row>
        </Box>
        <Box className="flex justify-end">
          <Skeleton className="h-11 w-36 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
