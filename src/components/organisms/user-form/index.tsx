import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Form } from "@/components/atoms/form";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { FormField } from "@/components/molecules/form-field";
import { MaskedField } from "@/components/molecules/masked-field";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { applyApiErrors } from "@/helpers/form";
import { useSaveUser } from "@/hooks/api/gestao/users/useUserMutations";
import { useLabels } from "@/hooks/ui/useLabels";
import type { StaffUserDetail, UserRole } from "@/types/user";
import { isValidCpf } from "@/utils/cpf";
import { brDateToDay, dayToBrDate, todayInBrasilia } from "@/utils/date";
import { maskCpf, maskDate, onlyDigits } from "@/utils/masks";

const baseSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
  birthDate: z.string().refine((value) => {
    if (!value) return true;
    const day = brDateToDay(value);
    return day !== null && day <= todayInBrasilia() && day >= "1900-01-01";
  }, "Data de nascimento inválida"),
  role: z.enum(["ADMIN", "AGENT"]),
  password: z.string(),
  passwordConfirm: z.string(),
});

const createSchema = baseSchema.superRefine((values, ctx) => {
  if (values.password.length < 8) {
    ctx.addIssue({
      code: "custom",
      path: ["password"],
      message: "A senha precisa de pelo menos 8 caracteres",
    });
  } else if (values.password !== values.passwordConfirm) {
    ctx.addIssue({
      code: "custom",
      path: ["passwordConfirm"],
      message: "As senhas não conferem",
    });
  }
});

type Values = z.infer<typeof baseSchema>;

const API_FIELDS = [
  "name",
  "email",
  "cpf",
  "birthDate",
  "role",
  "password",
] as const;

type UserFormProps = {
  /** Present = edit; absent = create (admin only). */
  user?: StaffUserDetail;
  /** Agents editing themselves can't change the role (the API ignores it). */
  canEditRole: boolean;
  cancelTo: string;
  onSaved: (user: StaffUserDetail) => void;
};

/** Name, e-mail, CPF, birth date, role; the password only on create. */
export function UserForm({
  user,
  canEditRole,
  cancelTo,
  onSaved,
}: UserFormProps) {
  const isNew = !user;
  const save = useSaveUser(user?.id);
  const { options } = useLabels();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(isNew ? createSchema : baseSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      cpf: user?.cpf ? maskCpf(user.cpf) : "",
      birthDate: user?.birthDate ? dayToBrDate(user.birthDate) : "",
      role: (user?.role ?? "AGENT") as UserRole,
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(
      {
        name: values.name.trim(),
        email: values.email,
        cpf: onlyDigits(values.cpf),
        birthDate: values.birthDate ? brDateToDay(values.birthDate) : null,
        role: canEditRole ? values.role : (user?.role ?? "AGENT"),
        ...(isNew ? { password: values.password } : {}),
      },
      {
        onSuccess: onSaved,
        onError: (error) =>
          // 409 comes with `fields.email`; 403 has no field → alert.
          setFormError(applyApiErrors(error, setError, API_FIELDS)),
      },
    );
  });

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Form onSubmit={onSubmit} noValidate className="space-y-6">
          <Row className="gap-y-4">
            <Col md={6}>
              <FormField
                label="Nome"
                autoComplete="name"
                {...register("name")}
                error={errors.name?.message}
              />
            </Col>
            <Col md={6}>
              <FormField
                label="E-mail"
                type="email"
                autoComplete="email"
                {...register("email")}
                error={errors.email?.message}
              />
            </Col>
            <Col md={4}>
              <Controller
                control={control}
                name="cpf"
                render={({ field }) => (
                  <MaskedField
                    label="CPF"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    mask={maskCpf}
                    inputMode="numeric"
                    error={errors.cpf?.message}
                  />
                )}
              />
            </Col>
            <Col md={4}>
              <Controller
                control={control}
                name="birthDate"
                render={({ field }) => (
                  <MaskedField
                    label="Nascimento (opcional)"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    mask={maskDate}
                    inputMode="numeric"
                    placeholder="dd/mm/aaaa"
                    error={errors.birthDate?.message}
                  />
                )}
              />
            </Col>
            {canEditRole && (
              <Col md={4}>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <SelectField
                      label="Perfil"
                      value={field.value}
                      onChange={field.onChange}
                      options={options(LABEL_MAPS.userRole)}
                      error={errors.role?.message}
                    />
                  )}
                />
              </Col>
            )}
            {isNew && (
              <>
                <Col md={6}>
                  <FormField
                    label="Senha"
                    type="password"
                    autoComplete="new-password"
                    {...register("password")}
                    error={errors.password?.message}
                  />
                </Col>
                <Col md={6}>
                  <FormField
                    label="Confirmar senha"
                    type="password"
                    autoComplete="new-password"
                    {...register("passwordConfirm")}
                    error={errors.passwordConfirm?.message}
                  />
                </Col>
              </>
            )}
          </Row>

          {formError && <Alert>{formError}</Alert>}

          <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link to={cancelTo}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && (
                <Spinner className="text-primary-foreground" />
              )}
              {isNew ? "Criar usuário" : "Salvar alterações"}
            </Button>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}

export function UserFormSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <Row className="gap-y-4">
          {([6, 6, 4, 4, 4] as const).map((md, index) => (
            <Col key={index} md={md} className="space-y-2">
              <Skeleton shape="text" className="w-24 text-sm" />
              <Skeleton className="h-11 md:h-9" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
