import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { FormField } from "@/components/molecules/form-field";
import { SelectField } from "@/components/molecules/select-field";
import { applyApiErrors } from "@/helpers/form";
import { useCreateCampaignLink } from "@/hooks/api/gestao/crm/useCampaignLinks";
import type { CampaignChannel } from "@/types/crm";

/** Mirrors the API's checks (same PT messages). */
const schema = z.object({
  label: z.string().trim().min(1, "Dê um nome ao link"),
  channel: z.string().min(1, "Escolha o canal"),
  utmCampaign: z.string().trim().min(1, "Informe o nome da campanha"),
  utmSource: z.string().trim().min(1, "Informe a origem (utm_source)"),
  utmMedium: z.string().trim().min(1, "Informe a mídia (utm_medium)"),
  utmContent: z.string().trim(),
  isTest: z.boolean(),
});

type Values = z.infer<typeof schema>;

const API_FIELDS = [
  "label",
  "channel",
  "utmCampaign",
  "utmSource",
  "utmMedium",
  "utmContent",
] as const;

/**
 * A trackable link: picking the channel ("where will I publish?") fills
 * utm source/medium; the staff only names the campaign. "Outro" comes empty.
 */
export function CampaignLinkForm({
  channels,
}: {
  channels: CampaignChannel[];
}) {
  const create = useCreateCampaignLink();
  const [formError, setFormError] = useState<string | null>(null);
  const first = channels[0];
  const defaults: Values = {
    label: "",
    channel: first?.key ?? "",
    utmCampaign: "",
    utmSource: first?.utmSource ?? "",
    utmMedium: first?.utmMedium ?? "",
    utmContent: "",
    isTest: false,
  };
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const onChannel = (key: string) => {
    const preset = channels.find((channel) => channel.key === key);
    setValue("channel", key, { shouldValidate: true });
    setValue("utmSource", preset?.utmSource ?? "", { shouldValidate: false });
    setValue("utmMedium", preset?.utmMedium ?? "", { shouldValidate: false });
  };

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    create.mutate(
      {
        label: values.label.trim(),
        channel: values.channel,
        utmCampaign: values.utmCampaign.trim(),
        utmSource: values.utmSource.trim(),
        utmMedium: values.utmMedium.trim(),
        utmContent: values.utmContent.trim() || null,
        isTest: values.isTest,
      },
      {
        onSuccess: () => reset(defaults),
        onError: (error) =>
          setFormError(applyApiErrors(error, setError, API_FIELDS)),
      },
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Novo link</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={onSubmit} noValidate className="space-y-4">
          <Row className="gap-y-4">
            <Col md={6} lg={4}>
              <FormField
                label="Nome do link (interno)"
                placeholder="Ex.: Instagram bio, motos julho"
                {...register("label")}
                error={errors.label?.message}
              />
            </Col>
            <Col md={6} lg={4}>
              <Controller
                control={control}
                name="channel"
                render={({ field }) => (
                  <SelectField
                    label="Onde vai publicar? (canal)"
                    value={field.value}
                    options={channels.map((channel) => ({
                      value: channel.key,
                      label: channel.label,
                    }))}
                    onChange={onChannel}
                    error={errors.channel?.message}
                  />
                )}
              />
            </Col>
            <Col md={6} lg={4}>
              <FormField
                label="Campanha (utm_campaign)"
                placeholder="Ex.: motos-julho"
                {...register("utmCampaign")}
                error={errors.utmCampaign?.message}
              />
            </Col>
            <Col md={6} lg={4}>
              <FormField
                label="Origem (utm_source)"
                placeholder="instagram, google…"
                {...register("utmSource")}
                error={errors.utmSource?.message}
              />
            </Col>
            <Col md={6} lg={4}>
              <FormField
                label="Mídia (utm_medium)"
                placeholder="social, cpc, flyer…"
                {...register("utmMedium")}
                error={errors.utmMedium?.message}
              />
            </Col>
            <Col md={6} lg={4}>
              <FormField
                label="Conteúdo (utm_content), opcional"
                placeholder="Ex.: story-1, criativo-A"
                {...register("utmContent")}
                error={errors.utmContent?.message}
              />
            </Col>
          </Row>
          <Controller
            control={control}
            name="isTest"
            render={({ field }) => (
              <CheckboxField
                label="Link de teste"
                hint="Os leads que entrarem por ele são de teste: ficam fora das métricas e podem ser apagados de uma vez."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {formError && <Alert>{formError}</Alert>}
          <Box className="flex justify-end">
            <Button
              type="submit"
              disabled={create.isPending}
              className="w-full sm:w-auto"
            >
              {create.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              Gerar link
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function CampaignLinkFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-24 text-base" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Row className="gap-y-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Col key={index} md={6} lg={4} className="space-y-2">
              <Skeleton shape="text" className="w-40 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
        </Row>
        <Skeleton shape="text" className="w-48 text-sm" />
        <Box className="flex justify-end">
          <Skeleton className="h-11 w-full sm:w-28 md:h-9" />
        </Box>
      </CardContent>
    </Card>
  );
}
