"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ─── Design tokens ─── */
export const studioGlass =
  "rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.04]";

export const studioGlassHover =
  "transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05] hover:shadow-[0_12px_48px_rgba(0,0,0,0.45)]";

export const studioInput =
  "w-full rounded-xl border border-white/[0.08] bg-black/30 px-3.5 py-2.5 text-sm leading-relaxed text-foreground backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/20";

export const studioLabel =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80";

export const studioChip = (active: boolean) =>
  cn(
    "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
    active
      ? "border-purple/50 bg-purple/15 text-purple shadow-[0_0_20px_rgba(139,92,246,0.15)]"
      : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-foreground",
  );

export const studioChipElectric = (active: boolean) =>
  cn(
    "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
    active
      ? "border-electric/50 bg-electric/15 text-electric shadow-[0_0_20px_rgba(0,102,255,0.15)]"
      : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-foreground",
  );

/* ─── Ambient shell ─── */
export function StudioShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-full">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[30%] h-[500px] w-[500px] rounded-full bg-purple/20 blur-[120px] animate-studio-glow-pulse" />
        <div className="absolute -right-[15%] top-[10%] h-[400px] w-[400px] rounded-full bg-electric/15 blur-[100px] animate-studio-glow-pulse [animation-delay:1.5s]" />
        <div className="absolute bottom-0 left-[30%] h-[300px] w-[600px] rounded-full bg-purple/10 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

/* ─── Glass card ─── */
export function StudioGlassCard({
  children,
  className,
  hover = false,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        studioGlass,
        "relative overflow-hidden",
        hover && studioGlassHover,
        glow && "border-purple/20 shadow-[0_8px_40px_rgba(124,58,237,0.12)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─── Page header ─── */
export function StudioPageHeader({
  title,
  description,
  action,
  badge,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between lg:mb-10">
      <div className="space-y-3 animate-studio-fade-in-up">
        {badge}
        <h1 className="text-3xl font-bold tracking-[-0.02em] lg:text-4xl">{title}</h1>
        {description && (
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 animate-studio-fade-in-up studio-stagger-1">{action}</div>
      )}
    </div>
  );
}

/* ─── Empty state ─── */
export function StudioEmptyState({
  icon: Icon,
  title,
  description,
  variant = "default",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "electric" | "purple";
}) {
  const colors = {
    default: "from-white/10 to-white/5 text-muted-foreground",
    electric: "from-electric/20 to-electric/5 text-electric",
    purple: "from-purple/20 to-purple/5 text-purple",
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center animate-studio-fade-in">
      <div
        className={cn(
          "relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
          colors[variant],
        )}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent" />
        <Icon className="relative h-7 w-7" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1 w-1 rounded-full bg-muted-foreground/30"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
export function StudioSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white/[0.06] animate-studio-shimmer",
        className,
      )}
    />
  );
}

export function StudioSectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4 py-4">
      <StudioSkeleton className="h-4 w-1/3" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <StudioSkeleton className="h-3 w-24" />
            <StudioSkeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Loading state ─── */
export function StudioLoadingState({
  label,
  sublabel,
}: {
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 animate-studio-fade-in">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-purple/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple animate-studio-orbit" />
        <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-purple/20 to-electric/10" />
      </div>
      <div className="space-y-1.5 text-center">
        <p className="text-sm font-medium">{label}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        )}
      </div>
      <div className="w-48 space-y-2">
        <StudioSkeleton className="h-2 w-full" />
        <StudioSkeleton className="h-2 w-3/4 mx-auto" />
      </div>
    </div>
  );
}

/* ─── Pending state ─── */
export function StudioPendingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-studio-fade-in">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-white/10 bg-white/[0.02]">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-studio-glow-pulse" />
      </div>
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/* ─── Alert banners ─── */
export function StudioAlert({
  children,
  variant = "error",
}: {
  children: ReactNode;
  variant?: "error" | "warning";
}) {
  return (
    <p
      className={cn(
        "rounded-xl border px-4 py-3 text-sm animate-studio-fade-in-up",
        variant === "error"
          ? "border-red-500/30 bg-red-500/10 text-red-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400",
      )}
    >
      {children}
    </p>
  );
}

/* ─── List item ─── */
export function StudioListItem({
  href,
  title,
  meta,
  trailing,
  accent = "purple",
}: {
  href: string;
  title: string;
  meta: ReactNode;
  trailing?: ReactNode;
  accent?: "purple" | "electric";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 backdrop-blur-sm transition-all duration-300",
        "hover:border-white/[0.12] hover:bg-white/[0.05] hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)]",
        accent === "purple"
          ? "hover:shadow-purple/5"
          : "hover:shadow-electric/5",
      )}
    >
      <div className="min-w-0 space-y-2.5">
        <p
          className={cn(
            "truncate font-medium transition-colors",
            accent === "purple"
              ? "group-hover:text-purple"
              : "group-hover:text-electric",
          )}
        >
          {title}
        </p>
        <div className="flex flex-wrap items-center gap-2">{meta}</div>
      </div>
      {trailing && (
        <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          {trailing}
        </div>
      )}
    </Link>
  );
}

/* ─── Info blocks ─── */
export function StudioInfoBlock({
  title,
  content,
  className,
}: {
  title: string;
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4",
        className,
      )}
    >
      <p className={studioLabel}>{title}</p>
      <p className="mt-2 text-sm leading-relaxed">{content || "—"}</p>
    </div>
  );
}

export function StudioTagBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className={studioLabel}>{title}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-0.5 text-xs text-foreground/90"
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Brand pill ─── */
export function StudioBrandPill({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-purple/25 bg-purple/10 px-3 py-1 text-xs font-medium text-purple backdrop-blur-sm">
      {children}
    </div>
  );
}

/* ─── Progress mini bar ─── */
export function StudioMiniProgress({ percent }: { percent: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-purple via-electric to-electric transition-all duration-700 ease-out"
        style={{ width: `${percent}%` }}
      >
        {percent > 0 && percent < 100 && (
          <span className="studio-progress-shimmer absolute inset-0" />
        )}
      </div>
    </div>
  );
}
