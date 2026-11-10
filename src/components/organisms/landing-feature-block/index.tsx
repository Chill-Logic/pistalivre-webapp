import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import { FEATURE_ICONS } from "@/constants/landing-icons";
import { cn } from "@/utils/cn";

export type LandingFeatureProps = {
  icon: string;
  title: string;
  text: string;
  style: "card" | "plain";
};

/** One advantage: icon, short title and a line of text (made for Colunas). */
export function LandingFeatureBlock({ icon, title, text, style }: LandingFeatureProps) {
  const Icon = (FEATURE_ICONS[icon] ?? FEATURE_ICONS.check).icon;
  return (
    <Box
      className={cn(
        "h-full space-y-3",
        style === "card" && "rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
      )}
    >
      <Box className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </Box>
      <Heading level={3} className="text-lg">
        {title}
      </Heading>
      <Text tone="muted">{text}</Text>
    </Box>
  );
}
