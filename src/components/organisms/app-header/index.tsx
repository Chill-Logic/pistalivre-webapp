import { LogOut } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Logo } from "@/components/atoms/logo";
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card/95 px-4 pt-safe-t backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <Logo className="md:hidden" withName={false} />
      <p className="flex-1 truncate text-sm text-muted-foreground">
        Olá,{" "}
        <span className="font-medium text-foreground">
          {firstName(user.name)}
        </span>
      </p>
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
    </header>
  );
}
