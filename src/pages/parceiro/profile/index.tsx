import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { BackLink } from "@/components/molecules/back-link";
import { PageHeader } from "@/components/molecules/page-header";
import { PartnerAreaPasswordForm } from "@/components/organisms/partner-area-password-form";
import {
  PartnerAreaProfileForm,
  PartnerAreaProfileFormSkeleton,
} from "@/components/organisms/partner-area-profile-form";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { PARTNER_PASSWORD_CHANGED } from "@/constants/partner-area";
import { ROUTES } from "@/constants/routes";
import { usePartnerHome } from "@/hooks/api/parceiro/area/usePartnerHome";
import { useLogout } from "@/hooks/auth/useLogout";

/** The partner's own data (phone and pix key editable) and password. */
export function PartnerProfilePage() {
  const home = usePartnerHome();
  const logout = useLogout();

  // The API ended every session: back to the login, saying why. A full load
  // (not the router): the guard would send this page, already unmounted by
  // the logout, to the login with a callbackUrl and no notice.
  const onPasswordChanged = () => {
    logout();
    const { param, value } = PARTNER_PASSWORD_CHANGED;
    window.location.replace(`${ROUTES.partnerAreaLogin}?${param}=${value}`);
  };

  return (
    <Box className="space-y-4">
      {/* Desktop: "Perfil" is in the sidebar, no way back needed. */}
      <Box className="lg:hidden">
        <BackLink to={ROUTES.partnerArea} label="Meus contratos" />
      </Box>
      <Box className="space-y-6">
        <PageHeader title="Perfil" />
        <Row className="gap-y-6">
          <Col lg={7}>
            <QueryBoundary
              query={home}
              label="Carregando seus dados…"
              skeleton={<PartnerAreaProfileFormSkeleton />}
            >
              {({ partner }) => <PartnerAreaProfileForm profile={partner} />}
            </QueryBoundary>
          </Col>
          <Col lg={5}>
            <PartnerAreaPasswordForm onChanged={onPasswordChanged} />
          </Col>
        </Row>
      </Box>
    </Box>
  );
}
