"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/social", label: "Posts" },
  { href: "/admin/social/replies", label: "Replies" },
] as const;

export function AdminSocialNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin/social"
            ? pathname === "/admin/social"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
