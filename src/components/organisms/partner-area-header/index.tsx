import { LogOut, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Header } from "@/components/atoms/landmarks";
import { Text } from "@/components/atoms/text";
import { Logo } from "@/components/molecules/logo";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import { ROUTES } from "@/constants/routes";
import { useLogout } from "@/hooks/auth/useLogout";
import type { AuthUser } from "@/types/auth";
import { firstName } from "@/utils/format";

/**
 * Partner header: logo home, greeting, theme, profile and sign out. From `lg`
 * up the sidebar has the logo and the profile, so the header keeps only the
 * greeting, the theme and "Sair" (like the staff's).
 */
export function PartnerAreaHeader({ user }: { user: AuthUser }) {
  const logout = useLogout();

  return (
    <Header className="sticky top-0 z-30 border-b bg-card/95 pt-safe-t backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <Box className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 lg:mx-0 lg:max-w-none lg:px-8">
        <Link
          to={ROUTES.partnerArea}
          aria-label="Início"
          className="rounded-md lg:hidden"
        >
          <Logo />
        </Link>
        <Text tone="muted" truncate className="flex-1">
          Olá,{" "}
          <Text inline weight="medium" tone="foreground">
            {firstName(user.name)}
          </Text>
        </Text>
        <ThemeToggle />
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="px-2 sm:px-3 lg:hidden"
        >
          <Link to={ROUTES.partnerAreaProfile} title="Perfil">
            <UserRound />
            <Text inline className="sr-only sm:not-sr-only">
              Perfil
            </Text>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          title="Sair"
          className="px-2 sm:px-3"
        >
          <LogOut />
          <Text inline className="sr-only sm:not-sr-only">
            Sair
          </Text>
        </Button>
      </Box>
    </Header>
  );
}
