import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Text } from "@/components/atoms/text";
import {
  aiGuide,
  findGuideTarget,
  useAiGuideSpot,
} from "@/hooks/ui/useAiGuide";

type Rect = { top: number; left: number; width: number; height: number };

/** Long enough for a page to load its data and render the section. */
const FIND_TIMEOUT_MS = 10_000;
const ANCHOR_WAIT_MS = 4_000;
/** While the page finishes loading (skeletons → data), keep the section centered. */
const SETTLE_MS = 3_500;
const PAD = 6;
const BUBBLE_WIDTH = 320;

/** A section taller than the screen goes to the top (its title in view); a small one, to the center. */
const blockFor = (box: DOMRect): ScrollLogicalPosition =>
  box.height > window.innerHeight * 0.6 ? "start" : "center";

/**
 * Is the section away from where the guide put it? (tall: its top near the
 * top; small: its middle near the middle) — and could the page still move
 * it there (not stuck at the very top or bottom).
 */
function offTarget(box: DOMRect): boolean {
  const viewport = window.innerHeight;
  const tall = box.height > viewport * 0.6;
  const want = tall ? 96 : viewport / 2;
  const at = tall ? box.top : box.top + box.height / 2;
  if (Math.abs(at - want) < 48) return false;
  const page = document.scrollingElement ?? document.documentElement;
  const canGoDown = page.scrollTop + viewport < page.scrollHeight - 2;
  const canGoUp = page.scrollTop > 2;
  return at > want ? canGoDown : canGoUp;
}

const samePath = (route: string, pathname: string) =>
  route.split("?")[0].replace(/\/$/, "") === pathname.replace(/\/$/, "");

/**
 * The assistant pointing at the screen: a ring around the section (or field)
 * and a bubble saying what it is, over the page without blocking it. Goes to
 * the step's page first (a tour across screens), waits for the section to
 * render, scrolls to it and follows it while the page moves.
 */
export function AiSpotlight() {
  const spot = useAiGuideSpot();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [rect, setRect] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);

  // The step's page.
  useEffect(() => {
    if (spot?.route && !samePath(spot.route, pathname)) navigate(spot.route);
  }, [spot, pathname, navigate]);

  // Find the target (it may still be loading), scroll to it, follow it.
  useEffect(() => {
    setRect(null);
    setMissing(false);
    if (!spot) return;
    if (spot.route && !samePath(spot.route, pathname)) return;
    let frame = 0;
    let scrolled = false;
    // While the page finishes loading (skeletons → data, smooth scroll cut
    // short by the layout changing), keep checking that the section is where
    // it should be on screen and put it back — unless the person scrolled.
    let settleUntil = 0;
    let lastScroll = 0;
    let handScrolled = false;
    const byHand = () => (handScrolled = true);
    const handEvents = ["wheel", "touchmove", "keydown"] as const;
    handEvents.forEach((name) =>
      window.addEventListener(name, byHand, { passive: true }),
    );
    const started = Date.now();
    const tick = () => {
      // A section may take a while to load: the fallback only after a bit.
      const el = findGuideTarget(
        spot.target,
        Date.now() - started > ANCHOR_WAIT_MS,
      );
      if (el) {
        const box = el.getBoundingClientRect();
        const now = Date.now();
        if (!scrolled) {
          el.scrollIntoView({ behavior: "smooth", block: blockFor(box) });
          scrolled = true;
          lastScroll = now;
          settleUntil = now + SETTLE_MS;
        } else if (
          !handScrolled &&
          now < settleUntil &&
          now - lastScroll > 450 &&
          offTarget(box)
        ) {
          // Instant: a smooth one would be cut short again by the next change.
          el.scrollIntoView({ behavior: "auto", block: blockFor(box) });
          lastScroll = now;
        }
        setRect((previous) =>
          previous &&
          previous.top === box.top &&
          previous.left === box.left &&
          previous.width === box.width &&
          previous.height === box.height
            ? previous
            : {
                top: box.top,
                left: box.left,
                width: box.width,
                height: box.height,
              },
        );
      } else if (Date.now() - started > FIND_TIMEOUT_MS) {
        setMissing(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      handEvents.forEach((name) => window.removeEventListener(name, byHand));
    };
  }, [spot, pathname]);

  useEffect(() => {
    if (!spot) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") aiGuide.clear();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [spot]);

  if (!spot || (!rect && !missing)) return null;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const width = Math.min(BUBBLE_WIDTH, viewportW - 32);
  const below = rect ? rect.top + rect.height + PAD + 12 : 0;
  const placeBelow = rect ? below + 180 < viewportH : true;
  // No room below nor above (a tall section): the bubble sits inside it, at
  // the top-right of what is on screen, always visible.
  const placeAbove = rect ? rect.top - PAD - 12 > 180 : false;
  const bubbleStyle = rect
    ? placeBelow
      ? {
          width,
          left: Math.min(Math.max(16, rect.left), viewportW - width - 16),
          top: below,
        }
      : placeAbove
        ? {
            width,
            left: Math.min(Math.max(16, rect.left), viewportW - width - 16),
            bottom: viewportH - rect.top + PAD + 12,
          }
        : {
            width,
            left: Math.min(
              Math.max(16, rect.left + rect.width - width - 12),
              viewportW - width - 16,
            ),
            top: Math.max(72, rect.top + 12),
          }
    : { width, left: (viewportW - width) / 2, bottom: 96 };

  return (
    <>
      {rect && (
        <Box
          aria-hidden
          className="pointer-events-none fixed z-[60] rounded-lg ring-4 ring-primary/70 transition-all duration-300 motion-safe:animate-pulse"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
        />
      )}
      <Card
        role="status"
        aria-live="polite"
        className="fixed z-[60] space-y-2 rounded-xl p-3 shadow-2xl duration-200 animate-in fade-in-0 zoom-in-95"
        style={bubbleStyle}
      >
        <Box className="flex items-start gap-2">
          <Sparkles
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden
          />
          <Box className="min-w-0 flex-1 space-y-1">
            <Text size="sm" weight="semibold">
              {spot.title}
            </Text>
            <Text size="sm">
              {missing
                ? `${spot.text} (Não encontrei essa parte na tela agora.)`
                : spot.text}
            </Text>
          </Box>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-1 -mt-1 size-7 shrink-0"
            aria-label="Fechar o guia"
            onClick={() => aiGuide.clear()}
          >
            <X />
          </Button>
        </Box>
        <Box className="flex items-center justify-between gap-2">
          <Text size="xs" tone="muted">
            {spot.step ? `${spot.step.index} de ${spot.step.total}` : ""}
          </Text>
          {spot.next ? (
            <Button type="button" size="sm" onClick={spot.next.run}>
              {spot.next.label}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => aiGuide.clear()}
            >
              Entendi
            </Button>
          )}
        </Box>
      </Card>
    </>
  );
}
