import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SITE, NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";

const FOOTER_LINKS = {
  Marketplace: [
    { label: "New Releases", href: "/explore?sort=newest" },
    { label: "Best Sellers", href: "/explore?sort=popular" },
    { label: "Free AI Tools", href: "/explore?price=free" },
    { label: "Explore All", href: "/explore" },
    { label: "Categories", href: "/categories" },
  ],
  Product: [
    { label: "Free X Checker", href: "/tools/x-checker" },
    { label: "Become a Creator", href: "/seller" },
    { label: "Pricing", href: "#faq" },
    { label: "FAQ", href: "#faq" },
  ],
  Community: [
    { label: "Discord", href: SOCIAL_LINKS.discord },
    { label: "X / Twitter", href: SOCIAL_LINKS.twitter },
    { label: "Become a Seller", href: "#sell" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Licenses", href: "#" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-purple">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                {SITE.name}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {SITE.tagline}. Download AI tools for sales, marketing, business,
              and productivity — starting at free.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {SITE.year} {SITE.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
