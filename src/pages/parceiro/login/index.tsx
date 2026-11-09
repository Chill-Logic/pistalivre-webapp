import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert } from "@/components/atoms/alert";
import { LoginForm } from "@/components/organisms/login-form";
import { AuthLayout } from "@/components/templates/auth-layout";
import { PARTNER_PASSWORD_CHANGED } from "@/constants/partner-area";
import { safeRedirect } from "@/helpers/safe-redirect";
import { usePartnerLogin } from "@/hooks/api/parceiro/auth/usePartnerLogin";

export function PartnerLoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = usePartnerLogin();
  const passwordChanged =
    params.get(PARTNER_PASSWORD_CHANGED.param) ===
    PARTNER_PASSWORD_CHANGED.value;

  return (
    <AuthLayout area="Área do parceiro" title="Entrar">
      {passwordChanged && !login.isError && (
        <Alert variant="success" role="status">
          Senha alterada. Entre de novo com a nova senha.
        </Alert>
      )}
      <LoginForm
        login={login}
        onSuccess={() =>
          navigate(safeRedirect(params.get("callbackUrl"), "parceiro"), {
            replace: true,
          })
        }
      />
    </AuthLayout>
  );
}
