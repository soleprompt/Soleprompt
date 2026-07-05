import type { DashboardNavItem, UserRole } from "@/types/user";

export const BUYER_NAV: DashboardNavItem[] = [
  { label: "My Library", href: "/buyer", icon: "BookOpen" },
  { label: "Favorites", href: "/buyer/favorites", icon: "Heart" },
  { label: "Purchase History", href: "/buyer/history", icon: "Receipt" },
  { label: "Account", href: "/buyer/account", icon: "User" },
];

export const SELLER_NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/seller", icon: "LayoutDashboard" },
  { label: "Upload Prompt", href: "/seller/upload", icon: "Upload" },
  { label: "My Prompts", href: "/seller/prompts", icon: "FileText" },
  { label: "Sales", href: "/seller/sales", icon: "TrendingUp" },
  { label: "Analytics", href: "/seller/analytics", icon: "BarChart3" },
  { label: "Earnings", href: "/seller/earnings", icon: "DollarSign" },
  { label: "Reviews", href: "/seller/reviews", icon: "Star" },
  { label: "Settings", href: "/seller/settings", icon: "Settings" },
];

export const ADMIN_NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Prompts", href: "/admin/prompts", icon: "FileText" },
  { label: "Purchases", href: "/admin/purchases", icon: "ShoppingBag" },
  { label: "Sales", href: "/admin/sales", icon: "TrendingUp" },
  { label: "Reports", href: "/admin/reports", icon: "Flag" },
  { label: "Categories", href: "/admin/categories", icon: "Tags" },
  { label: "Social", href: "/admin/social", icon: "Share2" },
];

export function getNavForRole(role: UserRole): DashboardNavItem[] {
  switch (role) {
    case "admin":
      return ADMIN_NAV;
    case "seller":
      return SELLER_NAV;
    default:
      return BUYER_NAV;
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "seller":
      return "Seller";
    default:
      return "Buyer";
  }
}
