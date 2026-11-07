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

/** Portal header: no sidebar — logo home, greeting, theme and sign out. */
export function PortalHeader({ user }: { user: AuthUser }) {
  const logout = useLogout();

  return (
    <Header className="sticky top-0 z-30 border-b bg-card/95 pt-safe-t backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <Box className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-4">
        <Link to={ROUTES.portal} aria-label="Início" className="rounded-md">
          <Logo withName={false} />
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
          size="icon"
          onClick={logout}
          aria-label="Sair"
          title="Sair"
        >
          <LogOut />
        </Button>
      </Box>
    </Header>
  );
}
