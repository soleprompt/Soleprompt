import { cn } from "@/lib/utils";

type GlowVariant = "hero" | "section" | "cta";

interface SectionGlowProps {
  variant?: GlowVariant;
  className?: string;
  children?: React.ReactNode;
}

/** Subtle purple/cyan brand atmosphere — light trails, grid, soft orbs */
export function SectionGlow({
  variant = "section",
  className,
  children,
}: SectionGlowProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "hero"
              ? "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,102,255,0.14) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 100% 20%, rgba(168,85,247,0.12) 0%, transparent 50%)"
              : "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(0,102,255,0.08) 0%, transparent 55%), radial-gradient(ellipse 60% 45% at 90% 80%, rgba(139,92,246,0.08) 0%, transparent 50%)",
        }}
        aria-hidden
      />

      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
        aria-hidden
      />

      <svg
        className="absolute -bottom-8 left-0 h-40 w-full opacity-30 dark:opacity-40"
        viewBox="0 0 1200 120"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 80 C200 20 400 100 600 60 C800 20 1000 90 1200 50 L1200 120 L0 120 Z"
          fill="url(#glow-wave)"
          fillOpacity="0.15"
        />
        <path
          d="M0 95 Q300 40 600 75 T1200 65"
          stroke="url(#glow-line)"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />
        <defs>
          <linearGradient id="glow-wave" x1="0" y1="0" x2="1200" y2="0">
            <stop stopColor="#0066ff" stopOpacity="0" />
            <stop offset="0.35" stopColor="#0066ff" />
            <stop offset="0.65" stopColor="#a855f7" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="glow-line" x1="0" y1="0" x2="1200" y2="0">
            <stop stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="0.5" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#c084fc" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {variant === "cta" && (
        <>
          <div className="absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-purple/15 blur-[100px]" />
          <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-[90px]" />
        </>
      )}

      {children}
    </div>
  );
}
