import { LogOut } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Header } from "@/components/atoms/landmarks";
import { Text } from "@/components/atoms/text";
import { Logo } from "@/components/molecules/logo";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import { PwaOpenInApp } from "@/components/organisms/pwa-open-in-app";
import { useLogout } from "@/hooks/auth/useLogout";
import type { AuthUser } from "@/types/auth";
import { firstName } from "@/utils/format";

type AppHeaderProps = {
  user: AuthUser;
};

export function AppHeader({ user }: AppHeaderProps) {
  const logout = useLogout();

  return (
    <Header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card/95 px-4 pt-safe-t backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <Logo className="md:hidden" />
      <Text tone="muted" truncate className="flex-1">
        Olá,{" "}
        <Text inline weight="medium" tone="foreground">
          {firstName(user.name)}
        </Text>
      </Text>
      <PwaOpenInApp user={user} />
      <Box className="hidden md:flex">
        <ThemeToggle />
      </Box>
      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        aria-label="Sair"
        title="Sair"
        className="hidden md:inline-flex"
      >
        <LogOut />
      </Button>
    </Header>
  );
}
