import { useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Spinner } from "@/components/atoms/spinner";
import { CheckboxGroupField } from "@/components/molecules/checkbox-group-field";
import { FormField } from "@/components/molecules/form-field";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { SelectField } from "@/components/molecules/select-field";
import { errorMessage, toApiError } from "@/helpers/api-error";
import type { QualificationInput, QuestionnaireState } from "@/types/public-lead";

const OWN_VEHICLE = [
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não, prefiro alugar" },
];

type QuestionnaireQualificationFormProps = {
  options: QuestionnaireState["options"];
  pending: boolean;
  error: unknown;
  onSubmit: (input: QualificationInput) => void;
};

/**
 * Step 1: the questions the SDR asks before showing the plans. The answers go
 * to the lead, so whoever talks to the customer later knows the profile.
 */
export function QuestionnaireQualificationForm({
  options,
  pending,
  error,
  onSubmit,
}: QuestionnaireQualificationFormProps) {
  const [apps, setApps] = useState<string[]>([]);
  const [otherApp, setOtherApp] = useState("");
  const [experience, setExperience] = useState("");
  const [income, setIncome] = useState("");
  const [ownVehicle, setOwnVehicle] = useState("yes");
  const fields = error ? (toApiError(error).fields ?? {}) : {};

  return (
    <Form
      noValidate
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          workApps: [...apps, otherApp.trim()].filter(Boolean),
          appsExperience: experience,
          incomeType: income,
          wantsOwnVehicle: ownVehicle === "yes",
        });
      }}
    >
      <CheckboxGroupField
        label="1. Em quais aplicativos você trabalha hoje?"
        options={options.workApps.map((app) => ({ value: app, label: app }))}
        value={apps}
        onChange={setApps}
      />
      <FormField
        label="Outro aplicativo (opcional)"
        value={otherApp}
        onChange={(event) => setOtherApp(event.target.value)}
      />
      <SelectField
        label="2. Há quanto tempo você trabalha com esses aplicativos?"
        placeholder="Selecione"
        value={experience}
        options={options.appsExperience}
        onChange={setExperience}
        error={fields.appsExperience}
      />
      <SelectField
        label="3. Essa é sua única fonte de renda ou é complementar?"
        placeholder="Selecione"
        value={income}
        options={options.incomeType}
        onChange={setIncome}
        error={fields.incomeType}
      />
      <SegmentedField
        label="4. Seu objetivo final é ter uma moto própria?"
        value={ownVehicle}
        options={OWN_VEHICLE}
        onChange={setOwnVehicle}
      />
      {error && !Object.keys(fields).length ? (
        <Alert>{errorMessage(error)}</Alert>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Spinner className="text-primary-foreground" />}
        Ver os planos
      </Button>
    </Form>
  );
}
