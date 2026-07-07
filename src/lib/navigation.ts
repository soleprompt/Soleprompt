import type { DashboardNavItem, UserRole } from "@/types/user";

export const BUYER_NAV: DashboardNavItem[] = [
  { label: "My Library", href: "/buyer", icon: "BookOpen" },
  { label: "Favorites", href: "/buyer/favorites", icon: "Heart" },
  { label: "Recently Viewed", href: "/buyer/recent", icon: "Clock" },
  { label: "Purchase History", href: "/buyer/history", icon: "Receipt" },
  { label: "Account", href: "/buyer/account", icon: "User" },
];

export const BUYER_SCRUBBER_NAV: DashboardNavItem = {
  label: "X Scrubber",
  href: "/buyer/scrubber",
  icon: "Share2",
};

export const BUYER_SOCIAL_TOOLS_NAV: DashboardNavItem = {
  label: "Social Tools",
  href: "/buyer/social",
  icon: "Users",
};

export const AFFILIATE_NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/affiliate", icon: "LayoutDashboard" },
  { label: "Earnings", href: "/affiliate/earnings", icon: "DollarSign" },
  { label: "Referrals", href: "/affiliate/referrals", icon: "Share2" },
  { label: "Leaderboard", href: "/affiliate/leaderboard", icon: "Star" },
  { label: "Marketing Assets", href: "/affiliate/assets", icon: "FileText" },
  { label: "Settings", href: "/affiliate/settings", icon: "Settings" },
];

export const SELLER_NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/seller", icon: "LayoutDashboard" },
  { label: "Upload Tool", href: "/seller/upload", icon: "Upload" },
  { label: "My Products", href: "/seller/prompts", icon: "FileText" },
  { label: "Sales", href: "/seller/sales", icon: "TrendingUp" },
  { label: "Analytics", href: "/seller/analytics", icon: "BarChart3" },
  { label: "Revenue", href: "/seller/earnings", icon: "DollarSign" },
  { label: "Reviews", href: "/seller/reviews", icon: "Star" },
  { label: "Settings", href: "/seller/settings", icon: "Settings" },
];

export const REPLY_ASSISTANT_LABEL = "Reply Assistant";

export const ADMIN_SOCIAL_TABS = [
  { href: "/admin/social", label: "Posts" },
  { href: "/admin/social/replies", label: REPLY_ASSISTANT_LABEL },
  { href: "/admin/social/engage", label: "Engage" },
] as const;

export const ADMIN_NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Prompts", href: "/admin/prompts", icon: "FileText" },
  { label: "Purchases", href: "/admin/purchases", icon: "ShoppingBag" },
  { label: "Sales", href: "/admin/sales", icon: "TrendingUp" },
  { label: "Reports", href: "/admin/reports", icon: "Flag" },
  { label: "Creators", href: "/admin/creators", icon: "Users" },
  { label: "Affiliates", href: "/admin/affiliates", icon: "Share2" },
  { label: "Payouts", href: "/admin/payouts", icon: "DollarSign" },
  { label: "Program Settings", href: "/admin/settings", icon: "Settings" },
  { label: "Anime Ads", href: "/admin/anime-ad", icon: "Star" },
  { label: "Categories", href: "/admin/categories", icon: "Tags" },
  { label: "Social", href: "/admin/social", icon: "Share2" },
];

export function getNavForRole(
  role: UserRole | "affiliate",
  extraItems: DashboardNavItem[] = [],
): DashboardNavItem[] {
  switch (role) {
    case "admin":
      return ADMIN_NAV;
    case "seller":
      return SELLER_NAV;
    case "affiliate":
      return AFFILIATE_NAV;
    default:
      return [...BUYER_NAV.slice(0, 1), ...extraItems, ...BUYER_NAV.slice(1)];
  }
}

export function getRoleLabel(role: UserRole | "affiliate"): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "seller":
      return "Creator";
    case "affiliate":
      return "Affiliate";
    default:
      return "Buyer";
  }
}
