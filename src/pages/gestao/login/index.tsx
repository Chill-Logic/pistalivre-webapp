import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/templates/auth-layout";
import { LoginForm } from "@/components/organisms/login-form";
import { safeRedirect } from "@/helpers/safe-redirect";
import { useLogin } from "@/hooks/api/gestao/auth/useLogin";

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = useLogin();

  return (
    <AuthLayout area="Gestão da locadora" title="Entrar">
      <LoginForm
        login={login}
        onSuccess={() =>
          navigate(safeRedirect(params.get("callbackUrl"), "gestao"), {
            replace: true,
          })
        }
      />
    </AuthLayout>
  );
}
