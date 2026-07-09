"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BecomeCreatorButton } from "@/components/dashboard/BecomeCreatorButton";
import { NAV_LINKS } from "@/lib/constants";
import { getDashboardPath } from "@/lib/auth";
import type { UserRole } from "@/types/user";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState<UserRole>("buyer");
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const dashboardPath = getDashboardPath(role);
  const showAuth = authLoaded;

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isSignedIn) {
      setRole("buyer");
      return;
    }

    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.role) {
          setRole(data.role);
        }
      })
      .catch(() => {
        setRole("buyer");
      });
  }, [isSignedIn]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-200",
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                "highlight" in link && link.highlight
                  ? "font-medium text-electric hover:text-electric/80"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <BecomeCreatorButton size="sm" variant="outline" />
          <ThemeToggle />
          {showAuth && !isSignedIn && (
            <>
              <SignInButton mode="redirect">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </SignUpButton>
            </>
          )}
          {showAuth && isSignedIn && (
            <>
              <Link
                href={dashboardPath}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {showAuth && isSignedIn && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          )}
          <button
            type="button"
            onClick={toggleMenu}
            className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-full text-foreground active:opacity-70"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "absolute inset-x-0 top-full z-40 md:hidden",
          "transition-[opacity,transform] duration-150 ease-out",
          "transform-gpu will-change-[opacity,transform]",
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        )}
        aria-hidden={!isOpen}
      >
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-background">
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                tabIndex={isOpen ? undefined : -1}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-foreground/5",
                  "highlight" in link && link.highlight
                    ? "font-medium text-electric hover:text-electric/80"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              {showAuth && !isSignedIn && (
                <>
                  <SignInButton mode="redirect">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="redirect">
                    <Button variant="primary" size="sm" className="w-full">
                      Get Started
                    </Button>
                  </SignUpButton>
                </>
              )}
              {showAuth && isSignedIn && (
                <Link href={dashboardPath} onClick={closeMenu} tabIndex={isOpen ? undefined : -1}>
                  <Button variant="primary" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
