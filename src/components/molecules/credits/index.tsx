import { Text } from "@/components/atoms/text";
import { MAINTAINER, PLATFORM_NAME } from "@/constants/platform";
import { cn } from "@/utils/cn";

type CreditsProps = {
  className?: string;
  /** On the brand panel (white text). */
  inverted?: boolean;
};

/** Who keeps the platform: "© 2026 · Mantido e desenvolvido por Chillogic" (year from the clock). */
export function Credits({ className, inverted = false }: CreditsProps) {
  const year = new Date().getFullYear();
  return (
    <Text
      size="xs"
      title={`Versão ${__APP_COMMIT__} · publicada em ${new Date(__APP_BUILT_AT__).toLocaleString("pt-BR")}`}
      tone={inverted ? undefined : "muted"}
      className={cn(
        "text-balance text-center leading-relaxed",
        inverted && "text-white/70",
        className,
      )}
    >
      © {year}
      {PLATFORM_NAME ? ` ${PLATFORM_NAME}` : ""} · Mantido e desenvolvido por{" "}
      <Text inline size="xs" weight="semibold" className="text-inherit">
        {MAINTAINER}
      </Text>
    </Text>
  );
}
