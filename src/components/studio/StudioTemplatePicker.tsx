"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  Clapperboard,
  Flame,
  GraduationCap,
  Package,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import {
  STUDIO_PROJECT_TEMPLATES,
  type StudioProjectTemplate,
  type StudioProjectTemplateId,
} from "@/lib/studio/templates";
import { StudioGlassCard, studioLabel } from "@/components/studio/studio-ui";
import { cn } from "@/lib/utils";

const TEMPLATE_ICONS: Record<StudioProjectTemplateId, LucideIcon> = {
  "faceless-documentary": Clapperboard,
  "ai-news": Bot,
  finance: TrendingUp,
  motivation: Flame,
  "tech-reviews": Smartphone,
  storytelling: BookOpen,
  "product-reviews": Package,
  educational: GraduationCap,
};

type StudioTemplatePickerProps = {
  selectedId: StudioProjectTemplateId | null;
  onSelect: (template: StudioProjectTemplate | null) => void;
  disabled?: boolean;
};

export function StudioTemplatePicker({
  selectedId,
  onSelect,
  disabled = false,
}: StudioTemplatePickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className={studioLabel}>Start from a template</span>
        {selectedId && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(null)}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            Clear template
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STUDIO_PROJECT_TEMPLATES.map((template, index) => {
          const Icon = TEMPLATE_ICONS[template.id];
          const isSelected = selectedId === template.id;

          return (
            <button
              key={template.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(isSelected ? null : template)}
              className={cn(
                "group text-left animate-studio-fade-in-up",
                `studio-stagger-${Math.min(index + 1, 6)}`,
              )}
            >
              <StudioGlassCard
                hover={!disabled}
                className={cn(
                  "h-full p-4 transition-all duration-300",
                  isSelected &&
                    "border-purple/40 bg-purple/10 shadow-[0_0_32px_rgba(139,92,246,0.18)]",
                  disabled && "opacity-60",
                )}
              >
                <div
                  className={cn(
                    "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-105",
                    template.accent === "electric"
                      ? "from-electric/25 to-electric/5 text-electric"
                      : "from-purple/25 to-purple/5 text-purple",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <p className="font-semibold tracking-tight">{template.name}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {template.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-white/[0.08] bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {template.videoType}
                  </span>
                  <span className="rounded-full border border-white/[0.08] bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {template.tone}
                  </span>
                </div>
              </StudioGlassCard>
            </button>
          );
        })}
      </div>
    </div>
  );
}
