import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ExternalLink } from "@/components/atoms/external-link";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import { VehicleShowcase } from "@/components/molecules/vehicle-showcase";
import { LEAD_CAPTURE_URL } from "@/constants/landing";
import { useCompany } from "@/hooks/api/gestao/company/useCompany";
import { cn } from "@/utils/cn";

export type LandingHeroProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonLabel: string;
  target: "lead" | "whatsapp";
  align: "left" | "center";
};

/** Top of the page: brand band, the promise and one button. */
export function LandingHeroBlock({
  title,
  subtitle,
  imageUrl,
  buttonLabel,
  target,
  align,
}: LandingHeroProps) {
  const company = useCompany();
  const whatsapp = company.data?.whatsapp;
  const href =
    target === "whatsapp" && whatsapp
      ? `https://wa.me/${whatsapp}`
      : LEAD_CAPTURE_URL;
  const centered = align === "center";

  return (
    <Box className="bg-gradient-to-br from-[#E4141B] via-[#8a0c11] to-[#1a0507] px-4 py-12 text-white md:px-10 md:py-16">
      {/* Centred by a wrapper: `.row` sets its own (negative) margins, which
          win over mx-auto on the row itself. */}
      <Box className="mx-auto max-w-6xl">
        <Row className="items-center gap-y-8">
          <Col
            md={imageUrl && !centered ? 6 : 12}
            className={cn("space-y-4", centered && "text-center")}
          >
            <Heading className="text-3xl md:text-5xl">{title}</Heading>
            <Text size="lg" className="text-white/85">
              {subtitle}
            </Text>
            <Button
              asChild
              size="lg"
              variant="secondary"
             
            >
              <ExternalLink
                href={href}
                className="text-foreground hover:no-underline"
              >
                {buttonLabel}
              </ExternalLink>
            </Button>
          </Col>
          {imageUrl && (
            <Col md={centered ? 12 : 6}>
              <VehicleShowcase
                src={imageUrl}
                alt={title}
                className="rounded-xl from-white/10 via-white/5 to-white/0"
              />
            </Col>
          )}
        </Row>
      </Box>
    </Box>
  );
}
