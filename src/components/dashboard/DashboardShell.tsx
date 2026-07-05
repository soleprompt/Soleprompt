"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Clock,
  DollarSign,
  FileText,
  Flag,
  Heart,
  LayoutDashboard,
  Menu,
  Receipt,
  Settings,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  Tags,
  TrendingUp,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getNavForRole, getRoleLabel } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { DashboardSection } from "@/types/dashboard";
import type { DashboardNavItem } from "@/types/user";

const ICON_MAP = {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Heart,
  Receipt,
  User,
  Clock,
  Settings,
  Upload,
  FileText,
  TrendingUp,
  BarChart3,
  DollarSign,
  Star,
  Users,
  Flag,
  Share2,
  Tags,
} as const;

interface DashboardShellProps {
  children: React.ReactNode;
  section: DashboardSection;
  userName: string;
  extraNavItems?: DashboardNavItem[];
}

export function DashboardShell({
  children,
  section,
  userName,
  extraNavItems = [],
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = getNavForRole(section, extraNavItems);

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-purple">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">SolePrompt</span>
          </Link>
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {getRoleLabel(section)} Dashboard
          </p>
          <p className="mt-1 truncate text-sm text-foreground">{userName}</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href + "/") &&
                item.href !== `/${section}`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-electric/10 font-medium text-electric"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Back to Home
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
