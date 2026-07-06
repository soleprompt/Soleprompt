import {
  Briefcase,
  Code2,
  GraduationCap,
  Megaphone,
  PenLine,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type CategorySlug =
  | "productivity"
  | "business"
  | "marketing"
  | "coding"
  | "finance"
  | "writing"
  | "education";

export interface CategoryVisual {
  slug: CategorySlug;
  icon: LucideIcon;
  emoji: string;
  /** Tailwind gradient classes for card headers and chips */
  gradient: string;
  /** Tailwind text color for the icon */
  iconColor: string;
  /** Subtle ring/glow on hover */
  ringColor: string;
}

export const CATEGORY_VISUALS: Record<CategorySlug, CategoryVisual> = {
  productivity: {
    slug: "productivity",
    icon: Zap,
    emoji: "⚡",
    gradient: "from-indigo-500/30 via-violet-500/20 to-purple-600/30",
    iconColor: "text-indigo-400",
    ringColor:
      "group-hover:ring-indigo-500/40 group-focus-visible:ring-indigo-500/40",
  },
  business: {
    slug: "business",
    icon: Briefcase,
    emoji: "💼",
    gradient: "from-sky-500/30 via-cyan-500/20 to-blue-600/30",
    iconColor: "text-sky-400",
    ringColor:
      "group-hover:ring-sky-500/40 group-focus-visible:ring-sky-500/40",
  },
  marketing: {
    slug: "marketing",
    icon: Megaphone,
    emoji: "📣",
    gradient: "from-orange-500/30 via-amber-500/20 to-red-500/30",
    iconColor: "text-orange-400",
    ringColor:
      "group-hover:ring-orange-500/40 group-focus-visible:ring-orange-500/40",
  },
  coding: {
    slug: "coding",
    icon: Code2,
    emoji: "💻",
    gradient: "from-green-500/30 via-emerald-500/20 to-teal-600/30",
    iconColor: "text-green-400",
    ringColor:
      "group-hover:ring-green-500/40 group-focus-visible:ring-green-500/40",
  },
  finance: {
    slug: "finance",
    icon: Wallet,
    emoji: "💰",
    gradient: "from-yellow-500/30 via-amber-500/20 to-orange-500/30",
    iconColor: "text-yellow-400",
    ringColor:
      "group-hover:ring-yellow-500/40 group-focus-visible:ring-yellow-500/40",
  },
  writing: {
    slug: "writing",
    icon: PenLine,
    emoji: "✍️",
    gradient: "from-purple-500/30 via-fuchsia-500/20 to-violet-600/30",
    iconColor: "text-purple-400",
    ringColor:
      "group-hover:ring-purple-500/40 group-focus-visible:ring-purple-500/40",
  },
  education: {
    slug: "education",
    icon: GraduationCap,
    emoji: "🎓",
    gradient: "from-pink-500/30 via-rose-500/20 to-fuchsia-600/30",
    iconColor: "text-pink-400",
    ringColor:
      "group-hover:ring-pink-500/40 group-focus-visible:ring-pink-500/40",
  },
};

const DEFAULT_VISUAL = CATEGORY_VISUALS.marketing;

const ICON_BY_NAME: Record<string, LucideIcon> = {
  Zap,
  Briefcase,
  Megaphone,
  Code2,
  Wallet,
  PenLine,
  GraduationCap,
};

export function getCategoryVisual(slug: string): CategoryVisual {
  if (slug in CATEGORY_VISUALS) {
    return CATEGORY_VISUALS[slug as CategorySlug];
  }
  return DEFAULT_VISUAL;
}

/** Resolve visual from DB icon name when slug is unknown */
export function getCategoryVisualByIcon(iconName: string): CategoryVisual {
  const match = Object.values(CATEGORY_VISUALS).find(
    (v) => v.icon === ICON_BY_NAME[iconName],
  );
  return match ?? DEFAULT_VISUAL;
}
