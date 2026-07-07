"use client";

import { motion } from "framer-motion";
import { ChevronsLeftRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const DEFAULT_SPLIT = 0.32;
const PROXIMITY_PX = 96;

interface BeforeAfterProps {
  title: string;
  beforeLabel: string;
  afterLabel: string;
  before: React.ReactNode;
  after: React.ReactNode;
}

function BeforeAfterCard({
  title,
  beforeLabel,
  afterLabel,
  before,
  after,
}: BeforeAfterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [split, setSplit] = useState(DEFAULT_SPLIT);
  const [engaged, setEngaged] = useState(false);
  const [touchAfter, setTouchAfter] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setCanHover(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const updateSplitFromClientX = useCallback((clientX: number) => {
    const preview = previewRef.current;
    if (!preview) return;
    const rect = preview.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    setSplit(Math.min(0.95, Math.max(0.05, pct)));
  }, []);

  useEffect(() => {
    if (!canHover) return;

    const onMove = (event: MouseEvent) => {
      const preview = previewRef.current;
      if (!preview) return;

      const rect = preview.getBoundingClientRect();
      const near =
        event.clientX >= rect.left - PROXIMITY_PX &&
        event.clientX <= rect.right + PROXIMITY_PX &&
        event.clientY >= rect.top - PROXIMITY_PX &&
        event.clientY <= rect.bottom + PROXIMITY_PX;

      if (near) {
        setEngaged(true);
        updateSplitFromClientX(event.clientX);
      } else {
        setEngaged(false);
        setSplit(DEFAULT_SPLIT);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [canHover, updateSplitFromClientX]);

  const effectiveSplit = canHover
    ? split
    : touchAfter
      ? 0.85
      : 0.15;

  const splitPercent = effectiveSplit * 100;

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (canHover) return;
    touchStartRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
    previewRef.current?.setPointerCapture(event.pointerId);
    updateSplitFromClientX(event.clientX);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (canHover || !isDragging) return;
    updateSplitFromClientX(event.clientX);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (canHover) return;

    previewRef.current?.releasePointerCapture(event.pointerId);
    setIsDragging(false);

    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 8) {
      setTouchAfter((prev) => !prev);
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-5 backdrop-blur-sm transition-[border-color,box-shadow] duration-500",
        engaged && "border-electric/30 shadow-[0_0_40px_-12px_rgba(0,102,255,0.35)]",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
          engaged && "opacity-100",
        )}
        style={{
          background:
            "linear-gradient(135deg, rgba(248,113,113,0.06) 0%, transparent 45%, rgba(52,211,153,0.06) 100%)",
        }}
      />

      <h3 className="relative mb-4 text-center text-sm font-semibold text-foreground">
        {title}
      </h3>

      <div
        ref={previewRef}
        className="relative touch-none select-none overflow-hidden rounded-xl border border-white/5 bg-[#0c0c12]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="img"
        aria-label={`${title}: drag or tap to compare ${beforeLabel} and ${afterLabel}`}
      >
        <div className="relative p-3">
          <p
            className={cn(
              "mb-2 text-[10px] font-medium uppercase tracking-wide text-red-400/90 transition-opacity duration-300",
              effectiveSplit > 0.55 && "opacity-40",
            )}
          >
            {beforeLabel}
          </p>
          {before}
        </div>

        <div
          className="absolute inset-0 transition-[clip-path] duration-300 ease-out"
          style={{ clipPath: `inset(0 0 0 ${splitPercent}%)` }}
        >
          <div className="h-full bg-[#0c0c12] p-3">
            <p
              className={cn(
                "mb-2 text-[10px] font-medium uppercase tracking-wide text-emerald-400/90 transition-opacity duration-300",
                effectiveSplit < 0.45 && "opacity-40",
              )}
            >
              {afterLabel}
            </p>
            {after}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 z-10 transition-[left] duration-300 ease-out"
          style={{ left: `${splitPercent}%` }}
        >
          <div className="absolute inset-y-0 -translate-x-1/2">
            <div
              className="absolute inset-y-0 left-1/2 w-16 -translate-x-full"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(248,113,113,0.18), rgba(0,102,255,0.45))",
              }}
            />
            <div
              className="absolute inset-y-0 left-1/2 w-16"
              style={{
                background:
                  "linear-gradient(to left, transparent, rgba(52,211,153,0.18), rgba(124,58,237,0.35))",
              }}
            />
            <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-electric to-transparent shadow-[0_0_12px_rgba(0,102,255,0.8)]" />

            <div
              className={cn(
                "absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-electric/60 bg-background/90 shadow-[0_0_16px_rgba(0,102,255,0.45)] backdrop-blur-sm transition-transform duration-300",
                engaged && "scale-110",
              )}
            >
              <ChevronsLeftRight className="h-3.5 w-3.5 text-electric" aria-hidden />
            </div>
          </div>
        </div>

        {!canHover && (
          <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[9px] text-muted-foreground/70">
            Tap to toggle · drag to scrub
          </p>
        )}
      </div>
    </div>
  );
}

