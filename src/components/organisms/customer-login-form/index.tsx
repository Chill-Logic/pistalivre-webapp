import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { PasswordField } from "@/components/molecules/password-field";
import { customerLoginSchema, type CustomerLoginFormValues } from "./schema";
import { errorMessage } from "@/helpers/api-error";
import { useCustomerLogin } from "@/hooks/api/cliente/auth/useCustomerLogin";

type CustomerLoginFormProps = {
  onSuccess: () => void;
};

export function CustomerLoginForm({ onSuccess }: CustomerLoginFormProps) {
  const login = useCustomerLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerLoginFormValues>({
    resolver: zodResolver(customerLoginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, { onSuccess }),
  );

  return (
    <Form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField
        label="E-mail ou CPF"
        className="md:h-11 md:text-base"
        autoComplete="username"
        error={errors.identifier?.message}
        {...register("identifier")}
      />
      <PasswordField
        label="Senha"
        autoComplete="current-password"
        className="md:h-11 md:text-base"
        error={errors.password?.message}
        {...register("password")}
      />
      <Text size="xs" tone="muted">
        No primeiro acesso, use seu CPF como senha.
      </Text>
      {login.isError && <Alert>{errorMessage(login.error)}</Alert>}
      <Button
        type="submit"
        className="h-11 w-full text-base"
        disabled={login.isPending}
      >
        {login.isPending && <Spinner className="text-primary-foreground" />}
        {login.isPending ? "Entrando…" : "Entrar"}
      </Button>
    </Form>
  );
}
