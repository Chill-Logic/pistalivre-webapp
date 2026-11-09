import { LogOut } from "lucide-react";
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
 * Partner header: greeting, theme and sign out (like the staff's). On the
 * phone it also has the logo home; Perfil lives in the bottom bar (phone) and
 * the sidebar (desktop).
 */
export function PartnerAreaHeader({ user }: { user: AuthUser }) {
  const logout = useLogout();

  return (
    <Header className="sticky top-0 z-30 border-b bg-card/95 pt-safe-t backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <Box className="flex h-14 w-full items-center gap-2 px-4 md:px-8">
        <Link
          to={ROUTES.partnerArea}
          aria-label="Início"
          className="rounded-md md:hidden"
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