function TweetMockup({ messy }: { messy: boolean }) {
  const tweets = messy
    ? [
        "ugh mondays 😤",
        "hot take: clients suck",
        "party pics 🍻",
      ]
    : [
        "3 posts flagged for review",
        "Reputation score: 92/100",
        "Export-ready cleanup report",
      ];

  return (
    <div className="space-y-1.5">
      {tweets.map((text) => (
        <div
          key={text}
          className={cn(
            "rounded-md px-2 py-1.5 text-[10px] leading-snug",
            messy
              ? "bg-red-500/10 text-red-200/80 line-through decoration-red-400/50"
              : "bg-emerald-500/10 text-emerald-100/90",
          )}
        >
          {text}
        </div>
      ))}
    </div>
  );
}

function BillMockup({ messy }: { messy: boolean }) {
  return messy ? (
    <div className="text-[10px] text-muted-foreground">
      <p className="font-medium text-foreground">Electric Bill — Jan</p>
      <p className="mt-1 text-lg font-bold text-red-400">$284.50</p>
      <p className="mt-1">Usage: 1,240 kWh</p>
      <p className="text-red-400/70">↑ 18% vs last year</p>
    </div>
  ) : (
    <div className="text-[10px]">
      <p className="font-medium text-emerald-300">Solar ROI Estimate</p>
      <p className="mt-1 text-lg font-bold text-emerald-400">$1,840/yr saved</p>
      <p className="text-emerald-200/70">Payback: 6.2 years</p>
      <p className="text-emerald-200/70">25-yr savings: $46k</p>
    </div>
  );
}

function EmailMockup({ messy }: { messy: boolean }) {
  return messy ? (
    <div className="text-[10px] text-muted-foreground">
      <p className="text-red-300/80">hey saw ur company online</p>
      <p className="mt-1">we do marketing stuff lol</p>
      <p className="mt-1">lmk if u want 2 chat!!!</p>
    </div>
  ) : (
    <div className="text-[10px] text-emerald-100/90">
      <p className="font-medium text-emerald-300">Subject: Quick idea for Acme Co.</p>
      <p className="mt-1.5 leading-relaxed">
        Hi Sarah — I noticed Acme&apos;s recent product launch. We helped similar
        teams increase qualified leads 34% in 90 days…
      </p>
    </div>
  );
}

export function BeforeAfterShowcase() {
  return (
    <section className="border-y border-border bg-muted/20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="See the difference"
          title="From messy input to polished output"
          description="Every tool is designed to turn real-world inputs into work-ready results."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <BeforeAfterCard
              title="X Account Checker"
              beforeLabel="Before"
              afterLabel="After"
              before={<TweetMockup messy />}
              after={<TweetMockup messy={false} />}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <BeforeAfterCard
              title="Solar ROI Calculator"
              beforeLabel="Before"
              afterLabel="After"
              before={<BillMockup messy />}
              after={<BillMockup messy={false} />}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <BeforeAfterCard
              title="Cold Email Generator"
              beforeLabel="Before"
              afterLabel="After"
              before={<EmailMockup messy />}
              after={<EmailMockup messy={false} />}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
