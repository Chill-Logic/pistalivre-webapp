import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Spinner } from "@/components/atoms/spinner";
import { FormField } from "@/components/molecules/form-field";
import { PasswordField } from "@/components/molecules/password-field";
import { loginSchema, type LoginFormValues } from "./schema";
import { errorMessage } from "@/helpers/api-error";
import type { useLogin } from "@/hooks/api/gestao/auth/useLogin";

type LoginFormProps = {
  /** The area's login (staff `useLogin`, partner `usePartnerLogin`). */
  login: ReturnType<typeof useLogin>;
  onSuccess: () => void;
};

/** E-mail and password: the staff's and the partner's login. */
export function LoginForm({ login, onSuccess }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, { onSuccess }),
  );

  return (
    <Form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField
        label="E-mail"
        className="md:h-11 md:text-base"
        type="email"
        autoComplete="username"
        inputMode="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        label="Senha"
        autoComplete="current-password"
        className="md:h-11 md:text-base"
        error={errors.password?.message}
        {...register("password")}
      />
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
