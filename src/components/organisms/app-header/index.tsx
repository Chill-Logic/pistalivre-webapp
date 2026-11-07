import { LogOut } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Header } from "@/components/atoms/landmarks";
import { Text } from "@/components/atoms/text";
import { Logo } from "@/components/molecules/logo";
import { SidebarMobileToggle } from "@/components/molecules/sidebar-mobile-toggle";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
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
      <SidebarMobileToggle />
      <Logo className="md:hidden" withName={false} />
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
    </Header>
  );
}
