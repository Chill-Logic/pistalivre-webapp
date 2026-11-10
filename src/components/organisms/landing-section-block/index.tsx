import type { SlotComponent } from "@puckeditor/core";
import { LandingSectionShell } from "@/components/molecules/landing-section-shell";
import type { LandingSectionStyle, LandingWidth } from "@/types/landing";

export type LandingSectionProps = LandingSectionStyle & {
  width?: LandingWidth;
  /** Blocks dropped inside (any block, Colunas included). */
  content: SlotComponent;
};

/** A band of the page with its own background, holding other blocks. */
export function LandingSectionBlock({ background, spacing, width, backgroundImage, content: Content }: LandingSectionProps) {
  return (
    <LandingSectionShell background={background} spacing={spacing} width={width} imageUrl={backgroundImage}>
      <Content className="flex flex-col gap-8" minEmptyHeight={120} />
    </LandingSectionShell>
  );
}
