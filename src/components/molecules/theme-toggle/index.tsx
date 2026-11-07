import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useTheme } from "@/hooks/ui/useTheme";
import type { Theme } from "@/helpers/theme";

const THEME_META: Record<Theme, { label: string; icon: typeof Sun }> = {
  light: { label: "Tema claro", icon: Sun },
  dark: { label: "Tema escuro", icon: Moon },
  system: { label: "Tema do sistema", icon: Monitor },
};

export function ThemeToggle() {
  const { theme, cycle } = useTheme();
  const { label, icon: Icon } = THEME_META[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={label}
      title={label}
    >
      <Icon />
    </Button>
  );
}
