"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function DashboardWelcomeHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 lg:px-6">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-purple">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold">SolePrompt</span>
      </Link>
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
  );
}
