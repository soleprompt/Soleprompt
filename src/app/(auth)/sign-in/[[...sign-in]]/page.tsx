import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-purple">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold">{SITE.name}</span>
        </Link>
        <p className="mt-3 text-sm text-muted-foreground">
          Welcome back. Sign in to your account.
        </p>
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
